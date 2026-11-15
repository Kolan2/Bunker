const $ = (s)=>document.querySelector(s);
const categories=window.BUNKER_CARDS.modern.map(g=>g.category);
let setting="modern", playerCount=5, players=[], hands={}, revealed={}, scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]}, activeCategory="Все карты", activeView="home";
const deck=()=>window.BUNKER_CARDS[setting].flatMap(g=>g.items.flatMap(card=>Array.from({length:card.copies},(_,i)=>({...card,category:g.category,copyIndex:i+1}))));
const shuffle=(a)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
function showView(view){activeView=view;$("#home-view").classList.toggle("hidden",view!=="home");$("#catalog-view").classList.toggle("hidden",view!=="catalog");document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="catalog")renderCatalog()}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#show-catalog").addEventListener("click",()=>showView("catalog"));
document.querySelectorAll(".setting-option").forEach(b=>b.addEventListener("click",()=>{setting=b.dataset.setting;document.querySelectorAll(".setting-option").forEach(x=>x.classList.toggle("selected",x===b));}));
$("#players-minus").addEventListener("click",()=>{playerCount=Math.max(3,playerCount-1);$("#player-count").textContent=playerCount});
$("#players-plus").addEventListener("click",()=>{playerCount=Math.min(5,playerCount+1);$("#player-count").textContent=playerCount});
$("#create-room").addEventListener("click",()=>$("#setup-panel").scrollIntoView({behavior:"smooth",block:"center"}));
$("#start-game").addEventListener("click",()=>{const host=$("#host-name").value.trim()||"Ведущий";players=Array.from({length:playerCount},(_,i)=>i===0?host:"Игрок "+(i+1));$("#room-code").textContent=Math.random().toString(36).slice(2,7).toUpperCase();$("#players-list").innerHTML=players.map((p,i)=>'<div class="player-chip"><span>УЧАСТНИК '+String(i+1).padStart(2,"0")+'</span><b>'+escapeHTML(p)+'</b></div>').join("");$("#setup-panel").classList.add("hidden");$("#room-panel").classList.remove("hidden");$("#room-panel").scrollIntoView({behavior:"smooth",block:"start"})});
$("#reset-room").addEventListener("click",()=>{$("#room-panel").classList.add("hidden");$("#setup-panel").classList.remove("hidden")});
$("#deal-cards").addEventListener("click",()=>{const pool=shuffle(deck());const needs=["Пол и возраст","Здоровье","Профессия","Хобби","Факт","Факт","Особое условие","Лёгкий багаж","Тяжёлый багаж"];hands={};revealed={};scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]};for(const p of players){hands[p]=needs.map(cat=>{const idx=pool.findIndex(c=>c.category===cat);if(idx<0)throw new Error("Недостаточно карт в категории: "+cat);return pool.splice(idx,1)[0]});revealed[p]=new Set()}$("#current-player").innerHTML=players.map(p=>'<option value="'+escapeHTML(p)+'">'+escapeHTML(p)+'</option>').join("");$("#room-panel").classList.add("hidden");$("#game-panel").classList.remove("hidden");renderHand();$("#game-panel").scrollIntoView({behavior:"smooth",block:"start"})});
$("#current-player").addEventListener("change",renderHand);
function renderHand(){const p=$("#current-player").value;$("#game-title").textContent=p+" — ваши карты";const open=revealed[p]||new Set();$("#hand").innerHTML=hands[p].map((c,i)=>{const shown=open.has(i);return '<button class="hand-card '+(shown?"revealed":"")+'" data-index="'+i+'"><span class="card-category">'+(shown?escapeHTML(c.category.toUpperCase()):"СЕКРЕТНАЯ КАРТА")+'</span>'+(shown?'<h3>'+escapeHTML(c.title)+'</h3><p>'+escapeHTML(c.description)+'</p>':'<div class="card-hidden">НАЖМИТЕ, ЧТОБЫ ОТКРЫТЬ</div>')+'</button>'}).join("");$("#hand").querySelectorAll(".hand-card").forEach(b=>b.addEventListener("click",()=>{const i=Number(b.dataset.index);if(open.has(i))open.delete(i);else open.add(i);renderHand()}));$("#hand-progress").textContent="9 КАРТ · "+open.size+" ОТКРЫТО"}
$("#reveal-all").addEventListener("click",()=>{const p=$("#current-player").value;revealed[p]=new Set(hands[p].map((_,i)=>i));renderHand()});
document.querySelectorAll(".scenario-draw").forEach(b=>b.addEventListener("click",()=>drawScenario(b.dataset.scenario)));
function drawScenario(category){
 const limits={"Катастрофа":1,"Угроза":2,"Преимущества бункера":3};
 const drawn=scenarioDrawn[category];
 if(drawn.length>=limits[category])return;
 const group=window.BUNKER_CARDS[setting].find(g=>g.category===category);
 if(!group)return;
 const remaining=group.items.filter(card=>!drawn.some(x=>x.id===card.id));
 if(!remaining.length)return;
 const card=shuffle(remaining)[0];
 drawn.push(card);
 renderScenario();
}
function renderScenario(){
 const order=["Катастрофа","Угроза","Преимущества бункера"];
 $("#scenario-revealed").innerHTML=order.map(category=>{
  const list=scenarioDrawn[category];
  if(!list.length)return "";
  return '<div class="scenario-result-group"><p class="eyebrow">'+escapeHTML(category.toUpperCase())+'</p><div class="scenario-result-grid">'+list.map(card=>'<article class="scenario-result-card"><span>'+escapeHTML(category.toUpperCase())+'</span><h3>'+escapeHTML(card.title)+'</h3><p>'+escapeHTML(card.description)+'</p></article>').join("")+'</div></div>';
 }).join("")||'<p class="scenario-empty">Пока ничего не раскрыто. Ведущий может открыть карты выше.</p>';
 document.querySelectorAll(".scenario-draw").forEach(b=>{
  const category=b.dataset.scenario,limit={"Катастрофа":1,"Угроза":2,"Преимущества бункера":3}[category],count=scenarioDrawn[category].length;
  b.disabled=count>=limit;
  b.textContent=count>=limit?"Колода раскрыта":("Открыть "+(category==="Катастрофа"?"событие":category==="Угроза"?"угрозу":"преимущество")+" · "+count+"/"+limit);
 });
}

