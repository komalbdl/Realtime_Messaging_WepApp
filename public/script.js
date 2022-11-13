socket = io('/');

//Handling user video
let userMediaStream;
const userVideoData = navigator.mediaDevices.getUserMedia({
    audio : true,
    video : true
}).then((mediaStream) => {
    userMediaStream = mediaStream;
  addThisVideoElement(mediaStream);

  //If someone call is coming it will send my stream to them
  peer.on('call', call => {
    call.answer(mediaStream);
    call.on('stream', userVideoStream => {
        addThisVideoElement(userVideoStream);
    });
  });

  socket.on('user-connected', (userPeerId) => {
        console.log('user connected with peerid : ' + userPeerId);
        callToNewUser(userPeerId, mediaStream);
    });
}).catch((err) => {
  console.error(`${err.name}: ${err.message}`);
});

const myVideo = document.getElementById('video-grid');
const addThisVideoElement = (mediaStream) => {
    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.onloadedmetadata = () => {
        video.play();
    };
    myVideo.append(video);
};

//Peer handling (Peer was included in room.ejs)
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    //for deployment its 443 else local port
    port: '443'
});
peer.on('open', (id) => {
    socket.emit('join-room', ROOMID, id);
});

const callToNewUser = (userPeerId, mediaStream) => {
    //calling new user and add his videostream
    const call = peer.call(userPeerId, mediaStream);
    call.on('stream', (userVideoStream) => {
        addThisVideoElement(userVideoStream);
    });
};


let chatMessage = $('input');
$('html').keydown((e) => {
    if(e.which == 13 && chatMessage.val() !== 0) {
        socket.emit('message', chatMessage.val());
        chatMessage.val('');
    };
});

socket.on('broadcastedMessage', (chatMessage) => {
    //This is send to all users including sender
    $('ul').append(`<li class="message"><b>User</b><br/>${chatMessage}<li>`);
    scrollToBottom();
});

const scrollToBottom = () => {
    //Handle overflow of message using scroll
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"))
};

const muteUnmute = () => {
    const enabled = userMediaStream.getAudioTracks()[0].enabled;
    if(enabled) {
        userMediaStream.getAudioTracks()[0].enabled = false;
        setMuteButton();
    }
    else {
        setUnmuteButton();
        userMediaStream.getAudioTracks()[0].enabled = true;
    }
};

const setUnmuteButton = () => {
    const html = `<i class="fa-solid fa-microphone-lines"></i><span>Mute</span>`;
    $('.main__mute_button').html(html);
};

const setMuteButton = () => {
    const html = `<i class="fa-solid fa-microphone-lines-slash"></i><span>Unmute</span>`;
    $('.main__mute_button').html(html);
};

const playStopVideo = () => {
    const enabled = userMediaStream.getVideoTracks()[0].enabled;
    if(enabled) {
        userMediaStream.getVideoTracks()[0].enabled = false;
        stopVideoButton();
    }
    else {
        playVideoButton();
        userMediaStream.getVideoTracks()[0].enabled = true;
    }
};

const stopVideoButton = () => {
    const html = `<i class="fas fa-video-slash"></i><span>Stop video</span>`;
    $('.main__video_button').html(html);
};

const playVideoButton = () => {
    const html = `<i class="fas fa-video"></i><span>Start video</span>`;
    $('.main__video_button').html(html);
};