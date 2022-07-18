import { Router } from 'express';
import path from 'path';
import { HTML_FILES_PATH } from '../config';
import Storage from '../storage';
import * as data from '../data';

const router = Router();

router.get('/', (req, res) => {
	const page = path.join(HTML_FILES_PATH, 'game.html');
	res.sendFile(page);
});

router.post('/rooms', (req, res) => {
	const roomName = req.body?.roomName;
	if (!roomName) {
		res.status(422).json({'message': "Room name is required!"});
		return;
	}
	if (Storage.roomExists(roomName)) {
		res.status(400).json({'message': "Room with such name is already exists!"});
		return;
	}
	Storage.addRoom(roomName);
	res.status(200).json({ message: 'Room created!' });
});

router.get('/rooms/users/:room', (req, res) => {
	const roomName = req.params.room;
	const usersList = Storage.getUsersByRoom(roomName);
	res.status(200).json({ users: usersList });
});

router.get('/rooms/can-join/:room', (req, res) => {
	const canJoin = Storage.canJoinTheRoom(req.params.room);
	res.status(200).json({ canJoin: canJoin });
});

router.get('/rooms', (req, res) => {
	const roomsList = Storage.getAvailableRooms();
	res.status(200).json({
		rooms: roomsList
	});
})

router.get('/texts/:id', (req, res) => {
	const textIndex: number = Number(req.params.id);
	res.status(200).json({
		text: textIndex < data.texts.length ? data.texts[textIndex] : data.getRandomText()
	});
})

export default router;
