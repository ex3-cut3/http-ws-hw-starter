import {Socket} from 'socket.io';
import {gameTimer, timerBeforeGame} from './timers';
import * as events from './socket/eventsEnum';
import controller from './controller';
import {sendMessagesToAll} from './utils';

export const handleGame = (socket: Socket, roomName: string) => {
  timerBeforeGame(socket, roomName)
    .then(() => {
      const timeout = gameTimer(socket, roomName);
      let gameFinished = false;
      socket.on(events.GAME_FINISHED_EARLY, () => {
        gameFinished = true;
        controller.resetRoom(roomName);
      });
      timeout.then(() => {
        if (!gameFinished) {
          sendMessagesToAll(
            socket,
            events.GAME_FINISHED,
            roomName,
            {
              users: controller.getFinishedUsersList(roomName)
            }
          );
          controller.resetRoom(roomName);
        }
      });
    });
}