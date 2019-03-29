const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser=require('body-parser');
const Nexmo=require('nexmo');
const app = express();
var http=require('http');
var server = http.createServer(app);
var io= require('socket.io').listen(server);

// Passport Config
require('./config/passport')(passport);

app.use(express.static(__dirname));

//body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// DB Config

mongoose.connect('mongodb+srv://asr_123:anurag@123@cluster0-nyfnu.mongodb.net/test1?retryWrites=true',{ useNewUrlParser: true });

let db =mongoose.connection;



db.once('open',function(){

  console.log('connected to mongodb'); 

});



db.on('error',function(err){

  console.log(err);

});
// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


/*
//chat
io.sockets.on('connection',function(socket){
  connections.push(socket);
  console.log('Connected %s sockets connected',connections.length);

  socket.on('disconnect',function(data){
  
    users.splice(users.indexOf(socket.username),1);
    updataUsernames();
     connections.splice(connections.indexOf(socket),1);
      console.log("disconnected %s sockets connected",connections.length);
  });

  //send message
  socket.on('send message',function(data){
   io.sockets.emit('new message',{msg: data, user:socket.username});
  });

  //new user
  socket.on('new user',function(data,callback){
    //console.log('hhasr1');
    callback(true);
    socket.username= data;
    users.push(socket.username);
    updataUsernames();
  });
  function updataUsernames(){
    io.sockets.emit('get users',users);
  }
 
});*/

//important
var chatSchema=mongoose.Schema({
     nick: String,
     msg: String,
     created: {type: Date, default: Date.now}
});

var Chat=mongoose.model('Message',chatSchema);
//important

db.on('error',function(err){

  console.log(err);

});

io.sockets.on('connection',function(socket){
  var query=Chat.find({});
                query.sort('-created').limit(8).exec(function(err,docs){
                         if(err) throw err;
                    //console.log('sending old messages');
                socket.emit('load old msgs',docs);
              });
   
  socket.on('new user',function(data,callback){
     if(data in users)
     {
      callback(false);
     }
     else
     {
      callback(true);
      socket.nickname=data;
      //nicknames.push(socket.nickname);
      users[socket.nickname] = socket;
      updateNicknames();
     }
  });
   function updateNicknames(){
    io.sockets.emit('usernames',Object.keys(users));
   }

  socket.on('send message',function(data,callback)
  {
    var msg =data.trim();
    if(msg.substr(0,3)==='/w ')
    {
      msg=msg.substr(3);
      var ind=msg.indexOf(' ');
      if(ind !=-1){
        var name=msg.substring(0,ind);
        var data=msg.substring(ind+1);
        if (name in users){
          //removal
          var query=Chat.find({});
                query.sort('-created').limit(8).exec(function(err,docs){
                         if(err) throw err;
                    //console.log('sending old messages');
                ///users[name].emit('load old msgs',docs);
              });
                //removal
          users[name].emit('whisper',{msg:data,nick:socket.nickname});
          console.log('whisper');
        }
        else
        {
          callback('Error:enter a valid user');
        }
        
      }
      else
      {

          callback('Error: please enter a message for your whisper.');
      }
      
    }
    else{

        var newMsg=new Chat({msg: msg,nick: socket.nickname});
        newMsg.save(function(err){
          if(err) throw err;
          io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
  });
}
  });


  socket.on('disconnect',function(data){
    if(!socket.nickname)return;
    //nicknames.splice(nicknames.indexOf(socket.nickname),1);
    delete users[socket.nickname];
    updateNicknames();
  });

});


// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

//add  submit post route
 const User1 = require('./models/user1');
app.post('/users/add',function(req,res){
  let item=new User1();
  item.title= req.body.title;
  item.subject=req.body.subject;
  item.name=req.user.name;
  //console.log(req.user.name);
  item
        .save()
        .then(item => {
                res.redirect('/add1');
              })
              .catch(err => console.log(err));

});
//edit
app.post('/edit/:id',function(req,res){
  let item={};
   item.title= req.body.title;
   //console.log(req.body.title);
  item.subject=req.body.subject;
 // console.log(req.body.subject);
  item.name=req.user.name;
  //console.log(req.body.name);
  let query={_id:req.params.id}
  User1.update(query,item,function(err){
     if(err){
      console.log(err);
      return ;
     }
     else{
      res.redirect('/add1');
     }
  })
});

const PORT = process.env.PORT || 6500;

server.listen(PORT, console.log(`Server started on port ${PORT}`));