import {Server} from 'socket.io';
import controller from '../controller';
import RoomCreated from '../models/roomCreated';
import UpdateReadyStatus from '../models/updateReadyStatus';
import * as config from '../socket/config';
import UserProgress from '../models/userProgress';
import * as events from './eventsEnum';
import { sendMessagesToAll, onLeaveRoom } from '../utils';
import { handleGame } from '../game';

export default (io: Server) => {
  io.of('/rooms').on('connection', (socket) => {
    socket.on(events.ROOM_CREATED, (roomEvent: RoomCreated) => {
      const room = controller.getRoomByName(roomEvent.roomName);
      socket.broadcast.emit(events.ADD_ROOM, { roomData: room });
    });

    socket.on(events.JOIN_ROOM, (roomName: string) => {
      socket.join(roomName);
      const username: string = <string>socket.handshake.query.username;
      controller.addUserToTheRoom(roomName, username);
      const newCounter = controller.getCurrentCounter(roomName);
      if (!controller.canJoinTheRoom(roomName)) {
        socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
      } else {
        socket.broadcast.emit(events.UPDATE_COUNTERS, { roomName: roomName, counter: newCounter });
      }
      socket.to(roomName).emit(events.ADD_USERS_LIST, { name: username, isReady: false});
    });

    socket.on(events.LEFT_ROOM, (roomName: string) => {
      socket.leave(roomName);
      console.log(controller.getRoomByName(roomName));
      const username: string = <string>socket.handshake.query.username;
      controller.removeUserFromTheRoom(roomName, username);
      if (controller.roomIsEmpty(roomName)) {
        controller.removeRoom(roomName);
        socket.broadcast.emit(events.REMOVE_ROOM, { roomName: roomName });
      }
      if (
        controller.roomExists(roomName)
        &&
        controller.canJoinTheRoom(roomName)
        &&
        controller.hasOneFreePlace(roomName)
      ) {
        socket.broadcast.emit(events.ADD_ROOM, { roomData: controller.getRoomByName(roomName)});
      }
      if (controller.roomExists(roomName)) {
        onLeaveRoom(socket, roomName);
      }
      console.log(controller.getRoomByName(roomName));
    });

    socket.on(events.UPDATE_READY_STATUS, (eventData: UpdateReadyStatus) => {
        controller.updateUserReadyStatus(
          eventData.roomName,
          eventData.user,
          eventData.value
        );
        socket.to(eventData.roomName).emit(events.UPDATE_READY_STATUS, {
          user: eventData.user,
          ready: eventData.value
        });
        if (
          controller.allUsersAreReady(eventData.roomName)
          &&
          controller.usersInRoom(eventData.roomName) >= config.MINIMUM_USERS_FOR_ONE_ROOM
        ) {
          controller.markRoomInGame(eventData.roomName);
          socket.broadcast.emit(events.REMOVE_ROOM, { roomName: eventData.roomName });
          handleGame(socket, eventData.roomName);
        }
    });

    socket.on(events.SET_USER_PROGRESS, (progressData: UserProgress) => {
      controller.updateUserProgress(
        progressData.roomName,
        progressData.user,
        progressData.progress
      );
      socket.to(progressData.roomName).emit(events.SET_USER_PROGRESS, {
        user: progressData.user,
        progress: progressData.progress
      });
      if (controller.allUsersAreCompleted(progressData.roomName)) {
        const users = controller.getFinishedUsersList(progressData.roomName);
        sendMessagesToAll(
          socket,
          events.GAME_FINISHED_EARLY,
          progressData.roomName,
          {
            users: users
          }
        );
        controller.resetRoom(progressData.roomName);
      }
    });

    socket.on('disconnecting', () => {
      const rooms = socket.rooms;
      const username: string = <string>socket.handshake.query.username;
      rooms.forEach((roomName) => {
        if (controller.roomExists(roomName)) {
          controller.updateUserReadyStatus(
            roomName,
            username,
            false
          );
          controller.removeUserFromTheRoom(roomName, username);
          controller.removeUser(username);
          onLeaveRoom(socket, roomName);
        }
      });
    });
  });
};
