import { addClass } from '../helpers/domHelper.mjs';
import { createElement } from '../helpers/domHelper.mjs';

const stringToBoolMap = {
	'false': false,
	'true': true
}

const boolToStringMap = {
	false: 'false',
	true: 'true'
}

const appendUserElement = ({ username, ready, isCurrentUser }) => {
	const usersContainer = document.querySelector('#users-wrapper');

	const usernameElement = createElement({
		tagName: 'div',
		className: 'username',
		attributes: { 'data-username': username },
		innerElements: [isCurrentUser ? `${username} (you)` : username],
	});

	const readyStatusElement = createElement({
		tagName: 'div',
		className: 'ready-status',
		attributes: { 'data-username': username, 'data-ready': Boolean(ready) },
		innerElements: [getReadySign(ready)],
	});

	const headerWrapper = createElement({
		tagName: 'div',
		className: 'user-header',
		attributes: { 'data-username': username },
		innerElements: [readyStatusElement, usernameElement],
	});

	const progressElement = createElement({
		tagName: 'div',
		className: 'user-progress',
		attributes: { 'data-username': username, style: `width: 0%;` },
	});

	const progressElementBlock = createElement({
		tagName: 'div',
		className: 'user-progress-template',
		innerElements: [progressElement],
	});

	const userElement = createElement({
		tagName: 'div',
		className: 'user',
		attributes: { 'data-username': username },
		innerElements: [headerWrapper, progressElementBlock],
	});

	usersContainer.append(userElement);

	return userElement;
};

const changeReadyStatus = ({ username, ready }) => {
	const readyStatusElement = document.querySelector(`.ready-status[data-username='${username}']`);
	readyStatusElement.innerHTML = getReadySign(ready);
	readyStatusElement.dataset.ready = Boolean(ready);
};

const setProgress = ({ username, progress }) => {
	const progressElement = document.querySelector(`.user-progress[data-username='${username}']`);

	if (progress === 100) {
		progressElement.style.width = `${progress}%`;
		addClass(progressElement, 'finished');
	} else {
		progressElement.style.width = `${progress}%`;
	}
};

const removeUserElement = (username) => {
	const userEl = document.querySelector(`.user[data-username='${username}']`);
	if (userEl) {
		userEl.remove();
	}
};

const cleanUsersList = () => {
	const userWrapper = document.getElementById('users-wrapper');
	userWrapper.innerHTML = '';
}

const getReadySign = ready => (ready ? '🟢' : '🔴');

const updateReadyStatus = (username) => {
	const currentReadyEl = document.querySelector(
		`div.ready-status[data-username=${username}]`
	);
	const readyValue = currentReadyEl.getAttribute('data-ready');
	const newValue = !stringToBoolMap[readyValue];
	currentReadyEl.innerHTML = getReadySign(newValue);
	currentReadyEl.setAttribute('data-ready', boolToStringMap[newValue]);
}

const updateReadyBtnTextForCurrUser = (username) => {
	const currentReadyEl = document.querySelector(
		`div.ready-status[data-username=${username}]`
	);
	const readyValue = currentReadyEl.getAttribute('data-ready');
	const btn = document.getElementById('ready-btn');
	btn.innerText = stringToBoolMap[readyValue] ? 'NOT READY': 'READY';
}

const getReadyStatus = (username) => {
	const currentReadyEl = document.querySelector(
		`div.ready-status[data-username=${username}]`
	);
	const readyValue = currentReadyEl.getAttribute('data-ready');
	return stringToBoolMap[readyValue];
}

const resetUsers = () => {
	const users = document.querySelectorAll('div.user[info-username]');
	users.forEach((u) => {
		const username = u.getAttribute('data-username');
		const status = document.querySelector(`div.ready-status[data-username='${username}']`);
		status.setAttribute('data-ready', 'false');
		status.innerText = getReadySign(false);
		const progress = document.querySelector(`div.user-progress[data-username='${username}']`);
		progress.style.width = "0%";
	})
}

export {
	appendUserElement,
	changeReadyStatus,
	setProgress,
	removeUserElement,
	updateReadyStatus,
	getReadyStatus,
	cleanUsersList,
	updateReadyBtnTextForCurrUser,
	resetUsers
};
