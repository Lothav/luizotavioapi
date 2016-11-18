var WebSocketServer = require('ws').Server;
var express = require('express');
var pg = require('pg'); /* Postgres */
var path = require("path");

var port = process.env.PORT || 3000;
var index = path.join(__dirname, 'index.html');

/*  Express Server  */

var server = express()
    .use( function(req, res) { res.sendFile( index ) } )
    .listen(port, function(p) { console.log('Listening on ' + p)});


/*  Web Socket  */

var wss = new WebSocketServer({ server : server });
var id = 0;

var players = [];
wss.on('connection', function(ws) {
    var i, name;
    ws.on('message', function(message) {
        var incommingMsg = JSON.parse(message);
        /* First Mensage from player */
        if( incommingMsg.name !== undefined ){
            name = incommingMsg.name;
            players.push({
                id: id,
                name: name,
                x: 800,
                y: 500
            });
        } else {
            for (i in players)
                if( players.hasOwnProperty(i) && players[i].id == incommingMsg.id ) {
                    players[i].x = incommingMsg.x;
                    players[i].y = incommingMsg.y;
                    break;
                }
            for( i in wss.clients ) {
                if( wss.clients.hasOwnProperty(i) ){
                    wss.clients[i].send(JSON.stringify({ players: players }));
                }
            }
        }
    });
    ws.on('close', function (close) {
        for(var i = 0; i < players.length; i++){
            if(players[i].id == id){
                players.splice(i, 1);
                break;
            }
        }
        console.log('players '+ name +' disconnected: ' + close);
    });
    /*  Fist time connected : Send id to new players
        and new players to the others playerss  */
    ws.send(JSON.stringify({ id: id }));
    for( i in wss.clients ) {
        if( wss.clients.hasOwnProperty(i) ){
            wss.clients[i].send(JSON.stringify({ players: players }));
        }
    }
    id++;
});


/*  Postgres DB */
var config = {
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


