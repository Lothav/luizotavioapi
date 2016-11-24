var WebSocketServer = require('ws').Server;
var express = require('express');
var pg = require('pg'); /* Postgres */
var path = require("path");

var p2 = require('p2');

var port =  process.env.PORT || 3000;
var index = path.join(__dirname, 'index.html');

var Devil = require('./devil');

/*  Express Server  */

var app = express();
app.use( express.static('./') );
app.use( function(req, res) { res.sendFile( index ) } );
var server = app.listen(port, function(p) { console.log('Listening on ' + p)});


/*  Web Socket  */

var wss = new WebSocketServer({ server : server });
var id = 0;

var webSockets = [];
var players = [];
var devil = {
    x: 64,
    y: 80,
    follow_id: 0
};

var devil_obj = new Devil(false, players[0], webSockets);

wss.on('connection', function(ws) {
    var i, name, player_type;
    var player_id = id++;
    webSockets[player_id]  = ws;

    devil_obj.updateSockets(webSockets);

    ws.on('message', function(message) {
        var incommingMsg = JSON.parse(message);
        /* First Mensage from player */
        if( incommingMsg.name !== undefined ){
            name = incommingMsg.name;
            player_type = incommingMsg.player_type;
            players.push({
                id: player_id,
                name: name,
                x: 800,
                y: 500,
                player_type: player_type,
                fire: false
            });
            ws.send(JSON.stringify({ players: players }));
        } else {
            for (i in players)
                if( players.hasOwnProperty(i) && players[i].id == incommingMsg.id ) {
                    players[i].x = incommingMsg.x;
                    players[i].y = incommingMsg.y;
                    players[i].fire = incommingMsg.fire;
                    break;
                }

            for( i in webSockets ) {
                if (webSockets.hasOwnProperty(i) && webSockets[i].readyState == 1){
                    if( i != incommingMsg.id ){
                        webSockets[i].send(JSON.stringify({ players: players }));
                    } else {
                        var online_players = [];
                        players.forEach(function (p) {
                            online_players.push(p.id);
                        });
                        //webSockets[i].send(JSON.stringify({ online_players: online_players }));
                    }
                }
            }
        }
    });
    ws.on('close', function (close) {
        for(var i = 0; i < players.length; i++){
            if(players[i].id == player_id){
                players.splice(i, 1);
                break;
            }
        }
        delete webSockets[player_id];
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

/*function calcDevilLocation(){
    if(players.length){
        var devil_to = Math.round( Math.random() * (wss.clients.length-1) );
        if( players[devil_to] !== undefined ){
            if( players[devil_to].x > devil.x ) devil.x++;
            else devil.x--;
            devil.follow_id = players[devil_to].id;
        }
    }
}*/

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
