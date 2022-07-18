import {
	addBgForLetter,
	appendRoomElement, clearRoomName,
	clearRooms, displayGameTimer, getRoomName, hideGameTimer, hideText, removeRoomElement, saveRoomName,
	setRoomName, showBtns,
	showRoomPage,
	showRoomsPage, startTimer, underlineFirstLetter,
	updateNumberOfUsersInRoom
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
	const roomName = prompt('Room name');
	if (!roomName) {
		return;
	}
	try {
		await requestService.createRoom(roomName)
	} catch (e) {
		alert(e.message);
		return;
	}
	appendRoomElement({
		name: roomName,
		numberOfUsers: 0,
		onJoin: joinButtonHandler
	});
	await joinTheRoom(roomName);
	roomsSocket.emit('room_created', { roomName: roomName });
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

roomsSocket.on('remove_room', async (removeRoomEv) => {
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

roomsSocket.on('start_timer', async (timerSettings) => {
	const textId = timerSettings.textId;
	const textResponse = await requestService.getTextById(textId);
	const text = textResponse.text;
	const res = startTimer(
		timerSettings.timeToGame,
		timerSettings.gameTime,
		text
	);
	res.then(timerResponse => {
		handleGame(timerResponse.text, timerResponse.gameDuration);
	});
});

roomsSocket.on('set_user_progress', (evData) => {
	setProgress({
		username: evData.user,
		progress: evData.progress
	});
});

const startGameTimer = (seconds) => {
	displayGameTimer();
	const secondsEl = document.getElementById('game-timer-seconds');
	let secondsLeft = seconds;
	secondsEl.innerText = secondsLeft;
	return setInterval(
		() => {
			secondsLeft -= 1;
			secondsEl.innerText = secondsLeft;
		},
		1000
	);
}

const handleGame = (text, gameTime) => {
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
	const gameTimerId = startGameTimer(gameTime);

	const timeout = setTimeout(() => {
		hideGameTimer();
		hideText();
		clearInterval(gameTimerId);
		roomsSocket.emit('game_finished', getRoomName());
	}, gameTime * 1000);

	roomsSocket.on('game_finished_early', (data) => {
		clearTimeout(timeout);
		clearInterval(gameTimerId);
		hideGameTimer();
		hideText();
		resultStage(data.users)
		document.removeEventListener('keyup', handlePress);
	});

	roomsSocket.on('game_finished', (data) => {
		resultStage(data.users)
		document.removeEventListener('keyup', handlePress);
	});

	document.addEventListener('keyup', handlePress);
}

const resultStage = (users) => {
	showResultsModal({
		usersSortedArray: users,
		onClose: showBtns
	});
	resetUsers();
}

createRoomBtn.addEventListener('click', onCreateRoom);

