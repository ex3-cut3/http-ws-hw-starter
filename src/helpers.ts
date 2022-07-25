import { Socket } from 'socket.io';
import Storage from './data/storage';
import * as events from './socket/events';
import * as config from './socket/config';
import {handleGame} from './game';

export const seconds = (seconds: number): number => {
  return seconds * 1000;
};

export const sendMessagesToAll = (
  socket: Socket,
  event: string,
  roomName: string,
  data: object
) => {
  socket.emit(event, data);
  socket.to(roomName).emit(event, data);
}

export const sendMessageToRoom = (
  { socket, roomName, event, data }: { socket: Socket, roomName: string, event: string, data: object }
) => {
  socket.to(roomName).emit(event, data);
}

export const sendMessagesToAllInRoom = (
  {socket, event, roomName, data}:
    { socket: Socket, event: string, roomName: string, data: object }
) => {
  sendMessageToCreator({ socket, event, data });
  sendMessageToRoom({ socket, event, data, roomName})
}

export const sendMessageToCreator = (
  { socket, event, data }: { socket: Socket, event: string, data }
) => {
  socket.emit(event, data);
}

export const onLeaveRoom = (socket, roomName: string) => {
  const username: string = <string>socket.handshake.query.username;
  const newCounter = Storage.getCurrentCounter(roomName);
  socket.broadcast.emit(events.UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
  if (
    Storage.allUsersAreReady(roomName)
    &&
    Storage.usersInRoom(roomName) >= config.MINIMUM_USERS_FOR_ONE_ROOM
  ) {
    Storage.markRoomInGame(roomName);
    socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
    handleGame(socket, roomName);
  }
  if (Storage.roomIsEmpty(roomName)) {
    Storage.removeRoom(roomName);
    socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
  }
  socket.to(roomName).emit(events.DELETE_USERS_LIST, { name: username });
}