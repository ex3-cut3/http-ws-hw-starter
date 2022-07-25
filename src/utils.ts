import { Socket } from 'socket.io';
import controller from './controller';
import * as events from './socket/eventsEnum';
import * as config from './socket/config';
import {handleGame} from './game';

export const seconds = (seconds: number): number => {
  return seconds * 1000;
};

export const sendMessagesToAll = (
  socket: Socket,
  event: string,
  roomName: string,
  messageData: object
) => {
  socket.emit(event, messageData);
  socket.to(roomName).emit(event, messageData);
}

export const onLeaveRoom = (socket, roomName: string) => {
  const username: string = <string>socket.handshake.query.username;
  const newCounter = controller.getCurrentCounter(roomName);
  socket.broadcast.emit(events.UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
  if (
    controller.allUsersAreReady(roomName)
    &&
    controller.usersInRoom(roomName) >= config.MINIMUM_USERS_FOR_ONE_ROOM
  ) {
    controller.markRoomInGame(roomName);
    socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
    handleGame(socket, roomName);
  }
  if (controller.roomIsEmpty(roomName)) {
    controller.removeRoom(roomName);
    socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
  }
  socket.to(roomName).emit(events.DELETE_USERS_LIST, { name: username });
}