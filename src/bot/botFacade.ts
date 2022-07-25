import Bot from './bot';
import CommentsManager from './commentsManager';
import CommentsTemplateProxy from './commentsTemplateProxy';
import CommentsFactory from './commentsFactory';

class BotFacade {           // facade - creates bot with all needed dependencies
  getBot(): Bot {
    return new Bot(
      this.getTextGenerator()
    );
  }

  private getTextGenerator() {
    return new CommentsManager(
      new CommentsFactory(),
      new CommentsTemplateProxy()
    );
  }
}

export default BotFacade;