import UserInfo from './types/userInfo';
import RoomInfo from './types/roomInfo';
import * as config from './socket/config';
import CompletedUser from './types/completedUser';

class Storage {
  private COMPLETED_PROGRESS = 100;

  usernames: string[];
  roomsInfo: RoomInfo[];

  constructor() {
    this.usernames = [];
    this.roomsInfo = [];
  }

  completedUserExists(roomName: string, userName: string): boolean {
    const room = this.getRoomByName(roomName);
    if (room?.completedUsers.length) {
      const foundUser = room.completedUsers.find((u: CompletedUser) => {
        return u.username === userName;
      });
      return !!foundUser;
    }
    return false;
  }

  getUsersByRoom(roomName: string): UserInfo[] {
    const room = this.getRoomByName(roomName);
    if (!room) {
      return [];
    }
    return room.users.filter(u => u);
  }

  usersInRoomCounter(roomName: string): number {
    return this.getUsersByRoom(roomName).length;
  }

  canJoinTheRoom(roomName: string): boolean {
    const usersInRoom = this.usersInRoomCounter(roomName);
    return usersInRoom < config.MAXIMUM_USERS_FOR_ONE_ROOM;
  }

  hasOneFreePlace(roomName: string): boolean {
    return this.usersInRoomCounter(roomName) === config.MAXIMUM_USERS_FOR_ONE_ROOM - 1;
  }

  roomIsEmpty(roomName: string): boolean {
    return this.usersInRoomCounter(roomName) === 0;
  }

  userExistsInTheRoom(roomName: string, username: string): boolean {
    const users = this.getUsersByRoom(roomName);
    if (!users.length) {
      return false;
    }
    const userIndex = users.findIndex((user: UserInfo) => {
      return user.name === username;
    });
    return userIndex !== -1;
  }

  removeUserFromTheRoom(roomName: string, username: string): void {
    const room = this.getRoomByName(roomName);
    const usersInRoom = room?.users;
    if (!usersInRoom) {
      return;
    }

    room.users = usersInRoom.filter((user: UserInfo) => {
      return user.name !== username;
    });

    this.updateRoom(room);
  }

  addUserToTheRoom(roomName: string, username: string): void {
    if (!this.userExistsInTheRoom(roomName, username)) {
      const usersInRoom = this.getUsersByRoom(roomName);
      usersInRoom.push({
        name: username,
        isReady: false,
        progress: 0,
        completedAt: 0
      });
      const room = this.getRoomByName(roomName);
      if (!room) {
        return;
      }
      room.users = usersInRoom;
      this.updateRoom(room);
    }
  }

  updateRoom(roomData: RoomInfo): void {
    this.roomsInfo = this.roomsInfo.filter((room: RoomInfo) => {
      return room.name !== roomData.name;
    });
    this.roomsInfo.push(roomData);
  }

  addCompletedUser(roomName: string, userName: string): void {
    const room = this.getRoomByName(roomName);
    if (!room) {
      return;
    }
    if (!this.completedUserExists(roomName, userName)) {
      room.completedUsers.push({
        username: userName,
        completedAt: new Date().getTime()
      });
    }
    this.updateRoom(room);
  }

  getUserFromRoom(roomName: string, userName: string): UserInfo | undefined {
    const users = this.getUsersByRoom(roomName);
    return users.find((u: UserInfo) => {
      return u.name === userName;
    });
  }

  updateUserProgress(roomName: string, username: string, progress: number): void {
    const user = this.getUserFromRoom(roomName, username);
    if (!user) {
      console.log('no user to update ready status');
      return;
    }
    user.progress = progress;
    if (progress === this.COMPLETED_PROGRESS) {
      this.addCompletedUser(roomName, username);
    }
    this.updateUserInTheRoom(roomName, user);
  }

  updateUserReadyStatus(roomName: string, username: string, readyValue: boolean): void {
    const users = this.getUsersByRoom(roomName);
    const user: UserInfo | undefined = users.find((u: UserInfo) => {
      return u.name === username;
    });
    if (!user) {
      console.log('no user to update ready status');
      return;
    }
    this.removeUserFromTheRoom(roomName, username);
    user.isReady = readyValue;
    this.updateUserInTheRoom(roomName, user);
  }

  updateUserInTheRoom(roomName: string, userData: UserInfo): void {
    const room = this.getRoomByName(roomName);
    if (!room?.users) {
      return;
    }
    room.users = room.users.filter((u: UserInfo) => {
      return u.name !== userData.name;
    });
    room.users.push(userData);
    this.updateRoom(room);
  }

