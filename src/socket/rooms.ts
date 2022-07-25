import {Server} from 'socket.io';
import Storage from '../data/storage';
import RoomCreated from '../types/roomCreated';
import UpdateReadyStatus from '../types/updateReadyStatus';
import * as config from '../socket/config';
import UserProgress from '../types/userProgress';
import * as events from './events';
import {sendMessagesToAll, onLeaveRoom, seconds} from '../helpers';
import { handleGame } from '../game';
import { emitter } from '../bot/eventsHandler';
import * as botEvents from '../bot/events';

export default (io: Server) => {
  io.of('/rooms').on('connection', (socket) => {
    socket.on(events.ROOM_CREATED, (roomEvent: RoomCreated) => {
      const room = Storage.getRoomByName(roomEvent.roomName);
      socket.broadcast.emit(events.ADD_ROOM, { roomData: room });
    });

    socket.on(events.JOIN_ROOM, (roomName: string) => {
      socket.join(roomName);
      const username: string = <string>socket.handshake.query.username;
      Storage.addUserToTheRoom(roomName, username);
      const newCounter = Storage.getCurrentCounter(roomName);
      if (!Storage.canJoinTheRoom(roomName)) {
        socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
      } else {
        socket.broadcast.emit(events.UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
      }
      socket.to(roomName).emit(events.ADD_USERS_LIST, { name: username, isReady: false});
      emitter.emit(botEvents.USER_GREETING, { socket, username, roomName });
    });

    socket.on(events.LEFT_ROOM, (roomName: string) => {
      socket.leave(roomName);
      const username: string = <string>socket.handshake.query.username;
      Storage.removeUserFromTheRoom(roomName, username);
      if (Storage.roomIsEmpty(roomName)) {
        Storage.removeRoom(roomName);
        socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
      }
      if (
        Storage.roomExists(roomName)
        &&
        Storage.canJoinTheRoom(roomName)
        &&
        Storage.hasOneFreePlace(roomName)
      ) {
        socket.broadcast.emit(events.ADD_ROOM, { roomData: Storage.getRoomByName(roomName)});
      }
      if (Storage.roomExists(roomName)) {
        emitter.emit(botEvents.USER_LEFT, { socket, username, roomName});
        onLeaveRoom(socket, roomName);
      }
    });

    socket.on(events.UPDATE_READY_STATUS, (eventData: UpdateReadyStatus) => {
        Storage.updateUserReadyStatus(
          eventData.roomName,
          eventData.user,
          eventData.value
        );
        socket.to(eventData.roomName).emit(events.UPDATE_READY_STATUS, {
          user: eventData.user,
          ready: eventData.value
        });
        if (
          Storage.allUsersAreReady(eventData.roomName)
          &&
          Storage.usersInRoom(eventData.roomName) >= config.MINIMUM_USERS_FOR_ONE_ROOM
        ) {
          Storage.markRoomInGame(eventData.roomName);
          socket.broadcast.emit(events.REMOVE_ROOM, { roomName: eventData.roomName });
          emitter.emit(botEvents.USERS_INTRODUCING, { socket, roomName: eventData.roomName });
          setTimeout(() => {
            emitter.emit(botEvents.GAME_STARTS_SOON, { socket, roomName: eventData.roomName})
          }, seconds(config.SECONDS_TIMER_BEFORE_START_GAME / 2));
          handleGame(socket, eventData.roomName);
        }
    });

    socket.on(events.SET_USER_PROGRESS, (progressData: UserProgress) => {
      Storage.updateUserProgress(
        progressData.roomName,
        progressData.user,
        progressData.progress
      );
      socket.to(progressData.roomName).emit(events.SET_USER_PROGRESS, {
        user: progressData.user,
        progress: progressData.progress
      });
      if (Storage.allUsersAreCompleted(progressData.roomName)) {
        const users = Storage.getFinishedUsersList(progressData.roomName);
        sendMessagesToAll(
          socket,
          events.GAME_FINISHED_EARLY,
          progressData.roomName,
          {
            users: users
          }
        );
        Storage.resetRoom(progressData.roomName);
      }
    });

    socket.on('disconnecting', () => {
      const rooms = socket.rooms;
      const username: string = <string>socket.handshake.query.username;
      rooms.forEach((roomName) => {
        if (Storage.roomExists(roomName)) {
          Storage.updateUserReadyStatus(
            roomName,
            username,
            false
          );
          Storage.removeUserFromTheRoom(roomName, username);
          Storage.removeUser(username);
          onLeaveRoom(socket, roomName);
        }
      });
    });
  });
};
