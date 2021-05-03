var
    express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    uid = 0;
count = 0;
pool = new Array();

// var IDPool = require('./idpool.js');

app.use(express.static(__dirname + '/'));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
  res.sendfile('index.html',{root:__dirname});
});


io.on('connection', function(socket){

  ++uid;


  var tank = {
    x:Math.random() * 1000, y:Math.random() * 700, id: uid
  };
  socket.tank = tank;

  for(var i = 0; i < count; i++)
  {
    pool[i].emit('addTank', ['addTank', socket.tank.id, socket.tank.x, socket.tank.y]);
  }
  pool.push(socket);

  count = pool.length;
  for(var i = 0; i < count; i++)
  {
    socket.emit('addTank', ['addTank', pool[i].tank.id, pool[i].tank.x, pool[i].tank.y]);
  }

  socket.emit('control', ['control', socket.tank.id]);

  console.log("Total players " + count);


  socket.on('disconnect', function(){
    var des = socket.tank.id;
    pool.splice(pool.indexOf(socket), 1);
    count = pool.length;
    for(var j = 0; j < count; j++)
    {
      pool[j].emit('destroy', socket.tank);
    }

    console.log("Total players " + count);
  });

  socket.on('move', function(data){
    for(var j = 0; j < count; j++)
    {
      if(pool[j].tank.id != data[1])
      {
        pool[j].emit('move', ['move', data[1], data[2], data[3]]);
      }
    }
  });

  socket.on('fire', function(data){
    for(var j = 0; j < count; j++)
    {
      pool[j].emit('fire', data);
    }
  });

  // socket.on('addCreep', function(data) {
  //
  // });

});

http.listen(3030, function(){
  console.log('listening on *:3030');
});