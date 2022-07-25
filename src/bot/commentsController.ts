import CommentsFactory from './commentsFactory';
import CommentsProxy from './commentsProxy';
import {Comment} from './models/comment';
import { USERNAME_TERM } from './info/texts';

class CommentsController {
  private _commentsFactory: CommentsFactory;
  private _commentsProxy: CommentsProxy;

  constructor(
    commentsFactory: CommentsFactory,
    commentsProxy: CommentsProxy
  ) {
    this._commentsFactory = commentsFactory;
    this._commentsProxy = commentsProxy;
  }

  getUserGreeting(username: string): string {
    const comment: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USER_GREETING_TYPE
    );
    comment.data = {
      ...comment.data,
      [USERNAME_TERM]: username
    };
    return this._commentsProxy.makeComment(comment);
  }

  getUsersIntroducing(usernames: string[]): string {
    const intro: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USERS_INTRODUCING_TYPE
    );
    return this._commentsProxy.makeCommentMultipleUsers(intro, usernames);
  }

  getLeftUserComment(username: string): string {
    const comment: Comment = this._commentsFactory.getRandomComment(
      CommentsFactory.USER_LEFT_TYPE
    );
    comment.data = {
      ...comment.data,
      [USERNAME_TERM]: username
    };
    return this._commentsProxy.makeComment(comment);
  }

  getGameStartsComment(): string {
    return this._commentsFactory.getRandomComment(
      CommentsFactory.GAME_STARTS_TYPE
    ).message;
  }
}

export default CommentsController;