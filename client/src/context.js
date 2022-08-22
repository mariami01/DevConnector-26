import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io();
const userSockets = {};

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [myUserId, setMyUserId] = useState();

  const myVideo = useRef(null);
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    socket.on('me', (id) => {
      setMe(id);
    });
  }, []);

  useEffect(() => {
    if (!myUserId) {
      return;
    }
    console.log(`user joining with id: ${myUserId}`);
    socket.emit('joined', myUserId); // TODO  must pass current userId

    socket.on('user-joined', (userId, socketId) => {
      console.log(`joined: userId: ${userId}, socketId: ${socketId}`);

      userSockets[userId] = socketId;
      // if (!getUserSocketId(userId)) {
      //   userSockets.push({
      //     userId: userId,
      //     socketId: socketId,
      //   });
      // }
      socket.emit('joined-before', myUserId);
    });

    socket.on('user-joined-before', (userId, socketId) => {
      console.log(`joined before me: userId: ${userId}, socketId: ${socketId}`);

      userSockets[userId] = socketId;
      // if (!getUserSocketId(userId)) {
      //   userSockets.push({
      //     userId: userId,
      //     socketId: socketId,
      //   });
      // }
    });

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      console.log(`vigaca mirekaaavs, from: ${from}`);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, [myUserId]);

  const getUserSocketId = (userId) => {
    let socketId = null;
    userSockets.forEach((userSocket) => {
      if (userSocket.userId == userId) {
        socketId = userSocket.socketId;
      }
    });
    return socketId;
  };
  const answerCall = () => {
    console.log('vpasuxoooob');
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then((currentStream) => {
    //     setStream(currentStream);
    //   });
    setCallAccepted(true);

    debugger;
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', (data) => {
      console.log('davsignalde');
      socket.emit('answerCall', { signal: data, to: call.from });
    });
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (id) => {
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then((currentStream) => {
    //     setStream(currentStream);
    //   });
    console.log(`calling user, userId: ${id.toString()}, socketID: ${
      userSockets[id]
    }
    `);
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', (data) => {
      const userSocketIdToCall = userSockets[id];
      console.log('signaaaaaal');
      socket.emit('callUser', {
        userToCall: userSocketIdToCall,
        signalData: data,
        from: me,
        name,
      });
    });
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });
    socket.on('callAccepted', (signal) => {
      console.log('accepted');
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        setStream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        setMyUserId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
