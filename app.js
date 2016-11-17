var express = require('express');
var app = express();

var pg = require('pg'); /* Postgres */

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: process.env.PORT });

console.log('Server started on 8080');


var instance = [];
wss.on('connection', function(ws) {
    instance[ instance.length ] = {
        index: instance.length,
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
        index: instance.length
    }));
});

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
    host:'ec2-54-163-239-218.compute-1.amazonaws.com',
    user: 'jhsjtrqfnpqkmu', //env var: PGUSER
    database: 'd1rtile2fnno07', //env var: PGDATABASE
    password: 'fFDFyNpsek9yRITY38q7-TdyAA', //env var: PGPASSWORD
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
    if(err) {
        return console.error('error fetching client from pool', err);
    }
    client.query('SELECT $1::int AS number', ['1'], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
            return console.error('error running query', err);
        }
        console.log(result.rows[0].number);
        //output: 1
    });
});

pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack)
});

app.get('/', function (req, res) { res.send('Hello World!'); });
var port = process.env.PORT || 8080;
app.listen( 3000, function () { console.log('Listening on port ' + port); });
