
const socketService = (socket) => {
    socket.on('new-common-message', ()=> {
            socket.broadcast.emit('common-message',"new common message recieved");
    })
    socket.on('new-group-message', (groupId)=> {
            socket.broadcast.emit('group-message',groupId);
    })
  }

  module.exports = socketService