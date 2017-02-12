'use strict';

var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
var remoteIdText = document.getElementById('remoteId');
var myId = Math.floor(Math.random() * 9998) + 1;

//var myId=1234;
document.getElementById('myIdDiv').innerHTML=myId;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;

hangupButton.onclick = hangup;


//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  audio: false,
  video: true
};

//var video = document.querySelector('#localVideo');
var localStream;
var node;




function gotLocalStream(stream) {
		  trace('Received local stream');
		  localVideo.srcObject = stream;
		  // Add localStream to global scope so it's accessible from the browser console
		  window.localStream = localStream = stream;
		  callButton.disabled = false;
		  
		  
		  var videoTracks = localStream.getVideoTracks();
		  var audioTracks = localStream.getAudioTracks();
		  if (videoTracks.length > 0) {
			trace('Using video device: ' + videoTracks[0].label);
		  }
		  if (audioTracks.length > 0) {
			trace('Using audio device: ' + audioTracks[0].label);
		  }
			var servers = null;
		  // Add pc1 to global scope so it's accessible from the browser console
		  node = new RTCPeerConnection(servers);
		  //trace('Created local peer connection object pc1');
		  node.onicecandidate = function(e) {
			onIceCandidate(node, e);
		  };
			node.addStream(localStream);
  
  //window.stream = stream; // stream available to console
  
  
  //if (window.URL) {
  //  video.src = window.URL.createObjectURL(stream);
  //} else {
  //  video.src = stream;
  //}
}



function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

//navigator.getUserMedia(constraints, successCallback, errorCallback);


function start() {
  trace('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  })
  .then(gotLocalStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
}

                                            //   call function

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};



// ////////////////////////////////////////// call function ///////////////////////////////////////////////////
var remoteId;
var desc={};
function call() {
	remoteId = remoteIdText.value;
	desc.rid = remoteId;
	desc.uid = myId;
  callButton.disabled   =   true;
  hangupButton.disabled =   false;
  trace('Starting call to '+remoteId);
 // startTime = window.performance.now();
  
   node.createOffer(
    offerOptions
  ).then(
    onCreateOfferSuccess,
    onCreateSessionDescriptionError
  );
}


		   function onIceCandidate(pc, event) {
			console.log("candidtae me hun");
			console.log(event.candidate);
		  if (event.candidate) {
			//getOtherPc(pc).addIceCandidate(
			node.addIceCandidate(
			  new RTCIceCandidate(event.candidate)
			).then(
			  function() {
				onAddIceCandidateSuccess(pc);
			  },
			  function(err) {
				onAddIceCandidateError(pc, err);
			  }
			);
			trace(' ICE candidate: \n' + event.candidate.candidate);
		  }
		}

//    on offer success function

function onCreateOfferSuccess(session_description){
	
	// code for setting local description
	trace('Offer from pc1\n' + session_description.sdp);
    trace('pc1 setLocalDescription start');
    node.setLocalDescription(session_description).then(
    function() {
        onSetLocalSuccess(node);
    },
        onSetSessionDescriptionError
  );
	desc.mid="offer";
	//var data=JSON.stringify(session_description)
	//console.log(data);
	desc.data=session_description.sdp;
	//console.log(desc);
	var jsondata=JSON.stringify(desc);		  
        console.log(jsondata);
		    $.post("login1.php",{data:jsondata},function(data){
			 alert("your data is recieved successfuly at login1.php page "+data);
			});	
}

function hangup() {
  trace('Ending call');
  node.close();
  //pc2.close();
  node = null;
 // pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  startButton.disabled=false;
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}



function onSetLocalSuccess(pc) {
  trace(node + ' setLocalDescription complete');
}

var i=0;
function  polling() {
	 
		var userRecord={};
		userRecord.myId=myId;
		//console.log(userRecord);
		var jsonuser=JSON.stringify(userRecord);
		$.post("polling.php",{data:jsonuser},function(data){
			process(data);
			//i++;
			//console.log("t1 "+data);
		});
	setTimeout(function(){
		polling();
   },1000);	
}
 
  polling();
  
  //   function process
  
  function process(data)
  {
	//	 console.log( JSON.parse(data));
	var k={};
	k=JSON.parse(data);
	console.log(k.responses.length);
	for(var count=0;count<k.responses.length; count++){
		//console.log(k.responses[count]);
		switch(k.responses[count].mid)
		{
			case 'offer':
			console.log(k.responses[count].mid);
			//trace('pc2 setRemoteDescription start');
			
			//console.log(JSON.parse(k.responses[count].data));
			
			
			var remote_descr = new RTCSessionDescription();
			remote_descr.type = "offer";
			remote_descr.sdp  = k.responses[count].data
	  
			node.setRemoteDescription(remote_descr).then(
				function() {
					onSetRemoteSuccess(node);
					console.log("offer call");
				},
				onSetSessionDescriptionError
			);
			// code for answer step
			desc.uid=myId;
			desc.rid= k.responses[count].rid;
			desc.mid="answer";
			
			console.log("creating answer");
				node.createAnswer().then(
				onCreateAnswerSuccess,
                onCreateSessionDescriptionError
               );
			
			break;
			
			case 'answer':
			var remote_descr = new RTCSessionDescription();
			remote_descr.type = "answer";
			remote_descr.sdp  = k.responses[count].data
	  
			node.setRemoteDescription(remote_descr).then(
				function() {
					onSetRemoteSuccess(node);
					console.log("answer call");
				},
				onSetSessionDescriptionError
			);
			break;
			
			default:
			console.log("try again"); 
		 
		}
	 
	}
  
  
  }
  
  
  
  function onSetRemoteSuccess(pc) {
  trace('remote caller' + ' setRemoteDescription complete');
}
  //////////////////////////////// create answer  ///////////////////////////////
  function onCreateAnswerSuccess(session_description)
  {
	  desc.data=session_description.sdp;
	  //console.log(session_description);
	  trace('Offer from node\n' + session_description.sdp);
      trace('node setLocalDescription start');
      node.setLocalDescription(session_description).then(
         function() {
				onSetLocalSuccess(node);
					},
				onSetSessionDescriptionError
														);	 
      var jsondata=JSON.stringify(desc);		  
         console.log(jsondata);
		    $.post("login1.php",{data:jsondata},function(data){
			 alert("your data is recieved successfuly at login1.php page "+data);
			});															
  }
      
	    
 
  function onAddIceCandidateSuccess(pc) {
  trace(node + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  trace(node + ' failed to add ICE Candidate: ' + error.toString());
}
  
function trace(text) {
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
   // console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}
