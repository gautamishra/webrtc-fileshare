'use strict';
//var WebSocket = require('ws');
//function for public ip

$.get("http://jsonip.com",function(data){
 publicip = data.ip;
 console.log(publicip);
})


var myId = Math.floor(Math.random() * 9998) + 1;
   var ws = new WebSocket('ws://localhost:8087/');
				
               ws.onopen = function()
               {
                  // Web Socket is connected, send data using send()
                  var data={
                  	mid:"login",
                 	uid: myId,
                 	local : localip,
                 	public: publicip
                  };
                  ws.send(JSON.stringify(data));
                  //alert("Message is sent...");
               };
				
               ws.onmessage = function (evt)                                                                                                                  
               {
                  var data = JSON.parse(evt.data);
                  switch(data.mid)
                  {
                 case 'offer':
			console.log(data.data);
			
			var remote_descr = new RTCSessionDescription();
			remote_descr.type = "offer";
			remote_descr.sdp  = data.data;
	  
			node.setRemoteDescription(remote_descr).then(
				function() {
					onSetRemoteSuccess(node);
				        console.log("Remote description for callee is set ");
				},
				onSetSessionDescriptionError
			);
			// code for answer step
			desc.uid = myId;
		        desc.rid = data.uid;
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
			remote_descr.sdp  = data.data
	  
			node.setRemoteDescription(remote_descr).then(
				function() {
					onSetRemoteSuccess(node);
					//alert("remote description of caller has been  set");
				},
				onSetSessionDescriptionError
			);
			break;
			case "offer_candidate":
			//sdata = JSON.parse(data.data);
				if(data.data != "null"){
					//alert(data.data);
				node.addIceCandidate(
			    new RTCIceCandidate(JSON.parse(data.data))
			  ).then(
			    function() {
				   onAddIceCandidateSuccess(node);
				   
			               },
			    function(err) {
				    onAddIceCandidateError(node, err);
			                  }
			        );
			   trace(' ICE candidate: \n' + data.data);
				}
				break;

		}
                  
               };
				
               ws.onclose = function()
               { 
                  // websocket is closed.
                  alert("Connection is closed..."); 
               };

// var script = document.createElement('script');
// script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
// script.type = 'text/javascript';
// document.getElementsByTagName('head')[0].appendChild(script);
var dataChannel;
var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
var remoteIdText = document.getElementById('remoteId');
var senddata      = document.getElementById('sendDataChannel');
var messageToSend = document.getElementById('dataToSend');
var recievedmessage = document.getElementById('recievedatachannel');
//var myId = Math.floor(Math.random() * 9998) + 1;
var pause_count=0;

var reader = new window.FileReader();
var chunkLength = 1000;
var file;
var file2;
var arrayToStoreChunks = [];
var fileInput = document.querySelector('input#fileInput');
var downloadAnchor = document.querySelector('a#download');
 var  receivedSize = 0;
 var localip;
 var publicip;
//var myId=1234;
document.getElementById('myIdDiv').innerHTML=myId;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
pause.onclick =pausePlayVid;
hangupButton.onclick = hangup;
senddata.onclick = sendData;
// event -handling for data channel 

function sendData(){
	
//var data = "hye";
//console.log(msg.data);
dataChannel.send(messageToSend.value);
messageToSend.value="";

}

function recievedMessage(event){
	// if(data instanceof Object ){
	// 	getFile(event);
	// }
	
	recievdmessege.value = event.data;
	console.log(event);

}
function pausePlayVid() {
	
	var vid=document.getElementById("localVideo");
	if(pause_count%2==0)
    vid.pause();
    else
    vid.play();
    pause_count++;
	
}

//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var constraints = {
  audio: false,
  video: true
};

