import {showInputModal, showMessageModal} from "./views/modal.mjs";
import {appendRoomElement, updateNumberOfUsersInRoom} from "./views/room.mjs";
import {appendUserElement, changeReadyStatus, removeUserElement} from "./views/user.mjs";

const username = sessionStorage.getItem('username');
if (!username) {
    window.location.replace('/login');
}

const socket = io('localhost:3002/game');

socket.on('connect', () => {
    console.log('connected');
});

socket.on('username-taken', () => {
    showMessageModal({
        message: 'Username is taken', onClose: () => {
            window.location.replace('/login')
            sessionStorage.removeItem('username');
        }
    });
});

document.querySelector('#add-room-btn').addEventListener('click', () => {
    showInputModal({
        title: 'Enter room name',
        onChange: () => {
            // socket.emit('create-room', value);
        },
        onSubmit: (name) => {
            socket.emit('check-room', name)
            addRoomFn(name);
            socket.emit('add-room', name);
            joinRoomFn(name);
            socket.emit('join-room', name);

            console.log(name + " onsubmit");
        }
    });
});
socket.on('room-taken', () => {
    showMessageModal({
        message: 'Room is taken already', onClose: () => {
        }
    });
});

socket.on('update-rooms', rooms => {
    const allRooms = rooms.map(room => addRoomFn(room));
    const roomsContainer = document.querySelector('#rooms-wrapper');
    roomsContainer.innerHTML = "";
    roomsContainer.append(...allRooms);
});

const addRoomFn = (romName) => {
    console.log(romName + " add-room");
    appendRoomElement({
        name: romName, numberOfUsers: 0, onJoin: () => {
            socket.emit('join-room', romName);
            document.querySelector('#rooms-page').classList.add('display-none');
            document.querySelector('#game-page').classList.remove('display-none');
            document.querySelector('#room-name').innerHTML = romName;
        }
    });
}

const joinRoomFn = (roomName) => {
    console.log(roomName + " join-room");
    appendUserElement({username: username, ready: false, isCurrentUser: true});
    document.querySelector('#rooms-page').classList.add('display-none');
    document.querySelector('#game-page').classList.remove('display-none');
    document.querySelector('#room-name').innerHTML = roomName;
    document.querySelector('#ready-btn').addEventListener('click', () => {

        if(document.querySelector('#ready-btn').textContent === 'Ready') {
            socket.emit('not-ready', username);
            document.querySelector('#ready-btn').textContent = 'Not ready';
            changeReadyStatus({username: username,ready: false});
        } else{
            socket.emit('ready', username);
            document.querySelector('#ready-btn').textContent = 'Ready';
            changeReadyStatus({username: username,ready: true});
        }
    });
    document.querySelector('#quit-room-btn').addEventListener('click', () => {
        socket.emit('quit-room', roomName);
        document.querySelector('#rooms-page').classList.remove('display-none');
        document.querySelector('#game-page').classList.add('display-none');
        removeUserElement(username);
    });
}
