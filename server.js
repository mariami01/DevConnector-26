const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const { compareSync } = require('bcryptjs');

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

// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });
// // when connection happens
// io.on('connection', (socket) => {
//   console.log('me', socket.id);
//   // return user id
//   socket.emit('me', socket.id);

//   // socket.on('joined', (userId) => {
//   //   console.log(`user joined: ${userId}`);
//   //   io.emit('user-joined', userId, socket.id);
//   // });

//   socket.on('disconnect', () => {
//     socket.broadcast.emit('callEnded');
//   });

//   // start call
//   socket.on('callUser', (data) => {
//     io.to(data.userToCall).emit('callUser', {
//       signal: data.signalData,
//       from: data.from,
//       name: data.name,
//     });
//   });
//   // answer call
//   socket.on('answerCall', (data) => {
//     io.to(data.to).emit('callAccepted', data.signal);
//   });
// });

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Running');
});

io.on('connection', (socket) => {
  console.log(`socket connected with socketId : ${socket.id}`);
  socket.emit('me', socket.id);

  socket.on('joined', (userId) => {
    console.log(`user joined: ${userId}, socketId: ${socket.id}`);
    io.emit('user-joined', userId, socket.id);
  });

  socket.on('joined-before', (userId) => {
    console.log(`user joined before: ${userId}, socketId:${socket.id}`);
    io.emit('user-joined-before', userId, socket.id);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    console.log(`callUser emited, userToCall: ${userToCall}, from: ${from}`);
    io.to(userToCall).emit('callUser', { signal: signalData, from, name });
  });

  socket.on('answerCall', (data) => {
    console.log(`answercall emited, userToCall: ${data.to}`);

    io.to(data.to).emit('callAccepted', data.signal);
  });
});

// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
