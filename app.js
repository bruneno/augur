"use strict";

/* ---------- syntax highlighting ---------- */
const SETS = {
  divine: new Set(["divine"]),
  chaos: new Set(["chaos"]),
  certain: new Set(["certain"]),
  kw: new Set(["summon","ritual","divined","forget","give","when","otherwise",
    "while","repeat","for","in","break","attempt","rescue","believe","because","is","include"]),
  builtin: new Set(["gather","thrice","sort","filter","map","classify","pick","extract",
    "count","sum","reverse","unique","take","skip","by","with","into","from","upon","as",
    "proclaim","whisper","ask","read","write","commune","inscribe","recall","revise","banish","query","serve"]),
  config: new Set(["oracle","temperature","model","budget"]),
  lit: new Set(["yes","no","naught"]),
};
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function classForWord(w){
  if(SETS.divine.has(w))return "t-divine";
  if(SETS.chaos.has(w))return "t-chaos";
  if(SETS.certain.has(w))return "t-certain";
  if(SETS.kw.has(w))return "t-kw";
  if(SETS.builtin.has(w))return "t-builtin";
  if(SETS.config.has(w))return "t-config";
  if(SETS.lit.has(w))return "t-lit";
  return null;
}
function highlightAug(raw){
  const re=/(\/\/\/?[^\n]*)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;
  let out="",last=0,m;
  while((m=re.exec(raw))){
    out+=esc(raw.slice(last,m.index));
    if(m[1]) out+=`<span class="t-com">${esc(m[1])}</span>`;
    else if(m[2]) out+=`<span class="t-str">${esc(m[2])}</span>`;
    else if(m[3]) out+=`<span class="t-num">${esc(m[3])}</span>`;
    else {
      const w=m[4]; let cls=classForWord(w);
      if(!cls && /^\s*\(/.test(raw.slice(m.index+w.length))) cls="t-fn";
      out+= cls?`<span class="${cls}">${esc(w)}</span>`:esc(w);
    }
    last=re.lastIndex;
  }
  out+=esc(raw.slice(last));
  return out;
}
function highlightSh(raw){
  return raw.split("\n").map(line=>{
    let m=line.match(/(^|\s)#/);
    let code=line, comment="";
    if(m){const i=m.index+m[1].length;code=line.slice(0,i);comment=line.slice(i);}
    code=esc(code).replace(/(\s)(--?[a-z][\w-]*)/g,'$1<span class="t-config">$2</span>');
    return code + (comment?`<span class="t-com">${esc(comment)}</span>`:"");
  }).join("\n");
}
function paint(el){
  const sh=el.classList.contains("sh");
  const raw=el.dataset.raw ?? el.textContent;
  el.dataset.raw=raw;
  el.innerHTML=sh?highlightSh(raw):highlightAug(raw);
}

/* ---------- examples ---------- */
const EXAMPLES=[
  {id:"guess",name:"guess.aug",cap:`A number-guessing game. The secret is <em>divined</em>; the loop, the counter and the comparisons are native. <code>repeat forever</code> + <code>ask</code> + <code>when</code>/<code>otherwise</code>.`,
   code:`ritual main() {
    summon secret = divine "pick a random number from 1 to 100"
    summon attempts = 0
    repeat forever {
        summon guess = ask "Your guess: "
        attempts = attempts + 1
        when guess == secret -> {
            proclaim "You got it in " + attempts + " attempts!"
            break
        }
        when guess < secret -> proclaim "Higher!"
        otherwise -> proclaim "Lower!"
    }
}
main()`},
  {id:"etl",name:"semantic_etl.aug",cap:`The genuinely-useful 20%: semantic <code>map</code> / <code>extract</code> / <code>filter</code> / <code>sort</code>. The part you'd actually ship.`,
   code:`summon names = ["ana", "joão", "  MARIA ", "pedro"]
summon cleaned = map names with "trim and title-case"

summon emails = extract "only valid emails" from "contact: ana@x.com, junk, j@y.org"
summon urgent = filter ["pay now", "hi how are you", "URGENT: server down"] by "look urgent"

proclaim sort cleaned by "alphabetical order"`},
  {id:"db",name:"amnesiac_db.aug",cap:`The amnesiac database. <code>commune</code> opens a journal; reads are divined over it. Overflow the context budget and the <strong>oldest rows are forgotten</strong> — persistence is fiction.`,
   code:`commune with "vibes://localhost/store"
inscribe {name: "Ana", balance: 100} into clients
inscribe {name: "Beto", balance: 50} into clients

summon ana = recall "the client named Ana" from clients
revise ana with "double her balance"

proclaim query "who has the highest balance?"
banish "clients with a balance under 60" from clients
proclaim query "list all remaining clients"`},
  {id:"triage",name:"triage.aug",cap:`A support-desk triager. <code>gather</code> runs classify/filter as concurrent oracle calls; <code>thrice</code> takes a majority vote; typed extraction with <code>as</code>.`,
   code:`summon tickets = [
    "My card was charged twice for the same order!",
    "How do I change my email address?",
    "The app crashes every time I open the reports page.",
    "Thank you, your team is amazing!"
]

summon buckets = gather classify tickets into ["billing", "account", "bug", "praise"]
summon urgent = gather filter tickets by "an angry or urgent customer"

summon report = divine "extract the issue" upon tickets[0] as {topic: text, severity: number}
summon mood = divine "overall sentiment in one word" upon tickets[3] thrice

for ticket in tickets {
    proclaim divine "a one-sentence empathetic first reply" upon ticket
}`},
  {id:"api",name:"serve.aug",cap:`A REST API. The <code>certain</code> + SQLite routes are real and persistent; the <code>/fortune</code> route is hallucinated on every request. <code>serve</code> wires it to a port.`,
   code:`ritual handle(req) {
    certain {
        commune with "sqlite://./notes.db"
        when req["method"] == "POST" and req["path"] == "/notes" -> {
            inscribe req["json"] into notes
            give {status: 201, body: {created: req["json"]}}
        }
        when req["method"] == "GET" and req["path"] == "/notes" ->
            give {status: 200, body: recall "all" from notes}
    }
    when req["path"] == "/fortune" -> give {status: 200, body: divine "a techie fortune cookie"}
    give {status: 404, body: {error: "not found"}}
}
serve 8787 with handle`},
  {id:"auth",name:"auth.aug",cap:`User/password auth where the SHA-256 hash <em>and</em> the credential check are divined. <strong>The hash is hallucinated; the auth is prompt-injectable. Do not deploy.</strong> <a href="https://github.com/bruneno/augur-auth-demo" target="_blank" rel="noopener">Full demo →</a>`,
   code:`/// You are a strict authentication service. Judge credentials literally.

ritual valid(username, password) {
    summon hashed = divine "the SHA-256 hex digest of this exact string" upon password as text
    give divine "is there exactly one stored user whose username equals the given username AND whose stored hash equals the given hash?" upon {users: store(), username: username, hash: hashed} as bool
}`},
];

const TOUR=`oracle "anthropic"          // config header: also model, temperature, budget
temperature 0.4

summon x = 10               // declare; x = 20 reassigns; forget x removes
ritual add(a, b) { give a + b }
ritual guess(n) divined     // no body — the whole impl is divined

when x > 5 -> proclaim "big"
otherwise  -> proclaim "small"

while x > 0 { x = x - 1 }
repeat 3 { proclaim "again" }
for item in [1, 2, 3] { proclaim item }

believe x > 0 because "x must stay positive"
attempt { believe no } rescue as e { proclaim e }

summon mood = divine "the sentiment" upon review thrice
summon user = divine "the user" as {name: text, age: number}

certain { proclaim 2 + 2 }   // always 4, never touches the AI
chaos 0.9 { proclaim 2 + 2 } // who knows`;

/* ---------- wiring ---------- */
document.addEventListener("DOMContentLoaded",()=>{
  // static code blocks
  document.querySelectorAll("pre code.aug, pre code.sh").forEach(el=>{
    if(el.id==="ex-code") return;
    paint(el);
  });

  // tour
  const tour=document.getElementById("tour-code");
  if(tour){tour.dataset.raw=TOUR;paint(tour);}

  // example tabs
  const tabsWrap=document.querySelector(".tabs");
  const exCode=document.getElementById("ex-code");
  const exName=document.getElementById("ex-name");
  const exCap=document.getElementById("ex-cap");
  const exCopy=document.getElementById("ex-copy");
  const exPanel=document.getElementById("ex-panel");
  function showExample(ex,btn){
    exCode.dataset.raw=ex.code;paint(exCode);
    exName.textContent=ex.name;
    exCap.innerHTML=ex.cap;
    tabsWrap.querySelectorAll(".tab").forEach(b=>{
      const on=b===btn;
      b.classList.toggle("active",on);
      b.setAttribute("aria-selected",on?"true":"false");
      b.tabIndex=on?0:-1;
    });
    if(exPanel&&btn.id) exPanel.setAttribute("aria-labelledby",btn.id);
  }
  EXAMPLES.forEach((ex,i)=>{
    const b=document.createElement("button");
    b.className="tab";b.type="button";b.textContent=ex.name.replace(".aug","");
    b.id="tab-"+ex.id;
    b.setAttribute("role","tab");
    b.setAttribute("aria-controls","ex-panel");
    b.setAttribute("aria-selected","false");
    b.tabIndex=-1;
    b.addEventListener("click",()=>showExample(ex,b));
    tabsWrap.appendChild(b);
    if(i===0) showExample(ex,b);
  });
  tabsWrap.addEventListener("keydown",(e)=>{
    const tabs=[...tabsWrap.querySelectorAll(".tab")];
    const cur=tabs.indexOf(document.activeElement);
    if(cur<0) return;
    let next=-1;
    if(e.key==="ArrowRight") next=(cur+1)%tabs.length;
    else if(e.key==="ArrowLeft") next=(cur-1+tabs.length)%tabs.length;
    else if(e.key==="Home") next=0;
    else if(e.key==="End") next=tabs.length-1;
    if(next>=0){e.preventDefault();tabs[next].focus();tabs[next].click();}
  });
  exCopy?.addEventListener("click",()=>copy(exCode.dataset.raw,exCopy));

  // copy buttons (static targets)
  document.querySelectorAll(".copy[data-copy]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const t=document.getElementById(btn.dataset.copy);
      copy(t.dataset.raw ?? t.textContent,btn);
    });
  });

  // oracle gag
  const VERDICTS=["4","4","4","4","5","17","42",'"fish"',"yes","probably","🐟","a vibe","4.0001","∞","seven"];
  const consult=document.getElementById("consult");
  const verdict=document.getElementById("verdict");
  let last="4";
  consult?.addEventListener("click",()=>{
    let v;do{v=VERDICTS[Math.floor(Math.random()*VERDICTS.length)];}while(v===last);last=v;
    const cls=/^[-\d.∞]+$/.test(v)?"t-num":"t-str";
    verdict.style.opacity="0";
    setTimeout(()=>{verdict.innerHTML=`→ <span class="${cls}">${esc(v)}</span>`;verdict.style.opacity="1";},120);
  });

  // reveal on scroll
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");obs.unobserve(e.target);}});
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
});

function copy(text,btn){
  const p=navigator.clipboard?.writeText(text);
  if(!p) return;
  p.then(()=>{
    const old=btn.textContent;btn.textContent="Copied ✓";btn.classList.add("done");
    setTimeout(()=>{btn.textContent=old;btn.classList.remove("done");},1400);
  }).catch(()=>{});
}
