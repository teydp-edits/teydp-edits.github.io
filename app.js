{
const V=[
 ["bts-playground","BTS vs. the Result","Cinematography for Actors","0:22"],
 ["coverage","Coverage and Angles","Cinematography for Actors","1:19"],
 ["cammove","Camera Movement","Cinematography for Actors","1:19"],
 ["roundtable","Director’s Roundtable","Cinematography for Actors","0:49"],
 ["moves","6 Camera Movements","Cinematography for Actors","0:32"],
 ["workshop","Inside a CFA Workshop","Cinematography for Actors","0:40"],
 ["compilation","CFA Compilation","Cinematography for Actors","1:25"]];
const H=[["workshops","CFA Workshops Compilation","Highlight reel","0:38"],["anxiety","How Filmmakers Show Anxiety","Technique short","0:29"],["composition","Composition Techniques","Technique short","0:34"],["eight","Eight Shots in One Room","Technique short","0:24"]];
const F=[
 {img:"sinoka.jpg",kind:"Short film",t:"Sino Ka?",m:[["Role","Story, director and editor"],["Screenplay","Christine Kellie Tolentino"],["For","Faith Lens 2026"],["Length","5:00"],["Language","Tagalog, English subtitles"]],d:"On a stormy night, a teen must comfort the grandfather who no longer remembers him."},
 {img:"icp.jpg",kind:"Documentary",t:"ICP History",m:[["Role","Editor"],["For","ICP Tayuman"],["Length","5:04"],["Language","Tagalog, with subtitles"]],d:"The history of a Manila parish, written and paced as a short documentary."},
 {img:"socom.jpg",kind:"Recruitment",t:"Serve with your talent",m:[["Role","Editor"],["For","ICP Tayuman Social Communications"],["Length","2:00"],["Language","Tagalog, with subtitles"]],d:"A two-minute call for volunteers, told by the members who already serve."},
 {img:"trailer.jpg",kind:"Trailer",t:"Quarterly Film Challenge",m:[["Role","Editor"],["For","Cinematography for Actors"],["Length","1:01"]],d:"A trailer cut from the films made in CFA’s quarterly challenge."}];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tile=(r,ar)=>`<button class="tile" data-open="${r[0]}" data-t="${esc(r[1])}"><div class="im"><img src="img/${r[0]}.jpg" alt="${esc(r[1])}" loading="lazy" style="aspect-ratio:${ar}"><span class="dur num">${r[3]}</span></div><h3>${esc(r[1])}</h3><p>${esc(r[2])}</p></button>`;
document.getElementById('vert').innerHTML=V.map(r=>tile(r,'9/16')).join('');
const VIA=[["via-location","Location Drops: Strand Bookstore","via app","0:23"],["via-dinner","Come Along: Demo Dinner","via app","1:10"],["via-problem","Why via: The Problem","via app","0:50"],["via-singles","Singles Sunday: Kirk","via app","1:05"]];
document.getElementById('via').innerHTML=VIA.map(r=>tile(r,'9/16')).join('');
document.getElementById('horiz').innerHTML=H.map(r=>tile(r,'16/9')).join('');
document.getElementById('rows').innerHTML=F.map(f=>`<article class="row"><button class="tile" data-open="${f.img.replace('.jpg','')}" data-t="${esc(f.t)}"><div class="im reveal"><img src="img/${f.img}" alt="Still from ${esc(f.t)}" loading="lazy"></div></button><div class="txt"><div class="kind">${esc(f.kind)}</div><h3 class="h">${esc(f.t)}</h3><dl class="meta">${f.m.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl><p class="mute" style="margin:0">${esc(f.d)}</p></div></article>`).join('');

/* light and dark */
const root=document.documentElement,mb=document.getElementById('mode');
function setMode(m){root.dataset.mode=m;mb.setAttribute('aria-label','Switch to '+(m==='light'?'dark':'light')+' mode');try{localStorage.setItem('tf-mode',m)}catch(e){}}
let saved='dark';try{saved=localStorage.getItem('tf-mode')||'dark'}catch(e){}
setMode(saved);
mb.addEventListener('click',()=>{const next=root.dataset.mode==='light'?'dark':'light';if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches){setMode(next);return}const r=mb.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,end=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));const t=document.startViewTransition(()=>setMode(next));t.ready.then(()=>root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${end}px at ${x}px ${y}px)`]},{duration:600,easing:'cubic-bezier(.77,0,.175,1)',pseudoElement:'::view-transition-new(root)'})).catch(()=>{})});

/* player: Vimeo, loaded only when a video is opened */
const VIM={"via-location":["1250388823","7a0ad9b4b2",1],"via-dinner":["1250388820","0fed571b28",1],"via-problem":["1250388824","9a53db2835",1],"via-singles":["1250388822","09c5330f03",1],coverage:["1250313261",0,1],cammove:["1250313257",0,1],roundtable:["1250313259",0,1],moves:["1250313260",0,1],workshop:["1250313294",0,1],compilation:["1250313296",0,1],anxiety:["1250313297"],composition:["1250313298"],eight:["1250313329"],trailer:["1250401879","a75b4f1d4f"],"bts-playground":["1250401878","fabbfa0be5",1],workshops:["1250401880","e908a82404"],socom:["1250313334"],sinoka:["1250315787","61d60c6697"],icp:["1250318793","20471b4029"]};
const lb=document.getElementById('lb'),pl=document.getElementById('player'),lt=document.getElementById('lbt'),fr=pl.parentElement;
let last=null;
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;const v=VIM[b.dataset.open];if(!v)return;last=b;
  const q=new URLSearchParams({autoplay:'1',title:'0',byline:'0',portrait:'0',dnt:'1'});if(v[1])q.set('h',v[1]);
  pl.src='https://player.vimeo.com/video/'+encodeURIComponent(v[0])+'?'+q.toString();fr.classList.toggle('v',!!v[2]);lt.textContent=b.dataset.t;lb.classList.add('on');document.getElementById('lbx').focus()});
/* captions start off; viewers can turn them on in the player */
pl.addEventListener('load',()=>{if(!pl.src.includes('player.vimeo.com'))return;const off=()=>{try{pl.contentWindow.postMessage(JSON.stringify({method:'disableTextTrack'}),'https://player.vimeo.com')}catch(e){}};off();setTimeout(off,800);setTimeout(off,2000)});
const close=()=>{lb.classList.remove('on');pl.src='about:blank';last&&last.focus()};
document.getElementById('lbx').addEventListener('click',close);
lb.addEventListener('click',e=>{if(e.target===lb)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('on'))close()});

/* contact form: Formspree, with a honeypot and a mail fallback */
const f=document.getElementById('f'),ok=document.getElementById('ok');let sending=false;
f.addEventListener('submit',async e=>{e.preventDefault();ok.style.display='block';
  if(!f.checkValidity()){ok.textContent='Please fill in your name, a valid email and a message.';return}
  if(f._gotcha.value){ok.textContent='Thanks!';return}
  const mail='mailto:teydelapena.edits@gmail.com?subject='+encodeURIComponent('Project from '+f.name.value.slice(0,80))+'&body='+encodeURIComponent(f.message.value.slice(0,1800));
  if(f.action.includes('FORM_ID')){location.href=mail;ok.textContent='Your email app should open. If it doesn’t, write to teydelapena.edits@gmail.com.';return}
  if(sending)return;sending=true;ok.textContent='Sending…';
  try{const r=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});
    if(r.ok){f.reset();ok.textContent='Thanks. Your message is in Tey’s inbox.'}else{ok.textContent='That didn’t send. Please email teydelapena.edits@gmail.com.'}}
  catch(err){ok.textContent='That didn’t send. Please email teydelapena.edits@gmail.com.'}
  sending=false});

/* timecode */
const tc=document.getElementById('tcode'),vid=document.querySelector('.vf video');
const pad=n=>String(n).padStart(2,'0');
const pz=document.getElementById('pause');pz.addEventListener('click',()=>{if(vid.paused){vid.play();pz.textContent='Pause';pz.setAttribute('aria-label','Pause the loop')}else{vid.pause();pz.textContent='Play';pz.setAttribute('aria-label','Play the loop')}});if(matchMedia('(prefers-reduced-motion: reduce)').matches){vid.removeAttribute('autoplay');vid.pause();pz.textContent='Play'}
setInterval(()=>{const t=vid.currentTime||0;tc.textContent=`00:00:${pad(Math.floor(t))}:${pad(Math.floor((t%1)*24))}`},100);

}