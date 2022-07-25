import { Router } from 'express';
import path from 'path';
import { HTML_FILES_PATH } from '../config';
import controller from '../controller';

const router = Router();

router.get('/', (req, res) => {
	const page = path.join(HTML_FILES_PATH, 'login.html');
	res.sendFile(page);
});

router.post('/can-login', (req, res) => {
	const username = req.body?.username;
	if (!username) {
		res.status(422).json({'message': "username is required!"});
		return;
	}
	if (controller.userExists(username)) {
		res.status(400).json({'message': "User with such username is already active!"});
		return;
	}
	res.status(200).json({ message: 'Successfully logged in!' });
});

export default router;
