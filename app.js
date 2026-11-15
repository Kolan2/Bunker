const $ = (s)=>document.querySelector(s);
let setting="modern";
let generatedPack=[];
let scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]};
const shuffle=(a)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const escapeHTML=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function showView(view){$("#home-view").classList.toggle("hidden",view!=="home");$("#catalog-view").classList.toggle("hidden",view!=="catalog");document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="catalog")renderCatalog()}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#show-catalog").addEventListener("click",()=>showView("catalog"));
$("#create-room").addEventListener("click",()=>$("#generator-panel").scrollIntoView({behavior:"smooth",block:"center"}));
document.querySelectorAll("[data-generate-setting]").forEach(b=>b.addEventListener("click",()=>generatePack(b.dataset.generateSetting)));
function makeDeck(category){const group=window.BUNKER_CARDS[setting].find(g=>g.category===category);return group?group.items.flatMap(card=>Array.from({length:Math.max(1,card.copies||1)},(_,i)=>({...card,category,copyIndex:i+1}))):[]}
function takeOne(pool,category){const choices=pool.map((c,i)=>({c,i})).filter(x=>x.c.category===category);if(!choices.length)return null;const picked=choices[Math.floor(Math.random()*choices.length)];return pool.splice(picked.i,1)[0]}
function generatePack(nextSetting){
 setting=nextSetting;
 document.querySelectorAll("[data-generate-setting]").forEach(b=>b.classList.toggle("selected",b.dataset.generateSetting===setting));
 const pool=shuffle(window.BUNKER_CARDS[setting].filter(g=>g.category!=="Катастрофа"&&g.category!=="Угроза"&&g.category!=="Преимущества бункера").flatMap(g=>g.items.flatMap(card=>Array.from({length:Math.max(1,card.copies||1)},(_,i)=>({...card,category:g.category,copyIndex:i+1})))));
 const needs=["Пол и возраст","Здоровье","Профессия","Хобби","Факт","Факт","Особое условие","Лёгкий багаж","Тяжёлый багаж"];
 generatedPack=needs.map(category=>takeOne(pool,category)).filter(Boolean);
 scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]};
 renderPack();renderScenario();
 $("#generated-pack").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function renderPack(){
 const el=$("#generated-pack");
 if(!generatedPack.length){el.innerHTML='<div class="pack-placeholder"><span>▤</span><b>Ваши карты появятся здесь</b><small>Выберите один из двух сеттингов выше.</small></div>';return}
 el.innerHTML='<div class="pack-heading"><div><p class="eyebrow">ВАШ СЛУЧАЙНЫЙ НАБОР</p><h3>'+(setting==="fantasy"?"Фэнтези":"Современность")+' · '+generatedPack.length+' карт</h3></div><button class="btn btn-ghost" id="reroll-pack">Перемешать набор ↻</button></div><div class="hand-grid">'+generatedPack.map((c,i)=>'<article class="hand-card revealed"><span class="card-category">'+escapeHTML(c.category.toUpperCase())+'</span><h3>'+escapeHTML(c.title)+'</h3><p>'+escapeHTML(c.description)+'</p></article>').join("")+'</div>';
 $("#reroll-pack").addEventListener("click",()=>generatePack(setting));
}
document.querySelectorAll(".scenario-draw").forEach(b=>b.addEventListener("click",()=>drawScenario(b.dataset.scenario)));
function drawScenario(category){
 const limits={"Катастрофа":1,"Угроза":2,"Преимущества бункера":3};
 const drawn=scenarioDrawn[category];if(drawn.length>=limits[category])return;
 const group=window.BUNKER_CARDS[setting].find(g=>g.category===category);if(!group)return;
 const remaining=group.items.filter(card=>!drawn.some(x=>x.id===card.id));if(!remaining.length)return;
 drawn.push(shuffle(remaining)[0]);renderScenario();
}
function renderScenario(){
 const order=["Катастрофа","Угроза","Преимущества бункера"];
 $("#scenario-revealed").innerHTML=order.map(category=>{
  const list=scenarioDrawn[category];if(!list.length)return "";
  return '<div class="scenario-result-group"><p class="eyebrow">'+escapeHTML(category.toUpperCase())+'</p><div class="scenario-result-grid">'+list.map(card=>{
   const details=card.details;
   const extra=category==="Катастрофа"&&details?'<div class="catastrophe-meta"><div><small>ТИП УГРОЗЫ</small><b>'+escapeHTML(details.threatType)+'</b></div><div><small>СКОЛЬКО ПЕРЕЖДАТЬ</small><b>'+escapeHTML(details.waitDuration)+'</b></div><div class="wide"><small>КОГДА МОЖНО ВЫХОДИТЬ</small><b>'+escapeHTML(details.exitCondition)+'</b></div></div>':"";
   return '<article class="scenario-result-card"><span>'+escapeHTML(category.toUpperCase())+'</span><h3>'+escapeHTML(card.title)+'</h3><p>'+escapeHTML(card.description)+'</p>'+extra+'</article>';
  }).join("")+'</div></div>';
 }).join("")||'<p class="scenario-empty">Пока ничего не раскрыто. Нажмите кнопку нужной колоды.</p>';
 document.querySelectorAll(".scenario-draw").forEach(b=>{
  const category=b.dataset.scenario,limit={"Катастрофа":1,"Угроза":2,"Преимущества бункера":3}[category],count=scenarioDrawn[category].length;
  b.disabled=count>=limit;
  b.textContent=count>=limit?"Колода раскрыта":category==="Катастрофа"?"Открыть катастрофу":category==="Угроза"?"Показать угрозу · "+(count+1)+"/"+limit:"Показать преимущество · "+(count+1)+"/"+limit;
 });
}
let activeCategory="Все карты";
let catalogSetting="modern";
document.querySelectorAll("[data-catalog-setting]").forEach(b=>b.addEventListener("click",()=>{catalogSetting=b.dataset.catalogSetting;activeCategory="Все карты";document.querySelectorAll("[data-catalog-setting]").forEach(x=>x.classList.toggle("selected",x===b));renderCatalog()}));
function renderCatalog(){
 const groups=window.BUNKER_CARDS[catalogSetting];
 const categories=groups.map(g=>g.category);
 if(activeCategory!=="Все карты"&&!categories.includes(activeCategory))activeCategory="Все карты";
 const all=groups.flatMap(g=>g.items.map(c=>({...c,category:g.category})));
 $("#catalog-count").textContent=all.length;
 const tabs=["Все карты",...categories];
 $("#category-tabs").innerHTML=tabs.map(t=>'<button class="category-tab '+(activeCategory===t?"active":"")+'" data-cat="'+escapeHTML(t)+'">'+escapeHTML(t)+'</button>').join("");
 $("#category-tabs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.cat;renderCatalog()}));
 const q=$("#card-search").value.toLowerCase().trim();
 const shown=all.filter(c=>(activeCategory==="Все карты"||c.category===activeCategory)&&(!q||(c.title+" "+c.description+" "+c.category).toLowerCase().includes(q)));
 $("#catalog-grid").innerHTML=shown.map(c=>'<article class="catalog-card"><div class="catalog-card-top"><span class="tag">'+escapeHTML(c.category.toUpperCase())+'</span><span class="copies">КОПИЙ: '+c.copies+'</span></div><h3>'+escapeHTML(c.title)+'</h3><p>'+escapeHTML(c.description)+'</p>'+(c.details?'<div class="catalog-card-details"><b>Тип угрозы:</b> '+escapeHTML(c.details.threatType)+'<br><b>Срок:</b> '+escapeHTML(c.details.waitDuration)+'<br><b>Выход:</b> '+escapeHTML(c.details.exitCondition)+'</div>':'')+'</article>').join("")||'<p class="catalog-footnote">По вашему запросу ничего не найдено.</p>';
}
$("#card-search").addEventListener("input",renderCatalog);
renderCatalog();
