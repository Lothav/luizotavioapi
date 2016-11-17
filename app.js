var express = require('express');
var app = express();

var pg = require('pg'); /* Postgres */

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: process.env.PORT });

var instance = [];
wss.on('connection', function(ws) {
    var index = instance.length;
    instance[ index ] = {
        index: index,
        player: {
            x: 12,
            y: 50
        }
    };
    ws.on('message', function(message) {
        var incommingMsg = JSON.parse(message);
        instance[incommingMsg.index].player = {
            x: incommingMsg.x,
            y: incommingMsg.y
        };
        for( var i in wss.clients ) {
            if( wss.clients.hasOwnProperty(i) ){
                wss.clients[i].send(JSON.stringify(instance));
            }
        }
    });
    ws.on('close', function close() {
        console.log('disconnected');
    });
    ws.send(JSON.stringify({
        instance: instance,
        index: index
    }));
});

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

app.get('/', function (req, res) { res.send('Hello World!'); });
var port = process.env.PORT || 8080;
app.listen( 3000, function () { console.log('Listening on port ' + port); });
