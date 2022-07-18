export default {
    async makeRequest(method, path, query = {}, body = {}) {
        const options = {
            method: method,
            headers: {'Content-Type': 'application/json'},
        };
        if (Object.keys(body).length) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(
            path,
            options
        );
        const resDecoded = await res.json();
        if (!res.ok) {
            throw new Error(resDecoded.message);
        }
        return resDecoded;
    },
    async createRoom(roomName) {
        return await this.makeRequest('POST', '/game/rooms', {},{
            roomName: roomName
        });
    },
    async getRooms() {
        return await this.makeRequest('GET', '/game/rooms');
    },
    async getUsersInTheRoom(roomName) {
        return await this.makeRequest('GET', `/game/rooms/users/${roomName}`);
    },
    async canJoin(roomName) {
        return await this.makeRequest('GET', `/game/rooms/can-join/${roomName}`);
    },
    async getTextById(id) {
        return await this.makeRequest('GET', `/game/texts/${id}`);
    }
}