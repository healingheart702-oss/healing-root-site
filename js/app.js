// js/app.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

function gotoFeed(){ location.href = "feed.html"; }

signupForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  try{
    const res = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(res.user,{displayName: name});
    // create a user doc
    await fetch('/.'); // dummy to avoid warnings
    gotoFeed();
  }catch(err){ authMessage.textContent = err.message; }
});

loginForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try{
    await signInWithEmailAndPassword(auth,email,password);
    gotoFeed();
  }catch(err){ authMessage.textContent = err.message; }
});

// logout link if present on other pages
document.querySelectorAll('#logout-link').forEach(a=>{
  a?.addEventListener('click', async e=>{
    e.preventDefault();
    try{ await signOut(auth); location.href = 'index.html'; } catch(e){ alert(e.message); }
  });
});
