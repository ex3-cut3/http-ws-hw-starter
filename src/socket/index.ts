import { Server } from 'socket.io';
import controller from '../controller';

export default (io: Server) => {
	io.on('connection', socket => {
		const username = socket.handshake.query.username;
		if (!username) {
				throw new Error('Something went wrong');
		}
		controller.addUser(<string>username);

		socket.on('disconnect', socket => {
			controller.removeUser(<string>username);
		});
	});
};
