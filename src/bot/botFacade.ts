import Bot from './bot';
import CommentsController from './commentsController';
import CommentsProxy from './commentsProxy';
import CommentsFactory from './commentsFactory';

class BotFacade {           // facade - creates bot with all needed dependencies
  getBot(): Bot {
    return new Bot(
      this.getTextGenerator()
    );
  }

  private getTextGenerator() {
    return new CommentsController(
      new CommentsFactory(),
      new CommentsProxy()
    );
  }
}

export default BotFacade;