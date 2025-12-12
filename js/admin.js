// js/admin.js
import { db } from './firebase.js';
import { collection, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const usersEl = document.getElementById('admin-users');
const postsEl = document.getElementById('admin-posts');

onSnapshot(collection(db,'users'), snap=>{
  usersEl.innerHTML='';
  snap.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s.data().name || s.id;
    usersEl.appendChild(li);
  });
});

onSnapshot(collection(db,'posts'), snap=>{
  postsEl.innerHTML='';
  snap.forEach(s=>{
    const li = document.createElement('li');
    li.innerHTML = `${s.data().text || ''} <button onclick="deletePost('${s.id}')">Delete</button>`;
    postsEl.appendChild(li);
  });
});

window.deletePost = async (id) => { await deleteDoc(doc(db,'posts',id)); }
