var express = require('express');
var bodyparser  = require('body-parser');
var app = express();

app.listen(3000);
app.use(express.static('client'));
app.use(bodyparser.json());

var WebSocketServer = require('ws').Server , wss = new WebSocketServer({ port:8087});
console.log("server_started");
var users = [];
wss.on('connection', function connection(ws) {
            
	ws.on('message', function incoming(message) {
    	
      var data; 
      //accepting only JSON messages 
   try { 
     data = JSON.parse(message); 
      console.log(data.uid);
   } catch (e) { 
      console.log(e);       
   } 


      switch (data.mid) { 
         //when a user tries to login 
			
         case "login": 
         console.log("user_connected"+data.uid +data.local+data.public);
          
            users[data.uid] = ws;
		//console.log("user_connect" + users[data.uid]);		
            //if anyone is logged in with this username then refuse 
            
             
				
            break; 

            case "offer":
             console.log("Sending offer to: ", data.rid); 
             //if UserB exists then send him offer details 
            var conn = users[data.rid];
				
            if(conn != null) { 
               console.log("remote_user_exist");
               //conn.send("answer_from_user");
               conn.send(JSON.stringify(data));
               }
            else{
            	users[data.uid].send("user_doesnt_exist");

            }
               
            break;
            case "answer":
            console.log("answer_packet_is_arrived"+data.uid + data.rid);
            var conn = users[data.rid];
            conn.send(JSON.stringify(data));
        break;

        case "offer_candidate":
              console.log("Sending offer_candidte to: ", data.rid);
              var conn = users[data.rid];
              if(conn != null){
              if(data.data != null)
               conn.send(JSON.stringify(data));
           }
               break;

        // case "ips":

        //       console.log(data);
        //       break;
	}

});
});