  allUsersAreReady(roomName: string): boolean {
    const users = this.getUsersByRoom(roomName);
    let allAreReady = true;
    users.forEach((user: UserInfo) => {
      if (!user.isReady) {
        allAreReady = false;
      }
    });
    return allAreReady;
  }

  allUsersAreCompleted(roomName: string): boolean {
    const users = this.getUsersByRoom(roomName);
    let allAreReady = true;
    users.forEach((user: UserInfo) => {
      if (user.progress !== this.COMPLETED_PROGRESS) {
        allAreReady = false;
      }
    });
    return allAreReady;
  }

  usersInRoom(roomName: string): number {
    return this.getUsersByRoom(roomName).length;
  }

  userExists(username: string): boolean {
    const index = this.usernames.findIndex((user: string) => {
      return user === username;
    });
    return index !== -1;
  }

  addUser(username: string): void {
    if (!username) {
      return;
    }
    if (!this.userExists(username)) {
      this.usernames.push(username);
      this.usernames = this.usernames.filter((u) => u);
    }
  }

  removeUser(username: string): void {
    const usernames = this.usernames;
    this.usernames = usernames.filter((user: string) => {
      return user !== username;
    });
  }

  roomExists(newRoomName: string): boolean {
    const index = this.roomsInfo.findIndex((room: RoomInfo) => {
      return room.name === newRoomName;
    });
    return index !== -1;
  }

  addRoom(newRoomName: string): void {
    if (!newRoomName) {
      return;
    }
    if (!this.roomExists(newRoomName)) {
      const room: RoomInfo = {
        name: newRoomName,
        users: [],
        completedUsers: [],
        isInGame: false
      }
      this.roomsInfo.push(room);
      this.roomsInfo = this.roomsInfo.filter((r) => r);
    }
  }

  removeRoom(removeRoomName: string): void {
    this.roomsInfo = this.roomsInfo.filter((room: RoomInfo) => {
      return room.name !== removeRoomName;
    });
  }

  getAvailableRooms(): RoomInfo[] {
    return this.roomsInfo.filter((room: RoomInfo) => {
      return !room.isInGame;
    });
  }

  markRoomInGame(roomName: string): void {
    const roomIndex = this.roomsInfo.findIndex((room: RoomInfo) => {
      return room.name === roomName;
    });
    if (roomIndex === -1) {
      console.log('Someting went wrong');
      return;
    }
    const room = this.roomsInfo[roomIndex];
    room.isInGame = true;
    this.roomsInfo = this.roomsInfo.filter((room: RoomInfo) => {
      return room.name !== roomName;
    });
    this.roomsInfo.push(room);
  }

  getRoomByName(roomName: string): RoomInfo | undefined {
    return this.roomsInfo.find((room: RoomInfo) => {
      return room.name === roomName;
    });
  }

  getCurrentCounter(roomName: string): number {
    const room = this.getRoomByName(roomName);
    if (!room) {
      console.log('Someting went wrong');
      return 0;
    }
    return room.users.length;
  }

  getCompletedUsersFromRoom(roomName: string): CompletedUser[] {
    const room = this.getRoomByName(roomName);
    if (!room) {
      return [];
    }
    return room.completedUsers.filter(u => u);
  }

  getFinishedUsersList(roomName: string): string[] {
    const completedUsers = this.getCompletedUsersFromRoom(roomName);
    completedUsers.sort((uPrev: CompletedUser, uNext: CompletedUser) => {
      if (uPrev.completedAt < uNext.completedAt) {
        return 1;
      }
      if (uPrev.completedAt > uNext.completedAt) {
        return -1;
      }
      return 0;
    });
    const completeUsersNames = completedUsers.map((u) => {
      return u.username;
    });
    const users = this.getUsersByRoom(roomName).filter((u) => {
      return !completeUsersNames.includes(u.name);
    });
    users.sort((uPrev: UserInfo, uNext: UserInfo) => {
      if (uPrev.progress < uNext.progress) {
        return 1;
      }
      if (uPrev.progress > uNext.progress) {
        return -1;
      }
      return 0;
    });
    const usersNames = users.map((u: UserInfo) => {
      return u.name;
    });
    return completeUsersNames.concat(usersNames);
  }

  resetRoom(roomName: string): void {
    const room: RoomInfo | undefined = this.getRoomByName(roomName);
    if (!room) {
      return;
    }
    room.isInGame = false;
    room.completedUsers = [];
    room.users = this.resetUsers(room.users);
  }

  private resetUsers(users: UserInfo[]): UserInfo[] {
    return users.map((u: UserInfo) => {
      u.progress = 0;
      u.isReady = false;
      return u;
    });
  }
}

const storage: Storage = new Storage();

export default storage;