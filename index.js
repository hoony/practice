var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var db = mysql.createConnection(dbconfig);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    db.query('SELECT list FROM playlist', function(err, rows){
        if(err){
            console.error(err);
        }else{
            socket.emit('sync playlist', JSON.parse(rows[0].list));
        }
    });

    socket.on('add music', function(music){
        io.emit('add music', music);
        db.query('SELECT * FROM playlist', function(err, rows){
            if(err){
                console.error(err);
            }else{
                var listId = rows[0].id;
                var list = JSON.parse(rows[0].list);
                list.push(music);
                console.log('Id: ' + listId + ', ' + 'List: ' + JSON.stringify(list));
                db.query('UPDATE playlist SET list = ? WHERE id = ?', [JSON.stringify(list), listId], function(err, result){
                    if(err) console.error(err);
                    else console.log(result);
                });
            }
        });
    });

    socket.on('delete music', function(music){
        io.emit('delete music', music);
        db.query('SELECT * FROM playlist', function(err, rows){
            if(err){
                console.error(err);
            }else{
                var listId = rows[0].id;
                var list = JSON.parse(rows[0].list);
                console.log('Id: ' + listId + ', ' + 'List: ' + JSON.stringify(list));
                for(var i in list){
                    if(list[i].song == music.song && list[i].artist == music.artist){
                        list.splice(i, 1);
                        console.log('Id: ' + listId + ', ' + 'List: ' + JSON.stringify(list));
                        break;
                    }
                }
                db.query('UPDATE playlist SET list = ? WHERE id = ?', [JSON.stringify(list), listId], function(err, result){
                    if(err) console.error(err);
                    else console.log(result);
                });
            }
        });
    });

    socket.on('disconnect', function(){
        console.log('user disconnect');
    });
});
http.listen(3000, function(){
    console.log('listening on port:3000');
});
