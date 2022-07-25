import { Socket } from 'socket.io';
import {getRandomText, getRandomTextIndex} from './textController';
import * as config from './socket/config';
import { seconds, sendMessagesToAll } from './utils';
import * as events from './socket/eventsEnum';

export const gameTimer = (socket: Socket, roomName: string) => {
  const text = getRandomText();
  let gameDuration = config.SECONDS_FOR_GAME;
  sendMessagesToAll(
    socket,
    events.GAME_STARTED,
    roomName,
    {
      status: 'game started',
      text: text
    }
  );
  sendMessagesToAll(
    socket,
    events.UPDATE_GAME_TIMER,
    roomName,
    {
      secondsToEnd: gameDuration
    }
  );
  const timer = setInterval(() => {
    gameDuration -= 1;
    sendMessagesToAll(
      socket,
      events.UPDATE_GAME_TIMER,
      roomName,
      {
        secondsToEnd: gameDuration
      }
    );
  }, seconds(1));

  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(timer);
      resolve({
        status: 'game_finished'
      });
    }, config.SECONDS_FOR_GAME * seconds(1));
  });
}

export const timerBeforeGame = (socket: Socket, roomName: string) => {
  const textId = getRandomTextIndex();
  let secondsBeforeGame = config.SECONDS_TIMER_BEFORE_START_GAME;
  sendMessagesToAll(
    socket,
    events.TIMER_BEFORE_GAME_STARTED,
    roomName, {
      status: true
    }
  );
  sendMessagesToAll(
    socket,
    events.UPDATE_TIMER_BEFORE_GAME,
    roomName,
    {
      timeToGame: secondsBeforeGame,
      textId: textId
    }
  );
  const timer = setInterval(() => {
    secondsBeforeGame -= 1;
    sendMessagesToAll(
      socket,
      events.UPDATE_TIMER_BEFORE_GAME,
      roomName,
      {
        timeToGame: secondsBeforeGame,
        textId: textId
      }
    );
  }, seconds(1));
  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(timer);
      resolve({
        status: true
      });
    }, config.SECONDS_TIMER_BEFORE_START_GAME * seconds(1));
  })
}