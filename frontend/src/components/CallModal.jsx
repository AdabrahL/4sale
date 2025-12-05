import { useState, useRef, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import '../styles/callmodal.css';

export default function CallModal({ 
  isOpen, 
  onClose, 
  callType, // 'video' or 'audio'
  otherUser,
  socket,
  isInitiator,
  signal 
}) {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    if (!isOpen) return;

    // Get user media
    const getMedia = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Edge.');
          onClose();
          return;
        }

        const constraints = {
          video: callType === 'video' ? { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          } : false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        // Initialize peer connection
        const peer = new SimplePeer({
          initiator: isInitiator,
          trickle: false,
          stream: mediaStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        peer.on('signal', (data) => {
          // Send signal to other peer via socket
          socket.emit('callSignal', {
            to: otherUser.id,
            signal: data,
            callType
          });
        });

        peer.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setCallStatus('active');
          startTimer();
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
          endCall();
        });

        peer.on('close', () => {
          endCall();
        });

        // If receiving a call, handle incoming signal
        if (!isInitiator && signal) {
          peer.signal(signal);
        }

        peerRef.current = peer;
        setCallStatus(isInitiator ? 'ringing' : 'connecting');

      } catch (err) {
        console.error('Error accessing media devices:', err);
        
        let errorMessage = 'Could not access camera/microphone.\n\n';
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage += 'Permission denied. Please:\n';
          errorMessage += '1. Click the camera/microphone icon in your browser address bar\n';
          errorMessage += '2. Allow access to camera and microphone\n';
          errorMessage += '3. Try calling again';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage += 'No camera or microphone found.\n';
          errorMessage += 'Please connect a camera/microphone and try again.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage += 'Camera/microphone is already in use by another application.\n';
          errorMessage += 'Please close other applications and try again.';
        } else {
          errorMessage += 'Please check your browser permissions and try again.\n';
          errorMessage += 'Make sure you are using Chrome, Firefox, or Edge.';
        }
        
        alert(errorMessage);
        onClose();
      }
    };

    getMedia();

    // Socket listeners
    socket.on('callSignal', ({ signal }) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    });

    socket.on('callEnded', () => {
      endCall();
    });

    return () => {
      socket.off('callSignal');
      socket.off('callEnded');
    };
  }, [isOpen, isInitiator, signal, callType, otherUser, socket]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Notify other peer
    socket.emit('endCall', { to: otherUser.id });

    setCallStatus('ended');
    setStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream && callType === 'video') {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="call-modal-overlay">
      <div className={`call-modal ${callType === 'video' ? 'video-call' : 'audio-call'}`}>
        {/* Remote Video/Audio */}
        {callType === 'video' ? (
          <div className="call-remote-video">
            <video 
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            {!remoteStream && (
              <div className="call-avatar-placeholder">
                <img 
                  src={otherUser.photo || '/default-avatar.png'} 
                  alt={otherUser.name}
                  className="call-avatar-large"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="call-audio-display">
            <img 
              src={otherUser.photo || '/default-avatar.png'} 
              alt={otherUser.name}
              className="call-avatar-large"
            />
          </div>
        )}

        {/* Call Info */}
        <div className="call-info">
          <h3 className="call-user-name">{otherUser.name}</h3>
          <p className="call-status-text">
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'active' && formatDuration(callDuration)}
            {callStatus === 'ended' && 'Call ended'}
          </p>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && stream && (
          <div className="call-local-video">
            <video 
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="local-video"
            />
          </div>
        )}

        {/* Call Controls */}
        <div className="call-controls">
          <button 
            className={`call-control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <i className={`fa fa-${isMuted ? 'microphone-slash' : 'microphone'}`}></i>
          </button>

          {callType === 'video' && (
            <button 
              className={`call-control-btn ${isVideoOff ? 'active' : ''}`}
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              <i className={`fa fa-${isVideoOff ? 'video-camera' : 'video-camera'}`}></i>
              {isVideoOff && <span className="slash-icon">/</span>}
            </button>
          )}

          <button 
            className="call-control-btn end-call"
            onClick={endCall}
            title="End call"
          >
            <i className="fa fa-phone"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
