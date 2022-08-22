import React, { useEffect, useContext, useState } from 'react';
import '../../App.js';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import { SocketContext } from '../../context';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { color } from '@mui/system';

const VideoCall = ({ auth: { user } }) => {
  const id = useParams().id;
  const {
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
  } = useContext(SocketContext);

  useEffect(() => {
    if (user) {
      setMyUserId(user._id.toString());
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  }, []);

  // const VideoCamChange = () => {
  //   stream.getVideoTracks().forEach((track) => (track.enabled = false));
  // };

  const [WebCamOn, setWebCamOn] = useState(true);

  return (
    <>
      <div className='container1'>
        <div className='video-container'>
          <div className='video'>
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: '300px', height: '300px' }}
              />
            )}
          </div>
          <div className='video'>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: '300px', height: '300px' }}
              />
            ) : null}
          </div>
        </div>
        <div className='myId'>
          {/* <TextField
            id='filled-basic'
            label='Name'
            variant='filled'
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: '20px' }}
          /> */}
          {/* <CopyToClipboard text={me} style={{ marginBottom: '2rem' }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<AssignmentIcon fontSize='large' />}
            >
              Copy ID
            </Button>
          </CopyToClipboard> */}

          {/* <TextField
            id='filled-basic'
            label='ID to call'
            variant='filled'
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          /> */}

          {/* <IconButton
            color='primary'
            aria-label='call'
            // onClick={() => VoiceChange()}
          >
            <VolumeDownIcon fontSize='large' />
          </IconButton> */}

          <IconButton
            color='primary'
            aria-label='call'
            onClick={
              // () => setWebCamOn(!WebCamOn)
              () =>
                stream
                  .getVideoTracks()
                  .forEach((track) => (track.enabled = false))
            }
          >
            <VideocamIcon fontSize='large' />
          </IconButton>
          <div className='call-button'>
            {callAccepted && !callEnded ? (
              <Button variant='contained' color='secondary' onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color='primary'
                aria-label='call'
                onClick={() => callUser(id)}
              >
                <PhoneIcon fontSize='large' />
              </IconButton>
            )}
            {/* {idToCall} */}
          </div>
        </div>
        <div>
          {call.isReceivingCall && !callAccepted ? (
            <div className='caller'>
              <h1>{name} is calling...</h1>
              <Button variant='contained' color='primary' onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

VideoCall.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(VideoCall);
