import {allUsernames} from "./index";

const rooms = [] as string[];
const counterMap = new Map(rooms.map(roomId => [roomId, 0]));
const getCurrentRoomId = socket => Object.keys(socket.rooms).find(roomId => counterMap.has(roomId));

export default io => {
    io.on('connection', socket => {
        //socket.emit('update-rooms', rooms);
        io.on('add-room', (name: string) => {
            rooms.push(name);
            console.log(rooms);
            io.emit('update-rooms', rooms);
        });
        socket.on('check-room', (room: string) => {
            console.log('in rooms check');
            console.log(room);
            console.log(rooms);
            if (rooms.includes(room)) {
                socket.emit('room-taken');
            } else {
                rooms.push(room);
            }
            console.log(rooms);
        });
        socket.on('join-room', (name: string) => {
            socket.join(name);
            io.to(socket.id).emit();
        });
        socket.on('quit-room', (name: string) => {
            socket.leave(name);
        });

    });
}