const $ = (s)=>document.querySelector(s);
let setting="modern";
let generatedPack=[];
let scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]};
let bonusCandidate=null;
let transferMode=null;
let recentlyDrawn={"Профессия":[],"Факт":[]};
const shuffle=(a)=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const escapeHTML=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function showView(view){$("#home-view").classList.toggle("hidden",view!=="home");$("#catalog-view").classList.toggle("hidden",view!=="catalog");document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="catalog")renderCatalog()}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#show-catalog").addEventListener("click",()=>showView("catalog"));
$("#create-room").addEventListener("click",()=>$("#generator-panel").scrollIntoView({behavior:"smooth",block:"center"}));
document.querySelectorAll("[data-generate-setting]").forEach(b=>b.addEventListener("click",()=>generatePack(b.dataset.generateSetting)));
function makeDeck(category){const group=window.BUNKER_CARDS[setting].find(g=>g.category===category);return group?group.items.flatMap(card=>Array.from({length:Math.max(1,card.copies||1)},(_,i)=>({...card,category,copyIndex:i+1}))):[]}
function factConflict(a,b){
 const clean=s=>String(s||"").toLowerCase().replace(/ё/g,"е").replace(/[^а-яa-z0-9 ]/g," ").split(/\s+/).filter(Boolean);
 const A=clean((a.title||"")+" "+(a.description||"")),B=clean((b.title||"")+" "+(b.description||""));
 const themes=[
  ["осад","осажд","блокад","крепостн","оборонял крепост"],
  ["лавин","снежн обвал","сход снега"],
  ["землетряс","толч","сейсмич"],
  ["портал","разлом","межмиров","планарн"],
  ["эпидем","пандем","чум","заражени","инфекц"],
  ["кораблекруш","потерпел кораблекруш","затонул корабл"],
  ["отключени электр","без электрич","энергосистем"],
  ["заблуд","потерялся","потерял ориентир"],
  ["выжил в лес","лесную неделю","жил в лесу"],
  ["долг гильд","должен гильд","книга долгов"],
  ["чужое имя","настоящее имя","скрывает имя"],
  ["дракон","грифон","василиск"]
 ];
 const has=(words,root)=>words.some(x=>x.includes(root));
 for(const theme of themes)if(theme.some(root=>has(A,root))&&theme.some(root=>has(B,root)))return true;
 const stop=new Set(["однажды","когда","то","был","была","было","были","имеет","умеет","знает","пережил","пережила","пережили","в","на","из","после","во","с","и","для","при","свой","свою","свои","несколько","один","одна","одну","среди","около","рядом"]);
 const aa=new Set(A.filter(x=>x.length>3&&!stop.has(x))),bb=new Set(B.filter(x=>x.length>3&&!stop.has(x)));
 const common=[...aa].filter(x=>bb.has(x)).length;
 return common>=2&&common/Math.max(1,Math.min(aa.size,bb.size))>=0.5;
}
function takeOne(pool,category,exclude=[]){let choices=pool.map((c,i)=>({c,i})).filter(x=>x.c.category===category&&!exclude.some(e=>category==="Факт"?factConflict(e,x.c):e.title===x.c.title));if(!choices.length&&category==="Профессия")choices=pool.map((c,i)=>({c,i})).filter(x=>x.c.category===category);if(!choices.length)return null;const picked=choices[Math.floor(Math.random()*choices.length)];return pool.splice(picked.i,1)[0]}
function generatePack(nextSetting){
 setting=nextSetting;
 bonusCandidate=null;
 transferMode=null;
 document.querySelectorAll("[data-generate-setting]").forEach(b=>b.classList.toggle("selected",b.dataset.generateSetting===setting));
 const pool=shuffle(window.BUNKER_CARDS[setting].filter(g=>g.category!=="Катастрофа"&&g.category!=="Угроза"&&g.category!=="Преимущества бункера").flatMap(g=>g.items.flatMap(card=>Array.from({length:Math.max(1,card.copies||1)},(_,i)=>({...card,category:g.category,copyIndex:i+1})))));
 const needs=["Пол и возраст","Здоровье","Профессия","Хобби","Факт","Факт","Особое условие","Лёгкий багаж","Тяжёлый багаж"];
 generatedPack=[];for(const category of needs){const exclude=category==="Факт"?[...recentlyDrawn["Факт"],...generatedPack.filter(c=>c.category==="Факт")]:category==="Профессия"?recentlyDrawn["Профессия"]:[];const picked=takeOne(pool,category,exclude);if(picked){generatedPack.push(picked);if(category==="Факт"||category==="Профессия"){recentlyDrawn[category].push(picked);recentlyDrawn[category]=recentlyDrawn[category].slice(category==="Факт"?-8:-6)}}}
 scenarioDrawn={"Катастрофа":[],"Угроза":[],"Преимущества бункера":[]};
 renderPack();renderScenario();
 $("#generated-pack").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function renderPack(){
 const el=$("#generated-pack");
 if(!generatedPack.length){el.innerHTML='<div class="pack-placeholder"><span>▤</span><b>Ваши карты появятся здесь</b><small>Выберите один из двух сеттингов выше.</small></div>';return}
 el.innerHTML='<div class="pack-heading"><div><p class="eyebrow">ВАШ СЛУЧАЙНЫЙ НАБОР</p><h3>'+(setting==="fantasy"?"Фэнтези":"Современность")+' · '+generatedPack.length+' карт</h3></div><button class="btn btn-ghost" id="reroll-pack">Перемешать набор ↻</button></div><div class="hand-grid">'+generatedPack.map((c,i)=>'<article class="hand-card revealed"><span class="card-category">'+escapeHTML(c.category.toUpperCase())+'</span><h3>'+escapeHTML(c.title)+'</h3><p>'+escapeHTML(c.description)+'</p>'+(c.category==="Особое условие"&&["bonus-profession","replace-profession","keep-profession","bonus-light-baggage","replace-health","steal-baggage","swap-baggage"].includes(c.action)?'<button class="btn btn-ghost special-action" data-special-action="'+escapeHTML(c.action)+'">'+(c.action==="bonus-profession"?"Вытянуть профессию":c.action==="replace-profession"?"Вытянуть замену профессии":c.action==="keep-profession"?"Вытянуть вторую профессию":c.action==="replace-health"?"Вытянуть замену здоровья":c.action==="steal-baggage"?"Добавить украденный багаж":c.action==="swap-baggage"?"Обменять багаж":"Вытянуть багаж")+'</button>':'')+'</article>').join("")+'</div>'+(bonusCandidate?'<div class="bonus-choice"><p class="eyebrow">ДОПОЛНИТЕЛЬНАЯ КАРТА · ВЫБЕРИТЕ ДЕЙСТВИЕ</p><h3>'+escapeHTML(bonusCandidate.title)+'</h3><p>'+escapeHTML(bonusCandidate.description)+'</p><div class="bonus-choice-actions"><button class="btn btn-primary" id="accept-bonus">'+(bonusCandidate.bonusAction==="keep-profession"?"Оставить обе профессии":bonusCandidate.bonusAction==="bonus-light-baggage"?"Добавить к багажу":"Заменить прежнюю карту")+'</button><button class="btn btn-ghost" id="discard-bonus">'+(bonusCandidate.bonusAction==="bonus-light-baggage"?"Не брать карту":"Оставить прежнюю")+'</button></div><small>При замене прежняя карта соответствующей категории будет сброшена. При дополнительной профессии обе карты останутся в наборе.</small></div>':'')+(transferMode?'<div class="bonus-choice"><p class="eyebrow">'+(transferMode==="swap-baggage"?"ОБМЕН БАГАЖОМ":"ДОБАВЛЕНИЕ УКРАДЕННОЙ КАРТЫ")+'</p><h3>Укажите карту, которую показал соперник</h3><p>Соперник должен раскрыть вам соответствующую карту. Введите её точное название — генератор добавит её в ваш набор.</p><label>Категория карты<select id="transfer-category"><option>Лёгкий багаж</option><option>Тяжёлый багаж</option></select></label><label>Название карты соперника<input id="transfer-title" placeholder="Например: Аптечка первой помощи"></label><label>У кого забрали (необязательно)<input id="transfer-source" placeholder="Имя игрока"></label>'+(transferMode==="swap-baggage"?'<label>Ваша карта для обмена<select id="transfer-own">'+generatedPack.filter(x=>["Лёгкий багаж","Тяжёлый багаж"].includes(x.category)).map(x=>'<option value="'+escapeHTML(x.title)+'">'+escapeHTML(x.category+": "+x.title)+'</option>').join("")+'</select></label>':'')+'<div class="bonus-choice-actions"><button class="btn btn-primary" id="confirm-transfer">'+(transferMode==="swap-baggage"?"Подтвердить обмен":"Добавить карту")+'</button><button class="btn btn-ghost" id="cancel-transfer">Отмена</button></div></div>':'');
 $("#reroll-pack").addEventListener("click",()=>generatePack(setting));
 document.querySelectorAll(".special-action").forEach(b=>b.addEventListener("click",()=>{if(!["steal-baggage","swap-baggage"].includes(b.dataset.specialAction))drawBonusCard(b.dataset.specialAction)}));
 const accept=$("#accept-bonus"),discard=$("#discard-bonus");
 if(accept)accept.addEventListener("click",acceptBonusCard);
 if(discard)discard.addEventListener("click",()=>{bonusCandidate=null;renderPack()});
 document.querySelectorAll(".special-action").forEach(b=>b.addEventListener("click",()=>{if(["steal-baggage","swap-baggage"].includes(b.dataset.specialAction)){transferMode=b.dataset.specialAction;bonusCandidate=null;renderPack()}}));
 const confirmTransfer=$("#confirm-transfer"),cancelTransfer=$("#cancel-transfer");
 if(confirmTransfer)confirmTransfer.addEventListener("click",confirmBaggageTransfer);
 if(cancelTransfer)cancelTransfer.addEventListener("click",()=>{transferMode=null;renderPack()});
}
function confirmBaggageTransfer(){
 const title=$("#transfer-title")?.value.trim(),category=$("#transfer-category")?.value,source=$("#transfer-source")?.value.trim();
 if(!title){alert("Введите точное название карты соперника.");return;}
 if(transferMode==="swap-baggage"){
  const ownTitle=$("#transfer-own")?.value;
  if(!ownTitle){alert("В вашем наборе нет карты багажа для обмена.");return;}
  const index=generatedPack.findIndex(c=>c.title===ownTitle&&["Лёгкий багаж","Тяжёлый багаж"].includes(c.category));
  if(index<0){alert("Не удалось найти вашу карту для обмена.");return;}
  generatedPack.splice(index,1);
 }
 generatedPack.push({id:"transferred-"+Math.random().toString(36).slice(2),title,description:"Карта перенесена из набора "+(source||"другого игрока")+" по эффекту особого условия. Ведущий должен убрать её из прежнего набора: это перенос, а не копирование.",category,copies:1,transferred:true});
 transferMode=null;renderPack();
}
function drawBonusCard(action){
 const category=action==="bonus-light-baggage"?"Лёгкий багаж":action==="replace-health"?"Здоровье":"Профессия";
 const current=generatedPack.filter(c=>c.category===category);
 const deck=makeDeck(category).filter(c=>!current.some(old=>old.title===c.title));
 if(!deck.length){alert("В этой колоде больше нет подходящих карт.");return;}
 bonusCandidate={...shuffle(deck)[0],bonusAction:action};
 renderPack();
}
function acceptBonusCard(){
 if(!bonusCandidate)return;
 const action=bonusCandidate.bonusAction;
 const category=bonusCandidate.category;
 const replace=["bonus-profession","replace-profession","replace-health"].includes(action);
 if(replace){const index=generatedPack.findIndex(c=>c.category===category);if(index>=0)generatedPack.splice(index,1);}
 generatedPack.push(bonusCandidate);
 bonusCandidate=null;
 renderPack();
}
document.querySelectorAll(".scenario-draw").forEach(b=>b.addEventListener("click",()=>drawScenario(b.dataset.scenario)));
document.querySelectorAll(".scenario-reroll-button").forEach(b=>b.addEventListener("click",()=>rerollScenario(b.dataset.rerollScenario)));
function drawScenario(category){
 const limits={"Катастрофа":1,"Угроза":2,"Преимущества бункера":3};
 const drawn=scenarioDrawn[category];if(drawn.length>=limits[category])return;
 const group=window.BUNKER_CARDS[setting].find(g=>g.category===category);if(!group)return;
 const remaining=group.items.filter(card=>!drawn.some(x=>x.title===card.title));if(!remaining.length)return;
 drawn.push(shuffle(remaining)[0]);renderScenario();
}
function rerollScenario(category){const drawn=scenarioDrawn[category],group=window.BUNKER_CARDS[setting].find(g=>g.category===category);if(!group||!drawn.length)return;const remaining=shuffle(group.items.filter(card=>!drawn.some(old=>old.title===card.title)));scenarioDrawn[category]=remaining.slice(0,drawn.length);renderScenario()}
function renderScenario(){
 const order=["Катастрофа","Угроза","Преимущества бункера"];
 $("#scenario-revealed").innerHTML=order.map(category=>{
  const list=scenarioDrawn[category];if(!list.length)return "";
  return '<div class="scenario-result-group"><div class="scenario-result-heading"><p class="eyebrow">'+escapeHTML(category.toUpperCase())+'</p><button class="btn btn-ghost scenario-reroll" data-reroll-scenario="'+escapeHTML(category)+'">Перебросить ↻</button></div><div class="scenario-result-grid">'+list.map(card=>{
   const details=card.details;
   const extra=category==="Катастрофа"&&details?'<div class="catastrophe-meta"><div><small>ТИП УГРОЗЫ</small><b>'+escapeHTML(details.threatType)+'</b></div><div><small>СКОЛЬКО ПЕРЕЖДАТЬ</small><b>'+escapeHTML(details.waitDuration)+'</b></div><div class="wide"><small>КОГДА МОЖНО ВЫХОДИТЬ</small><b>'+escapeHTML(details.exitCondition)+'</b></div></div>':"";
   return '<article class="scenario-result-card"><span>'+escapeHTML(category.toUpperCase())+'</span><h3>'+escapeHTML(card.title)+'</h3><p>'+escapeHTML(card.description)+'</p>'+extra+'</article>';
  }).join("")+'</div></div>';
 }).join("")||'<p class="scenario-empty">Пока ничего не раскрыто. Нажмите кнопку нужной колоды.</p>';
 document.querySelectorAll(".scenario-reroll").forEach(b=>b.addEventListener("click",()=>rerollScenario(b.dataset.rerollScenario)));document.querySelectorAll(".scenario-reroll-button").forEach(b=>{b.disabled=!scenarioDrawn[b.dataset.rerollScenario].length});
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
