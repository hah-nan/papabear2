exports = module.exports = function (io) {
  // Set socket.io listeners.
  io.on('connection', (socket) => {
    // console.log('a user connected');

    socket.emit('update game', { locations : [0,1], player : { a: 1 } })

    // On conversation entry, join broadcast channel
    socket.on('enter conversation', (conversation) => {
      socket.join(conversation);
      // console.log('joined ' + conversation);
    });

    // On conversation entry, join broadcast channel
    socket.on('join game', (gameId) => {
      socket.join(gameId);
      // console.log('joined ' + conversation);
    });

    socket.on('leave game', (gameId) => {
      socket.leave(gameId);
      // console.log('joined ' + conversation);
    });

    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      // console.log('left ' + conversation);
    });

    socket.on('new message', (conversation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
    });

    socket.on('disconnect', () => {
      // console.log('user disconnected');
    });
  });
};
