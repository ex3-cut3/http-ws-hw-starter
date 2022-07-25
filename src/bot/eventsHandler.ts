import { EventEmitter } from 'events';
import {bot} from '../bot';
import * as botEvents from '../bot/events';
import {sendMessagesToAllInRoom, sendMessageToRoom} from '../helpers';
import Storage from '../data/storage';
import {Socket} from 'socket.io';
import UserInfo from '../types/userInfo';

const emitter = new EventEmitter();

export { emitter };

interface UserAction {
  socket: Socket,
  username: string,
  roomName: string
}

interface RoomData {
  socket: Socket,
  roomName: string
}

interface UpdateGameState {
  socket: Socket,
  roomName: string,
  data: {
    users: UserInfo
  }
}

emitter.on(botEvents.USER_GREETING, ({ socket, username, roomName }: UserAction) => {
  sendMessagesToAllInRoom({
    socket,
    event: botEvents.USER_GREETING,
    roomName,
    data: {
      text: bot.greeting(username)
    }
  });
});

emitter.on(botEvents.USERS_INTRODUCING, ({ socket, roomName }: RoomData) => {
  sendMessagesToAllInRoom({
    socket,
    roomName,
    event: botEvents.USERS_INTRODUCING,
    data: {
      text: bot.introducing(Storage.getUsernamesByRoom(roomName))
    }
  });
});

emitter.on(botEvents.GAME_STARTS_SOON, ({ socket, roomName }: RoomData) => {
  sendMessagesToAllInRoom({
    socket,
    roomName,
    event: botEvents.GAME_STARTS_SOON,
    data: {
      text: bot.gameStartsSoon()
    }
  });
});

emitter.on(botEvents.USER_LEFT, ({ socket, username, roomName }: UserAction) => {
  sendMessageToRoom({
    socket,
    roomName,
    event: botEvents.USER_LEFT,
    data: {
      text: bot.userLeft(username)
    }
  });
});

emitter.on(botEvents.GAME_STATE_UPDATE, ({ socket, data, roomName }: UpdateGameState) => {
  console.log(botEvents.GAME_STATE_UPDATE);
  console.log(data.users);
});
