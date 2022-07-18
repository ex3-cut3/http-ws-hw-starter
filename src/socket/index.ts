import { Server } from 'socket.io';
import * as config from './config';
import Storage from '../storage';

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		if (!username) {
				throw new Error('Something went wrong');
		}
		Storage.addUser(<string>username);

		socket.on('disconnect', socket => {
			Storage.removeUser(<string>username);
		});
	});
};
