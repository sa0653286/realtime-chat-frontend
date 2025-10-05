const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { mongoURI, JWT_SECRET } = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log("MongoDB connected"))
  .catch(err=>console.log(err));

// Schemas
const userSchema = new mongoose.Schema({
  username:String,
  email:String,
  password:String,
  isAdmin:{ type:Boolean, default:false }
});

const chatSchema = new mongoose.Schema({
  from:String,
  to:String,
  message:String,
  createdAt:{ type:Date, default:Date.now }
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);

// Signup
app.post('/signup', async (req,res)=>{
  const { username,email,password } = req.body;
  if(!username||!email||!password) return res.json({success:false,message:"Fill all fields"});
  const exist = await User.findOne({ email });
  if(exist) return res.json({success:false,message:"Email already exists"});
  const hash = await bcrypt.hash(password,10);
  const newUser = new User({ username,email,password:hash });
  await newUser.save();
  res.json({success:true});
});

// Login
app.post('/login', async (req,res)=>{
  const { email,password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.json({success:false,message:"Invalid credentials"});
  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.json({success:false,message:"Invalid credentials"});
  const token = jwt.sign({ id:user._id,email:user.email,isAdmin:user.isAdmin },JWT_SECRET,{ expiresIn:'7d' });
  res.json({success:true,token,user:{username:user.username,email:user.email,isAdmin:user.isAdmin}});
});

// Middleware
const auth = (req,res,next)=>{
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.json({error:"No token"});
  try{
    req.user = jwt.verify(token,JWT_SECRET);
    next();
  }catch(e){ res.json({error:"Invalid token"}); }
};

// Admin Routes
app.get('/admin/users', auth, async (req,res)=>{
  if(!req.user.isAdmin) return res.json({error:"Unauthorized"});
  const users = await User.find({},'username email');
  res.json({users});
});

app.post('/admin/delete-user', auth, async (req,res)=>{
  if(!req.user.isAdmin) return res.json({error:"Unauthorized"});
  const { email } = req.body;
  await User.deleteOne({ email });
  await Chat.deleteMany({ $or:[{from:email},{to:email}] });
  res.json({success:true});
});

// Real-time Chat
io.on("connection", socket=>{
  console.log("User connected:", socket.id);

  socket.on("send_message", async (data)=>{
    const {from,to,message} = data;
    const newChat = new Chat({from,to,message});
    await newChat.save();
    io.emit("receive_message", data);
  });

  socket.on("disconnect", ()=>console.log("User disconnected:", socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