//var video = document.querySelector('#localVideo');
var localStream;
var node;
var ice_data;

     //save to disk 



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
			var servers = {
				'iceServers':[
					{
						'url':'stun:stun.l.google.com:19302'
					}
				]
			};
			// var optionalRtpDataChannels = {
			//     optional: [{
			//         RtpDataChannels: true
			//     }]
			// };
		  // Add pc1 to global scope so it's accessible from the browser console
		  node = new RTCPeerConnection(servers);
		  //trace('Created local peer connection object pc1');
		  var k=0;
                node.ondatachannel = function(event) {
			var receiveChannel = event.channel;
			console.log(event.data);
			receiveChannel.onmessage =function(event){
				

				if( event.data instanceof ArrayBuffer)
				{
					k++;
					    // var data = JSON.parse(event.data);
					     receivedSize += event.data.byteLength;


					    arrayToStoreChunks.push(event.data); // pushing chunks in array
					    console.log(arrayToStoreChunks);
					    console.log(event);
					    if (receivedSize === file2.size) {
					    	 var received = new window.Blob(arrayToStoreChunks);
					    	console.log("\pata");
					    	downloadAnchor.href = URL.createObjectURL(received);
						    downloadAnchor.download = file2.name;
						    downloadAnchor.textContent =
						      'Click to download \'' + file2.name + '\' (' + file2.size + ' bytes)';
						    downloadAnchor.style.display = 'block';
					        // saveToDisk(arrayToStoreChunks.join(''), 'fake fileName');

					        arrayToStoreChunks = []; // resetting array
					    }
					
				}
				else if (isJson(event.data))
				{
					file2 = JSON.parse(event.data);
					console.log(file2);
				}
				else{
					
				recievedmessage.value = event.data;
				//console.log(JSON.parse(event.data));
			}
				}
                        }
		  dataChannel = node.createDataChannel("datachannel", {reliable: false});

		//dataChannel.onmessage = function(e){console.log("DC message:" +e.data);};
		dataChannel.onopen = function(){console.log("------ DATACHANNEL OPENED ------");};
		//dataChannel.onclose = function(){console.log("------- DC closed! -------")};
		//dataChannel.onerror = function(){console.log("DC ERROR!!!")};
             node.onicecandidate = function(e) {
			onIceCandidate(node, e);
		  };
			node.addStream(localStream);
            node.onaddstream =  gotRemoteStream;
		//node.ondatachannel = receiveChannelCallback;	
  
}
 	



    function errorCallback(error)
	{
        console.log('navigator.getUserMedia error: ', error);
    }

//navigator.getUserMedia(constraints, successCallback, errorCallback);


