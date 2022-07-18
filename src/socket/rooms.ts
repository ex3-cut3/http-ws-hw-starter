import { Server } from 'socket.io';
import Storage from '../storage';
import RoomCreated from '../types/roomCreated';
import UpdateReadyStatus from '../types/updateReadyStatus';
import * as config from '../socket/config';
import {getRandomText, getRandomTextIndex} from '../data';
import UserProgress from '../types/userProgress';
import CompletedUser from '../types/completedUser';

const ADD_ROOM: string = 'add_room';
const REMOVE_ROOM: string = 'remove_room';
const ROOM_CREATED: string = 'room_created';
const JOIN_ROOM: string = 'join_room';
const LEFT_ROOM: string = 'left_room';
const UPDATE_COUNTERS: string = 'update_counters';
const UPDATE_READY_STATUS: string = 'update_ready_status';
const ADD_USERS_LIST: string = 'add_users_list';
const DELETE_USERS_LIST: string = 'delete_users_list';
const SET_USER_PROGRESS: string = 'set_user_progress';
const GAME_FINISHED: string = 'game_finished';

const onLeaveRoom = (socket, roomName) => {
  const username: string = <string>socket.handshake.query.username;
  const newCounter = Storage.getCurrentCounter(roomName);
  socket.broadcast.emit(UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
  if (
    Storage.allUsersAreReady(roomName)
    &&
    Storage.usersInRoom(roomName) >= 2
  ) {
    Storage.markRoomInGame(roomName);
    socket.broadcast.emit(REMOVE_ROOM, { roomName: roomName });
    const text = getRandomText();
    // send message for starting timer for creator of event
    socket.emit('start_timer', {
      timeToGame: config.SECONDS_TIMER_BEFORE_START_GAME,
      gameTime: config.SECONDS_FOR_GAME,
      text: text,
    });
    // send message for starting timer for all other in the room
    socket.to(roomName).emit('start_timer', {
      timeToGame: config.SECONDS_TIMER_BEFORE_START_GAME,
      gameTime: config.SECONDS_FOR_GAME,
      text: text,
    });
  }
  socket.to(roomName).emit(DELETE_USERS_LIST, { name: username });
}

const onGameFinished = (socket, roomName) => {
  const users = Storage.getFinishedUsersList(roomName);
  socket.emit('game_finished', {
    users: users
  });
  Storage.resetRoom(roomName);
}

export default (io: Server) => {
  io.of('/rooms').on('connection', (socket) => {
    socket.on(ROOM_CREATED, (roomEvent: RoomCreated) => {
      const room = Storage.getRoomByName(roomEvent.roomName);
      socket.broadcast.emit(ADD_ROOM, { roomData: room });
    });

    socket.on(JOIN_ROOM, (roomName: string) => {
      socket.join(roomName);
      const username: string = <string>socket.handshake.query.username;
      Storage.addUserToTheRoom(roomName, username);
      const newCounter = Storage.getCurrentCounter(roomName);
      socket.broadcast.emit(UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
      if (!Storage.canJoinTheRoom(roomName)) {
        socket.broadcast.emit(REMOVE_ROOM, { roomName: roomName });
      }
      socket.to(roomName).emit(ADD_USERS_LIST, { name: username, isReady: false});
    });

    socket.on(LEFT_ROOM, (roomName: string) => {
      socket.leave(roomName);
      const username: string = <string>socket.handshake.query.username;
      Storage.removeUserFromTheRoom(roomName, username);
      if (Storage.roomIsEmpty(roomName)) {
        Storage.removeRoom(roomName);
        socket.broadcast.emit(REMOVE_ROOM, { roomName: roomName });
      }
      if (
        Storage.roomExists(roomName)
        &&
        Storage.canJoinTheRoom(roomName)
        &&
        Storage.hasOneFreePlace(roomName)
      ) {
        socket.broadcast.emit(ADD_ROOM, { roomData: Storage.getRoomByName(roomName)});
      }
      if (Storage.roomExists(roomName)) {
        onLeaveRoom(socket, roomName);
      }
    });

    socket.on(UPDATE_READY_STATUS, (eventData: UpdateReadyStatus) => {
        Storage.updateUserReadyStatus(
          eventData.roomName,
          eventData.user,
          eventData.value
        );
        socket.to(eventData.roomName).emit(UPDATE_READY_STATUS, {
          user: eventData.user,
          ready: eventData.value
        });
        if (
          Storage.allUsersAreReady(eventData.roomName)
          &&
          Storage.usersInRoom(eventData.roomName) >= 2
        ) {
          Storage.markRoomInGame(eventData.roomName);
          socket.broadcast.emit(REMOVE_ROOM, { roomName: eventData.roomName });
          const textId = getRandomTextIndex();
          // send message for starting timer for creator of event
          socket.emit('start_timer', {
            timeToGame: config.SECONDS_TIMER_BEFORE_START_GAME,
            gameTime: config.SECONDS_FOR_GAME,
            textId: textId,
          });
          // send message for starting timer for all other in the room
          socket.to(eventData.roomName).emit('start_timer', {
            timeToGame: config.SECONDS_TIMER_BEFORE_START_GAME,
            gameTime: config.SECONDS_FOR_GAME,
            text: textId,
          });
        }
    });

    socket.on(SET_USER_PROGRESS, (progressData: UserProgress) => {
      Storage.updateUserProgress(
        progressData.roomName,
        progressData.user,
        progressData.progress
      );
      socket.to(progressData.roomName).emit(SET_USER_PROGRESS, {
        user: progressData.user,
        progress: progressData.progress
      });
      if (Storage.allUsersAreCompleted(progressData.roomName)) {
        const users = Storage.getFinishedUsersList(progressData.roomName);
        socket.emit('game_finished_early', {
          users: users
        });
        socket.broadcast.to(progressData.roomName).emit('game_finished_early', {
          users: users
        });
        Storage.resetRoom(progressData.roomName);
      }
    });

    socket.on(GAME_FINISHED, (roomName) => {
      const users = Storage.getFinishedUsersList(roomName);
      socket.emit('game_finished', {
        users: users
      });
      Storage.resetRoom(roomName);
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
