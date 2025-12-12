// js/app.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  try{
    const res = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(res.user,{displayName: name});
    // create user doc
    await setDoc(doc(db,'users',res.user.uid), { name, email, createdAt: new Date() });
    location.href = 'feed.html';
  }catch(err){ authMessage.textContent = err.message; }
});

loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try{
    await signInWithEmailAndPassword(auth,email,password);
    location.href = 'feed.html';
  }catch(err){ authMessage.textContent = err.message; }
});

// universal logout links
document.querySelectorAll('#logout-link').forEach(a=>{
  a?.addEventListener('click', async ev=>{
    ev.preventDefault();
    try{ await signOut(auth); location.href = 'index.html'; } catch(err){ alert(err.message); }
  });
});

// protect index when logged in
onAuthStateChanged(auth, user=>{
  if(user && window.location.pathname.endsWith('/index.html')) location.href='feed.html';
});