function start() {
	trace('Requesting local stream');
	startButton.disabled = true;
	navigator.mediaDevices.getUserMedia({
		audio: true,
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
////////////////////////////ice candidate function///////////////////////////////////////

		   function onIceCandidate(pc, event) {
					console.log("In candidate Block");
					//console.log(event.candidate);
					var ice_data=JSON.stringify(event.candidate);
					console.log(ice_data);
					desc.data = ice_data;

					desc.uid = myId;
					desc.mid="offer_candidate";
			
				   
				   //console.log(desc);
					var jsondata=JSON.stringify(desc);		  
					console.log(jsondata);
					
			ws.send(jsondata);
			
		
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
        
		    ws.send(jsondata);

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
		 //    $.post("login1.php",{data:jsondata},function(data){
			//  alert("your data is recieved successfuly at login1.php page "+data);
			// });	
               ws.send(jsondata);
           	
  }
  
      function gotRemoteStream(e) 
	  {
		  
		  // Add remoteStream to global scope so it's accessible from the browser console
		  window.remoteStream = remoteVideo.srcObject = e.stream;
		  trace('pc2 received remote stream');
      }
  
  
 
  function onAddIceCandidateSuccess(pc) {
	   console.log('Ice candidate of callee has been added');
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



// code for getting local ip address of user 
//get the IP addresses associated with an account
function getIPs(callback){
    var ip_dups = {};

    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;

    //bypass naive webrtc blocking using an iframe
    if(!RTCPeerConnection){
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection
            || win.mozRTCPeerConnection
            || win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
    }

    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{RtpDataChannels: true}]
    };

    var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

    //construct a new RTCPeerConnection
    var pc = new RTCPeerConnection(servers, mediaConstraints);

    function handleCandidate(candidate){
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        var ip_addr = ip_regex.exec(candidate)[1];

        //remove duplicates
        if(ip_dups[ip_addr] === undefined)
            callback(ip_addr);

        ip_dups[ip_addr] = true;
    }

    //listen for candidate events
    pc.onicecandidate = function(ice){

        //skip non-candidate events
        if(ice.candidate)
            handleCandidate(ice.candidate.candidate);
    };

    //create a bogus data channel
    pc.createDataChannel("");

    //create an offer sdp
    pc.createOffer(function(result){

        //trigger the stun server request
        pc.setLocalDescription(result, function(){}, function(){});

    }, function(){});

    //wait for a while to let everything done
    setTimeout(function(){
        //read candidate info from local description
        var lines = pc.localDescription.sdp.split('\n');

        lines.forEach(function(line){
            if(line.indexOf('a=candidate:') === 0)
                handleCandidate(line);
        });
    }, 1000);
}

//Test: Print the IP addresses into the console
getIPs(function(ip){
localip = ip;
console.log(localip);
});

// code for file transfer

document.querySelector('input[type=file]').onchange = function() {
     file = this.files[0];
    // console.log(file);
   //  file2 = file;
  //  console.log(file2);
  //    reader.readAsDataURL(file);
	 // reader.onload = onReadAsDataURL;
   
};


// function sendFile(){
	 
	
// }

// function onReadAsDataURL(event, text) {
//     var data = {}; // data object to transmit over data channel
//     console.log("in onload");
//     if (event) text = event.target.result; // on first invocation

//     if (text.length > chunkLength) {
//         data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
       
//     } else {
//         data.message = text;
//         data.last = true;
//     }

//     dataChannel.send(data); // use JSON.stringify for chrome!

//     var remainingDataURL = text.slice(data.message.length);
//     if (remainingDataURL.length) setTimeout(function () {
//         onReadAsDataURL(null, remainingDataURL); // continue transmitting
//     }, 500)
// };

// 	function getFile(event) {
//     var data = JSON.parse(event.data);

//     arrayToStoreChunks.push(data.message); // pushing chunks in array

//     if (data.last) {
//         saveToDisk(arrayToStoreChunks.join(''), 'fake fileName');
//         arrayToStoreChunks = []; // resetting array
//     }
// };


function sendFile() {
  //var file = fileInput.files[0];
  // trace('File is ' + [file.name, file.size, file.type,
  //     file.lastModifiedDate
  // ].join(' '));

  // Handle 0 size files.
  // statusMessage.textContent = '';
  // downloadAnchor.textContent = '';
   file2  = {
   'lastModified '   : file.lastModified,
   'lastModifiedDate' : file.lastModifiedDate,
   'name'             : file.name,
   'size'             : file.size,
   'type'             : file.type
};
  console.log(JSON.stringify(file2));
  dataChannel.send(JSON.stringify(file2));
  if (file.size === 0) {
    // bitrateDiv.innerHTML = '';
    // statusMessage.textContent = 'File is empty, please select a non-empty file';
    // closeDataChannels();
    return;
  }
  // sendProgress.max = file.size;
  // receiveProgress.max = file.size;
  var chunkSize = 16384;
  var sliceFile = function(offset) {
    var reader = new window.FileReader();
    reader.onload = (function() {
      return function(e) {
        dataChannel.send(e.target.result);
        if (file.size > offset + e.target.result.byteLength) {
          window.setTimeout(sliceFile, 0, offset + chunkSize);
        }
        // sendProgress.value = offset + e.target.result.byteLength;
      };
    })(file);
    var slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };
  sliceFile(0);
}


//json 
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// function for public ip


// var info ={};
// info.local = localip;
// info.public = publicip;
// info.mid = "ips";
// info.uid = myId;
// ws.send(JSON.stringify(info));