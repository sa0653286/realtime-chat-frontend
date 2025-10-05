const backend = "https://chatflow-backend-574t.onrender.com";

// Popup function
function showPopup(title,msg){
  const popup=document.getElementById('popup');
  document.getElementById('popup-title').textContent=title;
  document.getElementById('popup-msg').textContent=msg;
  popup.style.display='flex';
  setTimeout(()=>popup.style.display='none',2000);
}

// Signup
async function signup(){
  const username=document.getElementById('signup-username').value.trim();
  const email=document.getElementById('signup-email').value.trim();
  const password=document.getElementById('signup-password').value.trim();
  if(!username||!email||!password){showPopup("Error ❌","Fill all fields");return;}
  const res=await fetch(`${backend}/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,email,password})});
  const data=await res.json();
  if(data.success){showPopup("Success ✅","Account created!");setTimeout(()=>window.location.href="login.html",1500);}
  else showPopup("Error ❌",data.message||"Signup failed");
}

// Login
async function login(){
  const email=document.getElementById('login-email').value.trim();
  const password=document.getElementById('login-password').value.trim();
  if(!email||!password){showPopup("Error ❌","Fill all fields");return;}
  const res=await fetch(`${backend}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const data=await res.json();
  if(data.success){
    localStorage.setItem('token',data.token);
    localStorage.setItem('username',data.user.username);
    localStorage.setItem('email',data.user.email);
    showPopup("Success ✅","Login successful");
    setTimeout(()=>window.location.href="dashboard.html",1500);
  }else showPopup("Error ❌",data.message||"Invalid credentials");
}

// Load Dashboard
async function loadDashboard(){
  document.getElementById('user-name').textContent=localStorage.getItem('username')||'Guest';
}

// Socket.io Chat
let socket;
function initChat(){
  socket=io(backend);
  const chatBox=document.getElementById('chat-box');
  const sendBtn=document.getElementById('sendBtn');
  const msgInput=document.getElementById('msgInput');
  const username=localStorage.getItem('email');

  sendBtn.onclick=()=>{
    const message=msgInput.value.trim();
    if(!message)return;
    const to='all';
    socket.emit('send_message',{from:username,to,message});
    msgInput.value='';
  };

  socket.on('receive_message',data=>{
    const div=document.createElement('div');
    div.textContent=`${data.from}: ${data.message}`;
    chatBox.appendChild(div);
  });
}
