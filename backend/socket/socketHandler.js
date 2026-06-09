const Activity = require('../models/Activity');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join group room
    socket.on('join-group', (groupId) => {
      socket.join(groupId);
      console.log(`Socket joined group: ${groupId}`);
    });
    
    // Leave group room
    socket.on('leave-group', (groupId) => {
      socket.leave(groupId);
    });
    
    // Broadcast expense added
    socket.on('expense-added', async (data) => {
      const { groupId, expense, userName } = data;
      
      // Emit to all members in group except sender
      socket.to(groupId).emit('new-expense', {
        message: `${userName} added a new expense`,
        expense
      });
    });
    
    // Broadcast settlement
    socket.on('settlement-recorded', (data) => {
      const { groupId, settlement } = data;
      socket.to(groupId).emit('new-settlement', settlement);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;