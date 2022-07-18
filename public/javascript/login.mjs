const username = sessionStorage.getItem('username');

if (username) {
	window.location.replace('/game');
}

const submitButton = document.getElementById('submit-button');
const input = document.getElementById('username-input');

const getInputValue = () => input.value;

const onClickSubmitButton = async () => {
	const inputValue = getInputValue();
	if (!inputValue) {
		return;
	}
	try {
		await canLogin(inputValue);
	} catch (e) {
		alert(e.message);
		return;
	}
	sessionStorage.setItem('username', inputValue);
	window.location.replace('/game');
};

const canLogin = async (username) => {
	const res = await fetch(
		'/login/can-login',
		{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({username: username})
		}
	);
	const responseOk = res.ok;
	const resDecoded = await res.json();
	if (!responseOk) {
		throw new Error(resDecoded.message);
	}
}

const onKeyUp = ev => {
	const enterKeyCode = 13;
	if (ev.keyCode === enterKeyCode) {
		submitButton.click();
	}
};

submitButton.addEventListener('click', onClickSubmitButton);
window.addEventListener('keyup', onKeyUp);