function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderCatalog(){const groups=window.BUNKER_CARDS[$("#catalog-setting").value];const all=groups.flatMap(g=>g.items.map(c=>({...c,category:g.category})));$("#catalog-count").textContent=all.length;const tabs=["Все карты",...categories];$("#category-tabs").innerHTML=tabs.map(t=>'<button class="category-tab '+(activeCategory===t?"active":"")+'" data-cat="'+t+'">'+t+'</button>').join("");$("#category-tabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.cat;renderCatalog()}));const q=$("#card-search").value.toLowerCase().trim();const shown=all.filter(c=>(activeCategory==="Все карты"||c.category===activeCategory)&&(!q||(c.title+" "+c.description+" "+c.category).toLowerCase().includes(q)));$("#catalog-grid").innerHTML=shown.map(c=>'<article class="catalog-card"><div class="catalog-card-top"><span class="tag">'+escapeHTML(c.category.toUpperCase())+'</span><span class="copies">КОПИЙ: '+c.copies+'</span></div><h3>'+escapeHTML(c.title)+'</h3><p>'+escapeHTML(c.description)+'</p></article>').join("")||'<p class="catalog-footnote">По вашему запросу ничего не найдено.</p>'}
$("#catalog-setting").addEventListener("change",()=>{activeCategory="Все карты";renderCatalog()});$("#card-search").addEventListener("input",renderCatalog);
renderCatalog();