import UserInfo from './userInfo';
import CompletedUser from './completedUser';

interface RoomInfo {
  name: string;
  users: UserInfo[],
  isInGame: boolean;
  completedUsers: CompletedUser[];
}

export default RoomInfo;