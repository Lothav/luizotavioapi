var WebSocketServer = require('ws').Server;
var express = require('express');
var pg = require('pg'); /* Postgres */
var path = require("path");

var port = process.env.PORT || 3000;
var index = path.join(__dirname, 'index.html');

/*  Express Server  */

var server = express()
//.use( function(req, res) { res.sendFile( index ) } )
    .listen(port, function(p) { console.log('Listening on ' + p)});


/*  Web Socket  */

var wss = new WebSocketServer({ server : server });
var id = 0;

var players = [];
var devil = {
    x: 64,
    y: 80,
    follow_id: 0
};
wss.on('connection', function(ws) {
    var i, name;
    var player_id = id++;
    ws.on('message', function(message) {
        var incommingMsg = JSON.parse(message);
        /* First Mensage from player */
        if( incommingMsg.name !== undefined ){
            name = incommingMsg.name;
            players.push({
                id: player_id,
                name: name,
                x: 800,
                y: 500
            });
            ws.send(JSON.stringify({ devil: devil }));
        } else {
            for (i in players)
                if( players.hasOwnProperty(i) && players[i].id == incommingMsg.id ) {
                    players[i].x = incommingMsg.x;
                    players[i].y = incommingMsg.y;
                    break;
                }
            calcDevilLocation();

            for( i in wss.clients ) {
                if( wss.clients.hasOwnProperty(i) ){
                    wss.clients[i].send(JSON.stringify({ players: players,devil: devil }));
                }
            }
        }
        if(incommingMsg.devil !== undefined)
            devil.y = incommingMsg.devil.y;

        // while( wss.clients.length ){
        /*for( i in wss.clients ) {
         if( wss.clients.hasOwnProperty(i) ){
         wss.clients[i].send(JSON.stringify({ devil: devil }));
         }
         }*/
        //}

    });
    ws.on('close', function (close) {
        for(var i = 0; i < players.length; i++){
            if(players[i].id == player_id){
                players.splice(i, 1);
                break;
            }
        }
        console.log('players '+ name +' disconnected: ' + close);
    });
    /*  Fist time connected : Send id to new players
     and new players to the others playerss  */
    ws.send(JSON.stringify({ id: player_id }));
    for( i in wss.clients ) {
        if( wss.clients.hasOwnProperty(i) ){
            wss.clients[i].send(JSON.stringify({ players: players }));
        }
    }
});

function calcDevilLocation(){
    if(players.length){
        var devil_to = Math.round( Math.random() * (wss.clients.length-1) );
        if( players[devil_to].x > devil.x ) devil.x++;
        else devil.x--;
        devil.follow_id = devil_to;
    }
}

/*  Postgres DB */
/*var config = {
 host:'ec2-54-163-239-218.compute-1.amazonaws.com',
 user: 'jhsjtrqfnpqkmu',
 database: 'd1rtile2fnno07',
 password: 'fFDFyNpsek9yRITY38q7-TdyAA',
 port: 5432,
 max: 10,
 idleTimeoutMillis: 30000
 };

 var pool = new pg.Pool(config);

 pool.connect(function(err, client, done) {
 if(err) return console.error('error fetching client from pool', err);
 client.query('SELECT $1::int AS number', ['1'], function(err, result) {
 done();
 if(err) return console.error('error running query', err);

 console.log(result.rows[0].number);
 //output: 1
 });
 });

 pool.on('error', function (err, client) {
 console.error('idle client error', err.message, err.stack)
 });

 */
