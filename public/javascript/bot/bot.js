const USER_GREETING = 'bot_user_greeting';
const USERS_INTRODUCING = 'bot_users_introducing';
const USER_LEFT = 'bot_user_left';
const GAME_STARTS_SOON = 'bot_game_starts_soon';

class Bot {
    socket = null;

    constructor(socket) {
        this.socket = socket;
    }

    listenAll() {
        this.listenGreetingEvent();
        this.listenIntroducingEvent();
        this.listenUserLeftEvent();
        this.listenGameStartsEvent();
    }

    listenGameStartsEvent() {
        this.socket.on(GAME_STARTS_SOON, (evData) => {
            console.log(GAME_STARTS_SOON);
            console.log(evData);
        });
    }

    listenGreetingEvent() {
        this.socket.on(USER_GREETING, (evData) => {
            console.log('bot_user_greeting');
            console.log(evData);
        });
    }

    listenUserLeftEvent() {
        this.socket.on(USER_LEFT, (evData) => {
            console.log('bot_user_left');
            console.log(evData);
        });
    }

    listenIntroducingEvent() {
        this.socket.on(USERS_INTRODUCING, (evData) => {
            console.log(USERS_INTRODUCING);
            console.log(evData);
        });
    }
}

export default Bot;