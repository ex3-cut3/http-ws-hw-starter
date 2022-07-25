import { createElement } from '../helpers/domHelper.mjs';

const clearRooms = () => {
	const roomsContainer = document.querySelector('#rooms-wrapper');
	roomsContainer.innerHTML = '';
}

const appendRoomElement = ({ name, numberOfUsers, onJoin = () => {} }) => {
	const roomsContainer = document.querySelector('#rooms-wrapper');

	const nameElement = createElement({
		tagName: 'div',
		className: 'room-name',
		attributes: { 'data-room-name': name },
		innerElements: [name],
	});

	const numberOfUsersString = getNumberOfUsersString(numberOfUsers);
	const connectedUsersElement = createElement({
		tagName: 'div',
		className: 'connected-users',
		attributes: { 'data-room-name': name, 'data-room-number-of-users': numberOfUsers },
		innerElements: [numberOfUsersString],
	});

	const joinButton = createElement({
		tagName: 'button',
		className: 'join-btn',
		attributes: { 'data-room-name': name },
		innerElements: ['Join'],
	});

	const roomElement = createElement({
		tagName: 'div',
		className: 'room',
		attributes: { 'data-room-name': name },
		innerElements: [nameElement, connectedUsersElement, joinButton],
	});

	roomsContainer.append(roomElement);
	joinButton.addEventListener('click', onJoin);

	return roomElement;
};

const updateNumberOfUsersInRoom = ({ name, numberOfUsers }) => {
	const roomConnectedUsersElement = document.querySelector(`.connected-users[data-room-name='${name}']`);
	if (roomConnectedUsersElement) {
		roomConnectedUsersElement.innerText = getNumberOfUsersString(numberOfUsers);
		roomConnectedUsersElement.dataset.roomNumberOfUsers = numberOfUsers;
	}
};

const getNumberOfUsersString = numberOfUsers => `${numberOfUsers} connected`;

const removeRoomElement = name => {
	const roomEl = document.querySelector(`.room[data-room-name='${name}']`);
	if (roomEl) {
		roomEl.remove();
	}
}

const showRoomPage = () => {
	const roomPage = document.getElementById('rooms-page');
	roomPage.classList.add('display-none');
	const gamePage = document.getElementById('game-page');
	gamePage.classList.remove('display-none');
}

const setRoomName = (roomName) => {
	const roomNameEl = document.getElementById('room-name');
	roomNameEl.innerText = roomName;
}

const saveRoomName = (roomName) => {
	localStorage.setItem('roomName', roomName);
}

const clearRoomName = () => {
	localStorage.removeItem('roomName');
}

const getRoomName = () => {
	return localStorage.getItem('roomName');
}

const showRoomsPage = () => {
	const roomPage = document.getElementById('rooms-page');
	roomPage.classList.remove('display-none');
	const gamePage = document.getElementById('game-page');
	gamePage.classList.add('display-none');
}

const hideReadyBtn = () => {
	const btn = document.getElementById('ready-btn');
	btn.classList.add('display-none');
}

const hideQuitBtn = () => {
	const btn = document.getElementById('quit-room-btn');
	btn.classList.add('display-none');
}

const showReadyBtn = () => {
	const btn = document.getElementById('ready-btn');
	btn.classList.remove('display-none');
}

const showQuitBtn = () => {
	const btn = document.getElementById('quit-room-btn');
	btn.classList.remove('display-none');
}

const displayTimerBeforeGame = () => {
	const timerEl = document.getElementById('timer');
	timerEl.classList.remove('display-none');
}

const hideTimerBeforeGame = () => {
	const timerEl = document.getElementById('timer');
	timerEl.classList.add('display-none');
}

const displayText = (text) => {
	const textContainer = document.getElementById('text-container');
	textContainer.innerText = '';
	const letters = text.split('');
	letters.forEach(letter => {
		const letterEl = document.createElement('span');
		letterEl.innerText = String(letter);
		textContainer.append(letterEl);
	});
	textContainer.classList.remove('display-none');
}

const hideText = () => {
	const textContainer = document.getElementById('text-container');
	textContainer.classList.add('display-none');
}

const displayGameTimer = () => {
	const timerEl = document.getElementById('game-timer');
	timerEl.classList.remove('display-none');
}

const hideGameTimer = () => {
	const timerEl = document.getElementById('game-timer');
	timerEl.classList.add('display-none');
}

const updateGameTimer = (seconds) => {
	const secondsEl = document.getElementById('game-timer-seconds');
	secondsEl.innerText = seconds;
}

const timerBeforeGameStarted = () => {
	hideReadyBtn();
	hideQuitBtn();
	displayTimerBeforeGame();
}

const updateTimerBeforeGame = (secondsToGame) => {
	const timerBeforeGame = document.getElementById('timer');
	timerBeforeGame.innerText = secondsToGame;
}

const startTimer = (secondsBeforeGame, gameDurationInSec, text) => {
	hideReadyBtn();
	hideQuitBtn();
	displayTimerBeforeGame();
	let seconds = secondsBeforeGame;
	const timerBeforeGame = document.getElementById('timer');
	timerBeforeGame.innerText = seconds;
	const timer = setInterval(
		() => {
			seconds -= 1;
			timerBeforeGame.innerText = seconds;
			},
		1000
	);
	return new Promise(function (resolve) {
		setTimeout(() => {
			clearInterval(timer);
			hideTimerBeforeGame();
			displayText(text);
			resolve({
				text: text,
				gameDuration: gameDurationInSec
			});
		}, seconds * 1000);
	});
}

const underlineFirstLetter = () => {
	underlineNextLetter(-1);
}

const addBgForLetter = (letterNumber) => {
	const letters = Array.from(document.querySelectorAll('p#text-container span'));
	const currentLetter = letters[letterNumber];
	currentLetter.style.background = 'green';
	currentLetter.style.color = 'white';
	underlineNextLetter(letterNumber);
}

const underlineNextLetter = (letterNumber) => {
	const letters = Array.from(document.querySelectorAll('p#text-container span'));
	const nextLetterNumber = letterNumber + 1;
	if (letterNumber >= letters.length || !letters[nextLetterNumber]) {
		return;
	}
	const nextLetter = letters[nextLetterNumber];
	nextLetter.style.textDecoration = 'underline';
	nextLetter.style.textDecorationColor = 'green';
}

const showBtns = () => {
	showReadyBtn();
	const btn = document.getElementById('ready-btn');
	btn.innerText = 'READY';
	showQuitBtn();
}

export {
	appendRoomElement,
	updateNumberOfUsersInRoom,
	removeRoomElement,
	clearRooms,
	showRoomPage,
	showRoomsPage,
	setRoomName,
	saveRoomName,
	clearRoomName,
	getRoomName,
	startTimer,
	addBgForLetter,
	showBtns,
	underlineFirstLetter,
	displayGameTimer,
	hideGameTimer,
	hideText,
	displayText,
	timerBeforeGameStarted,
	updateTimerBeforeGame,
	updateGameTimer,
	hideTimerBeforeGame
};
