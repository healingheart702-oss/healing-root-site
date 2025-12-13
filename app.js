import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const products = [
  {
    name:"Cassava Stems (TME419)",
    image:"images/cassava.JPG",
    price:1000,
    description:"LONG 3000+ CHARACTER DESCRIPTION HERE..."
  },
  {
    name:"Hybrid Plantain Suckers",
    image:"images/plantain.JPG",
    price:500,
    description:"LONG 3000+ CHARACTER DESCRIPTION HERE..."
  }
];

function $(id){return document.querySelector(id);}
function showView(id){document.querySelectorAll('.view').forEach(v=>v.style.display='none');$('#'+id+'-view').style.display='block';}

// AUTH
$('#signup-form').addEventListener('submit', async e=>{
  e.preventDefault();
  try{
    await createUserWithEmailAndPassword(auth,$('#signup-email').value,$('#signup-password').value);
  }catch(err){alert(err.message);}
});
$('#login-form').addEventListener('submit', async e=>{
  e.preventDefault();
  try{await signInWithEmailAndPassword(auth,$('#login-email').value,$('#login-password').value);}
  catch(err){alert(err.message);}
});
$('#logout-btn').addEventListener('click', ()=>signOut(auth));

onAuthStateChanged(auth,user=>{
  if(user){$('#auth-modal').style.display='none';$('#logout-btn').style.display='inline-block';showView('feed'); renderProducts();}
  else{$('#auth-modal').style.display='flex';$('#logout-btn').style.display='none';}
});

// PRODUCTS
function renderProducts(){
  const container = $('#product-list');
  container.innerHTML='';
  products.forEach(p=>{
    const card = document.createElement('div');card.className='card';
    card.innerHTML=`<h3>${p.name}</h3><p>₦${p.price}</p><p>${p.description.slice(0,300)}... <a href="#" class="read-more">Read more</a></p>
    <button class="order">Order via WhatsApp</button>`;
    container.appendChild(card);
    card.querySelector('.order').addEventListener('click',()=>{
      window.open(`https://wa.me/2349138938301?text=${encodeURIComponent(`Hello, I want to order ${p.name} priced at ₦${p.price}`)}`,'_blank');
    });
    card.querySelector('.read-more').addEventListener('click',e=>{
      e.preventDefault();
      alert(p.name+'\n\n'+p.description);
    });
  });
}
