import { Server } from 'socket.io';

const io = new Server({
    cors: {
        origin: 'https://real-estate-full-stack-sand.vercel.app/',
    },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
    // Evalua si el usuario existe comparandolos por "id"
    const userExists = onlineUser.find((user) => user.userId === userId);

    if (!userExists) {
        onlineUser.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return onlineUser.find((user) => user.userId === userId); // Cambiado 'id' a 'userId'
};

io.on('connection', (socket) => {
    socket.on('newUser', (userId) => {
        addUser(userId, socket.id);
        console.log(onlineUser);
    });

    socket.on('sendMessage', ({ receiverId, data }) => {
        const receiver = getUser(receiverId);
        io.to(receiver.socketId).emit('getMessage', data);
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
    });
});

io.listen('4002');
