import {Socket} from 'socket.io';
import {gameTimer, timerBeforeGame} from './timers';
import * as events from '../socket/events';
import Storage from '../data/storage';
import {sendMessagesToAll} from '../helpers';

export const handleGame = (socket: Socket, roomName: string) => {
  timerBeforeGame(socket, roomName)
    .then(() => {
      const timeout = gameTimer(socket, roomName);
      let gameFinished = false;
      socket.on(events.GAME_FINISHED_EARLY, () => {
        gameFinished = true;
        Storage.resetRoom(roomName);
      });
      timeout.then(() => {
        if (!gameFinished) {
          sendMessagesToAll(
            socket,
            events.GAME_FINISHED,
            roomName,
            {
              users: Storage.getFinishedUsersList(roomName)
            }
          );
          Storage.resetRoom(roomName);
        }
      });
    });
}