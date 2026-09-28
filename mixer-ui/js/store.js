// Mock data + a tiny localStorage-backed store shared by index.html (home) and create.html (builder).
// Every function here is a stand-in for a backend call; see docs/POC_PLAN.md for the real APIs.
(function(){
const KEY='mixr.poc.v1';
// Demo "today". Fixed so the sample data always reads as upcoming.
const TODAY=new Date(2026,8,26);

const ME={kwest:'KWEST Patagonia',ini:'KP',chair:'You',members:40,budgetPP:30};

const SEED={
 events:[
  {id:'e1',title:'Rooftop Sunset Social',date:'2026-10-03',time:'6–9pm',venue:'The Lantern Room',hood:'Evanston',img:'img/lantern-room.jpg',
   host:'KWEST Patagonia',with:'Wine & Cheese Club',role:'hosting',status:'booked',head:62,budgetPP:22,dep:500,color:'pink'},
  {id:'e2',title:'Glow Bowling Night',date:'2026-10-13',time:'9pm–late',venue:'Starlight Lanes',hood:'Evanston',img:'img/starlight.jpg',
   host:'KWEST Patagonia',with:'KWEST Japan Squad',role:'hosting',status:'planning',head:75,budgetPP:25,dep:320,color:'cob'},
  {id:'e3',title:'Samba Social',date:'2026-10-23',time:'8pm–12am',venue:'Juniper & Jive',hood:'Wicker Park',img:'img/juniper-jive.jpg',
   host:'KWEST Brazil',with:'KWEST Patagonia',role:'going',status:'booked',head:90,budgetPP:20,dep:450,color:'yel'},
  {id:'e0',title:'Welcome Back BBQ',date:'2026-09-12',time:'4–8pm',venue:'Birch & Barrel',hood:'Evanston',img:'img/birch-barrel.jpg',
   host:'KWEST Patagonia',with:null,role:'hosting',status:'done',head:38,budgetPP:18,dep:350,color:'yel'}
 ],
 blackouts:[
  {id:'b1',start:'2026-10-09',end:'2026-10-10',label:'Recruiting week'},
  {id:'b2',start:'2026-10-16',end:'2026-10-17',label:'Midterms'},
  {id:'b3',start:'2026-11-25',end:'2026-11-27',label:'Thanksgiving break'}
 ],
 invites:[
  {id:'i1',from:'KWEST Japan Squad',ini:'JS',chair:'Kenji',gc:'#2B4BFF',gt:'#fff',title:'Karaoke Rumble',date:'2026-10-22',time:'9pm–1am',
   venue:'Neon Taco Social',hood:'River North',img:'img/neon-taco.jpg',head:35,budgetPP:15,match:88,sent:'2h ago',
   note:'Twelve karaoke songs, zero mercy. We have the back room held till Friday.'},
  {id:'i2',from:'Wine & Cheese Club',ini:'WC',chair:'Dana',gc:'#FFD23F',gt:'#141414',title:'Harvest Wine Walk',date:'2026-10-17',time:'4–8pm',
   venue:'Birch & Barrel',hood:'Evanston',img:'img/birch-barrel.jpg',head:22,budgetPP:30,match:84,sent:'Yesterday',
   note:'Low-key tasting on the fire-pit patio. Would love an outdoorsy crowd.'},
  {id:'i3',from:'KWEST Iceland',ini:'KI',chair:'Maya',gc:'#FF3D8B',gt:'#141414',title:'Northern Lights Formal',date:'2026-11-13',time:'8–11pm',
   venue:'The Lantern Room',hood:'Evanston',img:'img/lantern-room.jpg',head:50,budgetPP:45,match:79,sent:'3d ago',
   note:'Semi-formal, open bar for the first hour. Looking for one more KWEST to co-host.'}
 ]
};

function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.events)return s}catch(e){}return JSON.parse(JSON.stringify(SEED))}
let state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}

const pd=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

function blackoutOn(dateStr){const t=pd(dateStr);return state.blackouts.find(b=>t>=pd(b.start)&&t<=pd(b.end))||null}

window.Mixr={
 TODAY,ME,pd,iso,
 events:()=>state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)),
 blackouts:()=>state.blackouts.slice(),
 invites:()=>state.invites.slice(),
 blackoutOn,
 addEvent(ev){state.events=state.events.filter(e=>e.id!==ev.id);state.events.push(ev);save()},
 toggleBlackout(dateStr,label){
  const b=blackoutOn(dateStr);
  if(b){ // remove just this day from the range
   const t=pd(dateStr),s=pd(b.start),e=pd(b.end);state.blackouts=state.blackouts.filter(x=>x!==b);
   const dayMs=864e5;
   if(t>s)state.blackouts.push({id:b.id+'a',start:b.start,end:iso(new Date(t-dayMs)),label:b.label});
   if(t<e)state.blackouts.push({id:b.id+'b',start:iso(new Date(+t+dayMs)),end:b.end,label:b.label});
  }else state.blackouts.push({id:'b'+Date.now(),start:dateStr,end:dateStr,label:label||'Blackout'});
  save()},
 respondInvite(id,accept){
  const inv=state.invites.find(i=>i.id===id);if(!inv)return;
  state.invites=state.invites.filter(i=>i.id!==id);
  if(accept)state.events.push({id:'e-'+id,title:inv.title,date:inv.date,time:inv.time,venue:inv.venue,hood:inv.hood,img:inv.img,
   host:inv.from,with:ME.kwest,role:'going',status:'booked',head:inv.head+ME.members,budgetPP:inv.budgetPP,color:'yel'});
  save()},
 reset(){state=JSON.parse(JSON.stringify(SEED));save()},
 clearInvites(){state.invites=[];save()}
};
})();
