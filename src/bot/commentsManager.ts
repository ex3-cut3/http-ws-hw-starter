import CommentsFactory from './commentsFactory';
import CommentsTemplateProxy from './commentsTemplateProxy';
import {Comment} from './models/comment';
import { USERNAME_TERM } from './data/texts';

class CommentsManager {
  private _commentsFactory: CommentsFactory;
  private _commentsTemplateProxy: CommentsTemplateProxy;

  constructor(
    commentsFactory: CommentsFactory,
    commentsTemplateProxy: CommentsTemplateProxy
  ) {
    this._commentsFactory = commentsFactory;
    this._commentsTemplateProxy = commentsTemplateProxy;
  }

  getUserGreeting(username: string): string {
    const comment: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USER_GREETING_TYPE
    );
    comment.data = {
      ...comment.data,
      [USERNAME_TERM]: username
    };
    return this._commentsTemplateProxy.makeComment(comment);
  }

  getUsersIntroducing(usernames: string[]): string {
    const intro: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USERS_INTRODUCING_TYPE
    );
    return this._commentsTemplateProxy.makeCommentMultipleUsers(intro, usernames);
  }

  getLeftUserComment(username: string): string {
    const comment: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USER_LEFT_TYPE
    );
    comment.data = {
      ...comment.data,
      [USERNAME_TERM]: username
    };
    return this._commentsTemplateProxy.makeComment(comment);
  }

  getGameStartsComment(): string {
    return this._commentsFactory.getRandomComment(
      CommentsFactory.GAME_STARTS_TYPE
    ).message;
  }
}

export default CommentsManager;