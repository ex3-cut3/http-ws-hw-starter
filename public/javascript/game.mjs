import {
	addBgForLetter,
	appendRoomElement,
	clearRoomName,
	clearRooms,
	displayGameTimer, displayText,
	getRoomName,
	hideGameTimer,
	hideText,
	hideTimerBeforeGame,
	removeRoomElement,
	saveRoomName,
	setRoomName,
	showBtns,
	showRoomPage,
	showRoomsPage,
	timerBeforeGameStarted,
	underlineFirstLetter, updateGameTimer,
	updateNumberOfUsersInRoom,
	updateTimerBeforeGame
} from "./views/room.mjs";
import requestService from "./helpers/requestService.js";
import {
	appendUserElement,
	cleanUsersList,
	getReadyStatus,
	removeUserElement, resetUsers, setProgress, updateReadyBtnTextForCurrUser,
	updateReadyStatus
} from "./views/user.mjs";
import {showResultsModal} from "./views/modal.mjs";

const username = sessionStorage.getItem('username');

if (!username) {
	window.location.replace('/login');
}

const socket = io('ws://localhost:3002', { query: { username } });

const goToTheRoom = (roomName) => {
	roomsSocket.emit('join_room', roomName);
	showRoomPage(roomName);
	setRoomName(roomName);
	saveRoomName(roomName);
	const roomQuitBtn = document.getElementById('quit-room-btn');
	roomQuitBtn.addEventListener('click', quitRoomHandler);
}

const readyBtnHandler = () => {
	updateReadyStatus(username);
	roomsSocket.emit('update_ready_status', {
		user: username,
		value: getReadyStatus(username),
		roomName: getRoomName()
	});
	updateReadyBtnTextForCurrUser(username);
}

const joinTheRoom = async (roomName) => {
	goToTheRoom(roomName);
	const response = await requestService.getUsersInTheRoom(roomName);
	const usersInRoom = response.users;

	usersInRoom.forEach((user) => {
		const isCurrentUser = user.name === username;
		appendUserElement({
			username: user.name,
			ready: user.isReady,
			isCurrentUser: isCurrentUser
		});
	});

	const readyBtn = document.getElementById('ready-btn');
	readyBtn.addEventListener('click', readyBtnHandler);
}

const joinButtonHandler = async (e) => {
	const joinRoomName = e.currentTarget.getAttribute('data-room-name');
	const canJoinRes = await requestService.canJoin(joinRoomName);
	const canJoinValue = canJoinRes.canJoin;
	if (!canJoinValue) {
		alert(`You can't join to the room - '${joinRoomName}'!`);
		return;
	}
	await joinTheRoom(joinRoomName);
}

const initRooms = async () => {
	const roomsRes = await requestService.getRooms();
	const rooms = roomsRes?.rooms ?? [];
	if (rooms.length) {
		rooms.forEach((room) => {
			appendRoomElement({
				name: room.name,
				numberOfUsers: room.users.length,
				onJoin: joinButtonHandler
			});
		})
	}
}

const roomsSocket = io('/rooms', { query: { username } });

const createRoomBtn = document.getElementById('add-room-btn');

const quitRoomHandler = async () => {
	const roomName = document.getElementById('room-name');
	roomsSocket.emit('left_room', roomName.innerText);
	cleanUsersList();
	const readyBtn = document.getElementById('ready-btn');
	readyBtn.removeEventListener('click', readyBtnHandler);
	clearRoomName();
	showRoomsPage();
	clearRooms();
	await initRooms();
}

const onCreateRoom = async () => {
	const roomName = prompt('Room name!');
	if (!roomName) {
		return;
	}
	try {
		await requestService.createRoom(roomName);
	} catch (e) {
		alert(e.message);
		return;
	}
	appendRoomElement({
		name: roomName,
		numberOfUsers: 0,
		onJoin: joinButtonHandler
	});
	roomsSocket.emit('room_created', { roomName: roomName });
	await joinTheRoom(roomName);
}

(async function () {
	await initRooms();
})();

roomsSocket.on('add_room', async (updateRoomsEvent) => {
	const room = updateRoomsEvent.roomData;
	appendRoomElement({
		name: room.name,
		numberOfUsers: room.users.length,
		onJoin: joinButtonHandler
	});
});

roomsSocket.on('remove_room', (removeRoomEv) => {
	removeRoomElement(removeRoomEv.roomName);
});

roomsSocket.on('update_counters', (updateCountersEvent) => {
	updateNumberOfUsersInRoom({
		name: updateCountersEvent.roomName,
		numberOfUsers: updateCountersEvent.counter
	});
});

roomsSocket.on('add_users_list', (newUser) => {
	appendUserElement({
		username: newUser.name,
		isReady: newUser.isReady,
		isCurrentUser: newUser.name === username
	});
});

roomsSocket.on('delete_users_list', (newUser) => {
	removeUserElement(newUser.name);
});

roomsSocket.on('update_ready_status', ({ user }) => {
	updateReadyStatus(user);
});

roomsSocket.on('timer_before_game_started', () => {
	timerBeforeGameStarted();
});

roomsSocket.on('update_timer_before_game', (evData) => {
	updateTimerBeforeGame(evData.timeToGame);
});

roomsSocket.on('game_started', (ev) => {
	hideTimerBeforeGame();
	displayGameTimer();
	handleGameNew(ev.text);
});

roomsSocket.on('update_game_timer', (ev) => {
	updateGameTimer(ev.secondsToEnd);
});

roomsSocket.on('set_user_progress', (evData) => {
	setProgress({
		username: evData.user,
		progress: evData.progress
	});
});

const handleGameNew = (text) => {
	displayText(text);
	let currentPhrase = '';
	let currentPosition = 0;
	let currentProgress = 0;
	const textLength = text.length;
	underlineFirstLetter();
	const handlePress = (e) => {
		if (e.key === text[currentPosition]) {
			addBgForLetter(currentPosition);
			currentPhrase += e.key;
			currentPosition += 1;
			currentProgress = currentPhrase.length / textLength * 100;
			setProgress({ username: username, progress: currentProgress });
			roomsSocket.emit('set_user_progress', {
				user: username,
				progress: currentProgress,
				roomName: getRoomName()
			});
		}
	}

	roomsSocket.on('game_finished_early', (evData) => {
		document.removeEventListener('keydown', handlePress);
		hideGameTimer();
		hideText();
		resultStage(evData.users);
		roomsSocket.emit('game_finished_early');
	});

	roomsSocket.on('game_finished', (evData) => {
		document.removeEventListener('keydown', handlePress);
		console.log(evData);
		hideGameTimer();
		hideText();
		resultStage(evData.users);
		// spent huge amount of time understanding why i receive +1 modal after the end of the game -_-
		roomsSocket.removeAllListeners('game_finished');
	});

	document.addEventListener('keydown', handlePress);
}

const resultStage = (users) => {
	showResultsModal({
		usersSortedArray: users,
		onClose: showBtns
	});
	resetUsers();
}

createRoomBtn.addEventListener('click', onCreateRoom);

