var express = require('express');
var mysql = require('mysql');
var http = require('http');
var app = express();

var connection = mysql.createConnection({
		host :'localhost',
		user :'root',
		password:'',
		database :'webrtc',
		port:3306
});
connection.connect(function(err){
	if(err)
		console.log(err);
	else
		console.log('connected');
}); 

var server = http.createServer();
server.on('request', function(request, response) {
  // the same kind of magic happens here!
 response.end("sab badhiyaan ji");
});


app.listen(3333);
