const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// get socket io

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
// when connection happens
io.on('connection', (socket) => {
  console.log('meee', socket.id);
  // return user id
  socket.emit('me', socket.id);

  socket.on('joined', (userId) => {
    console.log(`user joined: ${userId}`);
    io.emit('user-joined', userId, socket.id);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  // start call
  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });
  // answer call
  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
