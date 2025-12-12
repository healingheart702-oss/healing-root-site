// js/chat.js
import { auth, db } from './firebase.js';
import { CLOUDINARY } from './cloudinary.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, collection, addDoc, onSnapshot, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const friendsContainer = document.getElementById('friends-for-chat');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const chatImage = document.getElementById('chat-image');
const sendChat = document.getElementById('send-chat');
let currentFriend = null;
let currentUid = null;

onAuthStateChanged(auth, async user=>{
  if(!user) return location.href='index.html';
  currentUid = user.uid;
  // list friends
  onSnapshot(collection(db,'users',user.uid,'friends'), snap=>{
    friendsContainer.innerHTML='';
    snap.forEach(docSnap=>{
      const li = document.createElement('div');
      li.innerHTML = `${docSnap.data().id} <button class="start-chat" data-id="${docSnap.data().id}">Chat</button>`;
      friendsContainer.appendChild(li);
    });
  });
});

document.addEventListener('click', (e)=>{
  if(e.target.matches('.start-chat')){
    currentFriend = e.target.dataset.id;
    loadMessages();
  }
});

function chatId(a,b){ return [a,b].sort().join('_'); }

async function loadMessages(){
  messagesDiv.innerHTML='';
  if(!currentFriend || !currentUid) return;
  const cid = chatId(currentUid, currentFriend);
  const q = query(collection(db,'chats',cid,'messages'), orderBy('timestamp'));
  onSnapshot(q, snap=>{
    messagesDiv.innerHTML='';
    snap.forEach(docSnap=>{
      const m = docSnap.data();
      const d = document.createElement('div');
      d.textContent = `${m.senderName}: ${m.text}`;
      messagesDiv.appendChild(d);
    });
  });
}

async function uploadToCloudinary(file){
  const url = CLOUDINARY.uploadUrl(CLOUDINARY.cloudName);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.unsignedPreset);
  fd.append('folder', 'healingroot/chat');
  const res = await fetch(url,{method:'POST',body:fd});
  const json = await res.json();
  return json.secure_url;
}

sendChat?.addEventListener('click', async ()=>{
  if(!currentFriend) return alert('Choose friend to chat');
  const text = chatInput.value.trim();
  let imageUrl = '';
  if(chatImage.files && chatImage.files[0]) imageUrl = await uploadToCloudinary(chatImage.files[0], 'healingroot/chat');
  const cid = chatId(currentUid, currentFriend);
  const user = auth.currentUser;
  await addDoc(collection(db,'chats',cid,'messages'), {
    senderUid: user.uid,
    senderName: user.displayName || user.email.split('@')[0],
    text: text || (imageUrl ? '[image]' : ''),
    imageUrl: imageUrl || '',
    timestamp: new Date()
  });
  chatInput.value=''; chatImage.value='';
});
