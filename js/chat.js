// js/chat.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const friendsContainer = document.getElementById('friends-for-chat');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const chatImage = document.getElementById('chat-image');
const sendChat = document.getElementById('send-chat');
const chatWithTitle = document.getElementById('chat-with');

let currentUser = null;
let currentFriend = localStorage.getItem('chatWith') || null;

async function uploadToCloudinary(file, folder='healingroot/chat'){
  const url = CLOUDINARY.uploadUrl(CLOUDINARY.cloudName);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.unsignedPreset);
  fd.append('folder', folder);
  const res = await fetch(url, { method:'POST', body: fd });
  const json = await res.json();
  return json.secure_url;
}

onAuthStateChanged(auth, async user=>{
  if(!user) return location.href='index.html';
  currentUser = user;
  // list friends
  onSnapshot(collection(db,'users',user.uid,'friends'), snap=>{
    friendsContainer.innerHTML = '';
    snap.forEach(s=>{
      const id = s.id;
      const div = document.createElement('div');
      div.className='row';
      div.innerHTML = `${s.data().name || id} <button class="start-chat" data-id="${id}">Chat</button>`;
      friendsContainer.appendChild(div);
    });
  });

  if(currentFriend){
    startChatWith(currentFriend);
  }
});

document.addEventListener('click', (e)=>{
  if(e.target.matches('.start-chat')){
    const fid = e.target.dataset.id; startChatWith(fid);
  }
});

function chatId(a,b){ return [a,b].sort().join('_'); }

function startChatWith(friendId){
  currentFriend = friendId;
  chatWithTitle.textContent = 'Chat with ' + friendId;
  localStorage.setItem('chatWith', friendId);
  messagesDiv.innerHTML = '';
  const cid = chatId(currentUser.uid, friendId);
  const q = query(collection(db,'chats',cid,'messages'), orderBy('createdAt'));
  onSnapshot(q, snap=>{
    messagesDiv.innerHTML = '';
    snap.forEach(m=>{
      const mm = m.data();
      const div = document.createElement('div');
      div.textContent = `${mm.senderName}: ${mm.text || ''}`;
      if(mm.imageUrl){
        const img = document.createElement('img'); img.src = mm.imageUrl; img.style.maxWidth='200px'; div.appendChild(img);
      }
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  });
}

sendChat?.addEventListener('click', async ()=>{
  if(!currentFriend) return alert('Select friend');
  const text = chatInput.value.trim();
  let imageUrl = '';
  if(chatImage.files && chatImage.files[0]) imageUrl = await uploadToCloudinary(chatImage.files[0],'healingroot/chat');
  const cid = chatId(currentUser.uid, currentFriend);
  await addDoc(collection(db,'chats',cid,'messages'), { senderUid: currentUser.uid, senderName: currentUser.displayName || currentUser.email.split('@')[0], text: text || (imageUrl? '[image]':''), imageUrl, createdAt: new Date() });
  chatInput.value = ''; chatImage.value = '';
});
