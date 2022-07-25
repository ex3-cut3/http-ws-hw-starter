import Comments from './commentsController';

class Bot {
  private _commentsManager: Comments;

  constructor(commentsManager: Comments) {
    this._commentsManager = commentsManager;
  }

  public greeting(username: string): string {
    return this._commentsManager.getUserGreeting(username);
  }

  public introducing(usernames: string[]): string {
    return this._commentsManager.getUsersIntroducing(usernames);
  }

  public userLeft(username: string): string {
    return this._commentsManager.getLeftUserComment(username);
  }

  public gameStartsSoon(): string {
    return this._commentsManager.getGameStartsComment();
  }
}

export default Bot;


