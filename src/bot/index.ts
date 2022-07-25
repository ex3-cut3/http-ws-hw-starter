import Bot from './bot';
import BotFacade from './botFacade';

const botFacade: BotFacade = new BotFacade();
const bot: Bot = botFacade.getBot();
export { bot };