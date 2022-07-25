import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import socketHandler from './socket';
import socketGamePage from './socket/rooms';
import routes from './routes';
import { STATIC_PATH, PORT } from './config';

const app = express();
const httpServer = new http.Server(app);
const socketIo = new Server(httpServer);

app.use(express.static(STATIC_PATH));

app.use(express.json());

routes(app);
app.get('*', (req, res) => res.redirect('/login'));

socketHandler(socketIo);
socketGamePage(socketIo);

httpServer.listen(PORT, () => {
  console.log(`Listen server on port ${PORT}`);
});