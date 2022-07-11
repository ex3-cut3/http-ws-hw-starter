import { Server } from 'socket.io';
import * as config from './config';
import game from "./game";

export const allUsernames = [] as string[];

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username as string;
		if(allUsernames.includes(username)) {
			socket.emit('username-taken');
		}
		else {
			allUsernames.push(username);
			localStorage.setItem('usernames', JSON.stringify(allUsernames));
		}
		console.log(allUsernames);
	});
	game(io.of('/game'));
};
