const body=document.body;
const themeToggle=document.getElementById('themeToggle');
const savedTheme=localStorage.getItem('vikram-theme');
if(savedTheme==='dark') body.classList.add('dark');
themeToggle.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('vikram-theme',body.classList.contains('dark')?'dark':'light');});

const searchInput=document.getElementById('projectSearch');
const filterButtons=[...document.querySelectorAll('.filter')];
const projectCards=[...document.querySelectorAll('.project-card')];
const noResults=document.getElementById('noResults');
let activeFilter='All';
function filterProjects(){
  const q=searchInput.value.trim().toLowerCase(); let shown=0;
  projectCards.forEach(card=>{
    const category=card.dataset.category;
    const haystack=(card.dataset.search+' '+card.innerText).toLowerCase();
    const matches=(activeFilter==='All'||category===activeFilter)&&(!q||haystack.includes(q));
    card.hidden=!matches;if(matches)shown++;
  });
  noResults.hidden=shown!==0;
}
searchInput.addEventListener('input',filterProjects);
filterButtons.forEach(btn=>btn.addEventListener('click',()=>{activeFilter=btn.dataset.filter;filterButtons.forEach(b=>b.classList.toggle('active',b===btn));filterProjects();}));

const launcher=document.getElementById('chatLauncher'), panel=document.getElementById('chatPanel');
const closeChat=document.getElementById('chatClose'), form=document.getElementById('chatForm');
const chatInput=document.getElementById('chatInput'), messages=document.getElementById('chatMessages');
launcher.addEventListener('click',()=>{panel.hidden=!panel.hidden;if(!panel.hidden)chatInput.focus();});
closeChat.addEventListener('click',()=>panel.hidden=true);
document.querySelectorAll('.suggestions button').forEach(b=>b.addEventListener('click',()=>{chatInput.value=b.textContent;form.requestSubmit();}));
function addMessage(text,role){const el=document.createElement('div');el.className='chat-bubble '+role;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el;}
const portfolioContext=`Name: Vikram Vadhera. First-year B.Tech Computer Science student specializing in AI & Machine Learning at JECRC University, Jaipur, India. Learning Python, C, C++, HTML, CSS, JavaScript, Git, GitHub, Cursor AI, AI/ML fundamentals and debugging. Projects from coursework: (1) Python Programs Collection: factorial, Fibonacci, and structure-to-dictionary conversion; (2) Messy Python Code Improvement using AI assistance; (3) Bug Fixing Using Cursor AI; (4) Interactive Quiz Application; (5) Book Reading List Application. Project repository URLs and personal email should be verified by Vikram before sharing.`;
form.addEventListener('submit',async e=>{
  e.preventDefault();const question=chatInput.value.trim();if(!question)return;
  addMessage(question,'user');chatInput.value='';const pending=addMessage('Thinking…','bot');
  try{
    const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,context:portfolioContext})});
    const data=await response.json();pending.textContent=data.reply||data.error||'I could not generate a reply just now.';
  }catch(err){pending.textContent='The assistant is not connected yet. Add your API settings in Vercel and try again.';}
  messages.scrollTop=messages.scrollHeight;
});