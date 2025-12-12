// js/admin.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const usersEl = document.getElementById('admin-users');
const postsEl = document.getElementById('admin-posts');

onAuthStateChanged(auth, user=>{
  if(!user) return location.href='index.html';
  // only allow if this user is admin (we rely on email check for now)
  if(user.email !== 'healingheart702@gmail.com') {
    alert('Admin only'); location.href='feed.html'; return;
  }

  onSnapshot(collection(db,'users'), snap=>{
    usersEl.innerHTML=''; snap.forEach(s=>{ const li = document.createElement('li'); li.textContent = s.data().name || s.id; usersEl.appendChild(li); });
  });

  onSnapshot(collection(db,'posts'), snap=>{
    postsEl.innerHTML=''; snap.forEach(s=>{ const li = document.createElement('li'); li.innerHTML = `${s.data().text || ''} <button class="admin-delete" data-id="${s.id}">Delete</button>`; postsEl.appendChild(li); });
  });
});

document.addEventListener('click', async (e)=>{
  if(e.target.matches('.admin-delete')){
    const id = e.target.dataset.id;
    if(confirm('Delete post permanently?')) await deleteDoc(doc(db,'posts',id));
  }
});
