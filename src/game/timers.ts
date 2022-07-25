import { Socket } from 'socket.io';
import {getRandomText, getRandomTextIndex} from '../data';
import * as config from '../socket/config';
import { seconds, sendMessagesToAll } from '../helpers';
import * as events from '../socket/events';
import * as botConfig from '../bot/config';
import { emitter } from '../bot/eventsHandler';
import * as botEvents from '../bot/events';
import Storage from '../data/storage';

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

  const stateTimer = setInterval(() => {
    emitter.emit(botEvents.GAME_STATE_UPDATE, {
      socket,
      roomName,
      data: {
        users: Storage.getUsersByRoom(roomName)
      }
    });
  }, seconds(botConfig.STATE_PERIOD_CHECK_SEC));

  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(timer);
      clearInterval(stateTimer);
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