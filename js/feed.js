// js/feed.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const postBtn = document.getElementById('post-btn');
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const feedContainer = document.getElementById('feed-container');
const postStatus = document.getElementById('post-status');

let currentUser = null;

// helper upload to cloudinary
async function uploadToCloudinary(file, folder='healingroot/posts'){
  const url = CLOUDINARY.uploadUrl(CLOUDINARY.cloudName);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.unsignedPreset);
  fd.append('folder', folder);
  const res = await fetch(url, { method:'POST', body: fd });
  const json = await res.json();
  return json.secure_url;
}

onAuthStateChanged(auth, user=>{
  if(!user) location.href='index.html';
  currentUser = user;
});

// create post
postBtn?.addEventListener('click', async ()=>{
  if(!currentUser) return alert('Login first');
  const text = (postText.value||'').trim();
  if(!text && (!postImage.files || !postImage.files[0])) return alert('Add text or image');
  postStatus.textContent = 'Posting...';
  let imageUrl = '';
  if(postImage.files && postImage.files[0]) imageUrl = await uploadToCloudinary(postImage.files[0]);
  await addDoc(collection(db,'posts'), { userUid: currentUser.uid, text, imageUrl, createdAt: new Date() });
  postText.value = ''; postImage.value = '';
  postStatus.textContent = 'Posted';
  setTimeout(()=>postStatus.textContent='',1500);
});

// live posts
const q = query(collection(db,'posts'), orderBy('createdAt','desc'));
onSnapshot(q, async snapshot=>{
  feedContainer.innerHTML = '';
  for(const s of snapshot.docs){
    const p = s.data();
    const postId = s.id;
    let name = 'User';
    try{ const ud = await getDoc(doc(db,'users',p.userUid)); if(ud.exists()) name = ud.data().name || name; }catch(e){}
    const el = document.createElement('div');
    el.className = 'post-card';
    el.innerHTML = `
      <div class="row" style="align-items:center">
        <img src="${p.imageUrl ? p.imageUrl : 'images/default-profile.png'}" style="width:54px;height:54px;border-radius:8px;object-fit:cover;margin-right:10px">
        <div><strong>${name}</strong><div class="small">${new Date(p.createdAt?.seconds ? p.createdAt.seconds*1000 : p.createdAt).toLocaleString()}</div></div>
      </div>
      <p>${p.text||''}</p>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%;margin-top:8px;border-radius:8px">` : ''}
      <div class="row" style="margin-top:8px">
        <button class="comment-btn" data-id="${postId}">Comment</button>
        ${(currentUser && (currentUser.email==='healingheart702@gmail.com' || p.userUid===currentUser.uid)) ? `<button class="delete-post" data-id="${postId}">Delete</button>` : ''}
        <a target="_blank" class="small" href="https://wa.me/2349138938301?text=${encodeURIComponent('I want to order / enquire about this post: '+ (p.text||''))}">Order via WhatsApp</a>
      </div>
      <div id="comments-${postId}" style="margin-top:8px"></div>
      <div id="comment-box-${postId}" style="display:none; margin-top:8px;">
        <input id="comment-input-${postId}" placeholder="Write a comment">
        <button class="send-comment" data-id="${postId}">Send</button>
      </div>
    `;
    feedContainer.appendChild(el);

    // comments subcollection listener
    const commentsQ = query(collection(db,'posts',postId,'comments'), orderBy('createdAt'));
    onSnapshot(commentsQ, snapC=>{
      const cdiv = document.getElementById(`comments-${postId}`);
      cdiv.innerHTML = '';
      snapC.forEach(cd=>{
        const cc = cd.data();
        const pEl = document.createElement('p');
        pEl.innerHTML = `<b>${cc.name}:</b> ${cc.text}`;
        cdiv.appendChild(pEl);
      });
    });
  }
});

// event delegation
document.addEventListener('click', async (e)=>{
  if(e.target.matches('.comment-btn')){
    const id = e.target.dataset.id; const box = document.getElementById(`comment-box-${id}`); box.style.display = box.style.display === 'none' ? 'block' : 'none';
  } else if(e.target.matches('.send-comment')){
    const id = e.target.dataset.id; const input = document.getElementById(`comment-input-${id}`); const text = input.value.trim();
    if(!text) return;
    const u = auth.currentUser;
    const ud = await getDoc(doc(db,'users',u.uid)); const name = ud.exists()? ud.data().name : u.email.split('@')[0];
    await addDoc(collection(db,'posts',id,'comments'), { uid: u.uid, name, text, createdAt: new Date() });
    input.value='';
  } else if(e.target.matches('.delete-post')){
    const id = e.target.dataset.id;
    if(!confirm('Delete post?')) return;
    await deleteDoc(doc(db,'posts',id));
  }
});
