import * as texts from './info/texts';
import { Comment } from './models/comment';
import CommentCreator from './commentCreator';

class CommentsFactory {        // factory - give template of the message
  public static readonly USER_GREETING_TYPE = 'user_greeting';
  public static readonly USERS_INTRODUCING_TYPE = 'users_introducing';
  public static readonly USER_LEFT_TYPE = 'user_left_type';
  public static readonly GAME_STARTS_TYPE = 'game_starts_type';

  private _commentBuilder: CommentCreator;

  constructor() {
    this._commentBuilder = new CommentCreator();
  }

  public getRandomComment(itemType: string): Comment {
    switch (itemType) {
      case CommentsFactory.USER_GREETING_TYPE:
        return this._commentBuilder.getComment(
          texts.userGreetings[this.getRandomIndex(texts.userGreetings)]
        );
      case CommentsFactory.USERS_INTRODUCING_TYPE:
        return this._commentBuilder.getComment(
          texts.usersIntroducing[this.getRandomIndex(texts.usersIntroducing)]
        );
      case CommentsFactory.USER_LEFT_TYPE:
        return this._commentBuilder.getComment(
          texts.userLeft[this.getRandomIndex(texts.userLeft)]
        );
      case CommentsFactory.GAME_STARTS_TYPE:
        return this._commentBuilder.getComment(
          texts.gameStartsSoon[this.getRandomIndex(texts.gameStartsSoon)]
        );
      default:
        throw new Error('Undefined comment type');
    }
  }

  private getRandomIndex(items: string[]): number {
    return Math.floor(Math.random() * items.length);
  }
}

export default CommentsFactory;