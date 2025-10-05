// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpPyjBpsSUpeTBlJNiNYSe6TLkjzJto6c",
  authDomain: "chatflow-57e41.firebaseapp.com",
  projectId: "chatflow-57e41",
  storageBucket: "chatflow-57e41.firebasestorage.app",
  messagingSenderId: "517756291862",
  appId: "1:517756291862:web:a535b6edd00155f2a1de37",
  measurementId: "G-E7B4HVBT7K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// SIGN UP
window.signUp = async function () {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created successfully!");
    localStorage.setItem("user", email);
    window.location = "chat.html";
  } catch (error) {
    alert(error.message);
  }
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    localStorage.setItem("user", email);
    window.location = "chat.html";
  } catch (error) {
    alert(error.message);
  }
};

// LOGOUT
window.logout = async function () {
  await signOut(auth);
  localStorage.removeItem("user");
  window.location = "index.html";
};

// CHAT
window.sendMessage = async function () {
  const msg = document.getElementById("messageInput").value;
  const email = localStorage.getItem("user");

  if (!msg) return;

  await addDoc(collection(db, "messages"), {
    user: email,
    text: msg,
    timestamp: serverTimestamp(),
  });

  document.getElementById("messageInput").value = "";
};

// Realtime messages
if (window.location.pathname.endsWith("chat.html")) {
  const chatBox = document.getElementById("chatBox");
  const q = query(collection(db, "messages"), orderBy("timestamp"));

  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<strong>${msg.user}</strong>: ${msg.text}`;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}