(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=v=>String(v??"").replace(/[&<>"']/g,c=>({
"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}
[c]));
let data=null,model=null,geo=null,popoverPinned=false,toastTimer=0;
const cardIndex=new Map();

    function localTodayISO(){
const d=new Date();
return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function formatTime(iso){
if(!iso)return"—";
return new Intl.DateTimeFormat("de-DE",{
dateStyle:"short",timeStyle:"short"}
).format(new Date(iso))}
function showToast(msg,error=false){
const n=$("#toast");
n.textContent=msg;
n.style.background=error?"var(--bad)":"var(--brand-dark)";
n.hidden=false;
clearTimeout(toastTimer);
toastTimer=setTimeout(()=>n.hidden=true,3600)}

    function cardHtml(c,positioned){
const cls=["card",c.lane,c.kind==="room"?"room":"",c.done?"done":"",c.overdue?"overdue":""].filter(Boolean).join(" "),style=positioned?` style="left:${c.x}px;top:${c.y}px;width:${TL.GEO.cardW}px;height:${TL.GEO.cardH}px"`:"",date=`${c.estimated?"≈ ":""}${esc(c.dateText)}${c.overdue?'<span class="tag">ÜBERFÄLLIG</span>':""}`,meta=c.kind==="room"?(c.meta?(c.openScope?`<span class="empty">${esc(c.meta)}</span>`:esc(c.meta)):""):(c.lane==="source"?"":esc(c.meta||"")),where=`${esc(c.where)}${c.kicker?`<span class="kicker${c.where?"":" solo"}">${esc(c.kicker)}</span>`:""}`,aria=`${c.where}, ${c.title}, ${c.dateText}${c.done?", erledigt":c.overdue?", überfällig":""}`;
return`<button class="${cls}" type="button" data-card="${esc(c.id)}"${style} aria-label="${esc(aria)}"><span class="c-top"><span class="c-where">${where}</span><span class="c-date">${date}</span></span><span class="c-title">${esc(c.title)}</span>${meta?`<span class="c-meta">${meta}</span>`:""}</button>`}

    function branchPath(c){
const G=TL.GEO,source=c.lane==="source",sx=source?c.x+G.cardW:c.x,sy=c.mid,ex=c.knot.x,ey=geo.axisY+(source?-G.pillHalf:G.pillHalf),dx=Math.abs(ex-sx),bend=Math.max(24,Math.min(72,dx*.75));
if(source)return`M${sx},${sy} C${sx+bend},${sy} ${ex-bend*.45},${ey-20} ${ex},${ey}`;
return`M${ex},${ey} C${ex+bend*.45},${ey+20} ${sx-bend},${sy} ${sx},${sy}`}

    function renderCanvas(){
const G=TL.GEO,ks=model.knots;
cardIndex.clear();
if(!ks.length){
$("#canvas").innerHTML='<div class="empty-state">Keine Termine mit Datum vorhanden.</div>';
return}
let svg=`<svg viewBox="0 0 ${geo.width} ${geo.height}" preserveAspectRatio="none" aria-hidden="true">`,xStart=20,xEnd=geo.width-G.padRight+10;
svg+=`<line class="axis" x1="${xStart}" y1="${geo.axisY}" x2="${xEnd}" y2="${geo.axisY}"/>`;
if(geo.todayX!==null)svg+=`<line class="axis-past" x1="${xStart}" y1="${geo.axisY}" x2="${Math.min(geo.todayX,xEnd)}" y2="${geo.axisY}"/>`;
for(const b of geo.breaks)svg+=`<line class="break-mark" x1="${b.x-7}" y1="${geo.axisY+8}" x2="${b.x+7}" y2="${geo.axisY-8}"/><line class="break-mark2" x1="${b.x-9}" y1="${geo.axisY+8}" x2="${b.x+1}" y2="${geo.axisY-8}"/><line class="break-mark2" x1="${b.x-1}" y1="${geo.axisY+8}" x2="${b.x+9}" y2="${geo.axisY-8}"/>`;
for(const c of geo.cards)svg+=`<path class="branch ${c.lane}${c.estimated?" est":""}${c.done?" done":""}" d="${branchPath(c)}"/>`;
if(geo.todayX!==null)svg+=`<line class="today-line" x1="${geo.todayX}" y1="20" x2="${geo.todayX}" y2="${geo.height-6}"/>`;
svg+='</svg>';
let html=svg;
for(const b of geo.breaks)html+=`<span class="break-label" style="left:${b.x}px;top:${geo.axisY+16}px">${b.days} Tage</span>`;
for(const k of ks)html+=`<div class="knot${k.estimated?" est":""}${k.done?" done":k.isToday?" today":k.overdue?" overdue":k.past?" past":""}" style="left:${k.x}px;top:${geo.axisY}px" title="${esc(k.events.map(e=>e.title).join("; "))}">${k.isToday?'<span class="today-word">Heute</span>':""}${k.estimated?"≈ ":""}${esc(k.label)}</div>`;
if(geo.todayX!==null&&!ks.some(k=>k.isToday))html+=`<div class="knot today plain" style="left:${geo.todayX}px;top:${geo.axisY}px">Heute</div>`;
for(const c of geo.cards){
cardIndex.set(c.id,c);
html+=cardHtml(c,true)}
const canvas=$("#canvas");
canvas.style.width=`${geo.width}px`;
canvas.style.height=`${geo.height}px`;
canvas.innerHTML=html;
bindCards(canvas)}

    function renderList(){
const ks=model.knots;
$("#listView").innerHTML=ks.map(k=>`<div class="list-knot"><div class="knot${k.estimated?" est":""}${k.done?" done":k.isToday?" today":k.overdue?" overdue":k.past?" past":""}">${k.estimated?"≈ ":""}${esc(k.label)}</div><div class="lk-line"></div></div>${k.source.map(c=>cardHtml(c,false)).join("")}${k.target.map(c=>cardHtml(c,false)).join("")}`).join("");
bindCards($("#listView"))}

    function renderUndated(){
const u=model.undatedEvents,a=model.undatedAssets,cards=u.map(c=>{
cardIndex.set(c.id,c);
return cardHtml(c,false)}
).join("")||'<p class="view-hint">Keine Ereignisse ohne Termin.</p>',agg=a.aggregated.map(g=>`<li><span class="count">${g.items.length} ×</span><span class="what">${esc(g.category)}<small>${esc(g.items.map(i=>i.label).join(", "))}</small></span></li>`).join(""),single=a.single.map(s=>`<li><span class="count">1 ×</span><span class="what">${esc(s.label)}<small>${esc(s.from)} → ${esc(s.to)}${s.note?" · "+esc(s.note):""}</small></span></li>`).join("");
$("#undated").innerHTML=`<h2>Noch ohne Termin</h2><p class="sub">${u.length} Ereignis${u.length===1?"":"se"} ohne Datum und ${a.aggregated.reduce((n,g)=>n+g.items.length,0)+a.single.length} Ausstattungsbewegungen ohne Termin – das ist die Entscheidungsliste.</p><div class="undated-grid"><div><h3>Ereignisse ohne Datum</h3><div class="undated-cards">${cards}</div></div><div><h3>Ausstattung ohne Termin oder Herkunft</h3><ul class="asset-list">${agg}${single}</ul></div></div>`;
bindCards($("#undated"))}

    function bindCards(root){
$$(".card",root).forEach(el=>{
el.addEventListener("mouseenter",()=>{
if(!popoverPinned)showPopover(el,false)}
);
el.addEventListener("mouseleave",()=>{
if(!popoverPinned)hidePopover()}
);
el.addEventListener("focus",()=>{
if(!popoverPinned)showPopover(el,false)}
);
el.addEventListener("blur",()=>{
if(!popoverPinned)hidePopover()}
);
el.addEventListener("click",()=>{
popoverPinned=true;
showPopover(el,true)}
)}
)}

    function showPopover(el,pin){
const c=cardIndex.get(el.dataset.card);
if(!c)return;
const h=model.helpers;
let html="";
if(c.kind==="room"){
const evs=c.events.map(e=>e.title+(e.estimated?" ≈":"")).join("; ")||"—";
html=`<h3>${esc(c.where)}</h3><dl><dt>Termin</dt><dd>${c.estimated?"≈ ":""}${esc(c.dateText)}</dd><dt>Ereignis</dt><dd>${esc(evs)}</dd><dt>Zuständig</dt><dd>${esc(c.responsibles.join(", ")||"—")}</dd><dt>Status</dt><dd>${c.done?"erledigt":c.overdue?"überfällig":"geplant"}</dd></dl>`;
if(c.moves.length)html+=`<ul>${c.moves.map(m=>`<li>${esc(h.asset(m.assetId)?.label||m.assetId)} <small>· von ${esc(h.locName(m.from))} · ${m.status==="done"?"erledigt"+(m.actualDate?" "+TL.fmtLong(m.actualDate):""):m.status==="open"?"offen":"geplant"}${m.note?" · "+esc(m.note):""}</small></li>`).join("")}</ul>`;
else html+='<p class="popover-note">Für diesen Raum ist an diesem Termin keine einzelne Ausstattungsbewegung hinterlegt; angezeigt wird der Raumzustand aus dem Ereignis.</p>';
if(c.note&&!c.moves.length)html+=`<p class="popover-note">${esc(c.note)}</p>`}
else{
const ev=c.event;
html=`<h3>${esc(c.title)}</h3><dl><dt>Termin</dt><dd>${c.estimated?"≈ ":""}${esc(c.dateText)}</dd><dt>Zuständig</dt><dd>${esc(ev?h.person(ev.responsible):(c.kicker||"—"))}</dd><dt>Räume</dt><dd>${esc((c.rooms||[]).join(", ")||"—")}</dd><dt>Status</dt><dd>${c.done?"erledigt":c.overdue?"überfällig":"geplant"}</dd><dt>Seite</dt><dd>${c.lane==="source"?"oben – Voraussetzung / Quellseite":"unten – Ankunft in FI"}${ev&&!ev.timelineLane?" (automatisch zugeordnet)":""}</dd></dl>`;
if(c.moves?.length)html+=`<ul>${c.moves.map(m=>`<li>${esc(h.asset(m.assetId)?.label||m.assetId)} <small>· ${esc(h.locName(m.from))} → ${esc(h.locName(m.to))}${m.note?" · "+esc(m.note):""}</small></li>`).join("")}</ul>`;
if(c.note)html+=`<p class="popover-note">${esc(c.note)}</p>`}
$("#popoverContent").innerHTML=html;
const pop=$("#popover");
pop.hidden=false;
pop.classList.toggle("pinned",pin);
const r=el.getBoundingClientRect(),w=Math.min(360,window.innerWidth-24);
let left=Math.min(window.innerWidth-w-12,Math.max(12,r.left)),top=r.bottom+8;
if(top+280>window.innerHeight)top=Math.max(12,r.top-288);
pop.style.left=`${left}px`;
pop.style.top=`${top}px`}

    function hidePopover(){
popoverPinned=false;
const p=$("#popover");
p.hidden=true;
p.classList.remove("pinned")}

    function scrollToX(x){
const sc=$("#canvasScroll"),anchor=Math.max(120,Math.min(sc.clientWidth*.25,420));
sc.scrollTo({
left:Math.max(0,x-anchor),behavior:"smooth"}
)}
function scrollToday(){
if(geo&&geo.todayX!==null)scrollToX(geo.todayX)}
function jumpKnot(dir){
const sc=$("#canvasScroll"),anchor=Math.max(120,Math.min(sc.clientWidth*.25,420)),cur=sc.scrollLeft+anchor,xs=model.knots.map(k=>k.x),target=dir>0?xs.find(x=>x>cur+4):[...xs].reverse().find(x=>x<cur-4);
if(target!==undefined)scrollToX(target)}

    function enableDrag(){
const sc=$("#canvasScroll");
let active=false,startX=0,startScroll=0,moved=false;
sc.addEventListener("pointerdown",e=>{
if(e.button!==0||e.target.closest(".card,.knot,.break-label,button,a"))return;
active=true;
moved=false;
startX=e.clientX;
startScroll=sc.scrollLeft;
sc.classList.add("dragging");
sc.setPointerCapture(e.pointerId)}
);
sc.addEventListener("pointermove",e=>{
if(!active)return;
const dx=e.clientX-startX;
if(Math.abs(dx)>3)moved=true;
sc.scrollLeft=startScroll-dx}
);
const end=e=>{
if(!active)return;
active=false;
sc.classList.remove("dragging");
try{
sc.releasePointerCapture(e.pointerId)}
catch(_){
}
if(moved)e.preventDefault()}
;
sc.addEventListener("pointerup",end);
sc.addEventListener("pointercancel",end);
sc.addEventListener("lostpointercapture",()=>{
active=false;
sc.classList.remove("dragging")}
)}

    function renderAll(){
const today=localTodayISO();
model=TL.buildModel(data,today);
geo=TL.layout(model);
$("#systemDate").textContent=TL.fmtLong(today);
$("#dataTimestamp").textContent=formatTime(data.updatedAt);
$("#todayLabel").textContent=TL.fmtLong(today);
const nDated=model.knots.reduce((n,k)=>n+k.events.length,0);
$("#stats").textContent=`${model.knots.length} Termine · ${nDated} Ereignisse mit Datum · ${model.undatedEvents.length} ohne Datum`;
$("#printMeta").textContent=`Datenstand ${formatTime(data.updatedAt)} · gedruckt ${TL.fmtLong(today)}`;
renderCanvas();
renderList();
renderUndated()}

    async function fetchRemote(){
try{
const r=await fetch(`data.json?ts=${Date.now()}`,{
cache:"no-store"}
);
if(!r.ok)return null;
const j=await r.json();
if(!j||!Array.isArray(j.events))return null;
return j}
catch(e){
return null}
}
async function refresh(initial=false){
const remote=await fetchRemote();
if(remote){
if(!data||remote.updatedAt!==data.updatedAt){
data=remote;
renderAll();
if(initial)requestAnimationFrame(scrollToday);
else showToast(`Neuer Stand geladen: ${formatTime(data.updatedAt)}`)}
}
else if(initial)$("#canvas").innerHTML='<div class="empty-state">Der aktuelle Stand (data.json) konnte nicht geladen werden. Diese Seite braucht die Datei neben sich, zum Beispiel über den GitHub-Pages-Link.</div>'}

    let savedScroll=0;
function fitForPrint(){
if(!geo)return;
const canvas=$("#canvas"),wrap=$("#canvasScroll");
savedScroll=wrap.scrollLeft;
wrap.scrollLeft=0;
const pageW=1520,pageH=1050,s=Math.min(1,pageW/geo.width,pageH/geo.height);
canvas.style.zoom=String(s);
wrap.style.height=`${Math.ceil(geo.height*s)}px`;
wrap.style.width=`${Math.ceil(geo.width*s)}px`}
function unfitPrint(){
const canvas=$("#canvas"),wrap=$("#canvasScroll");
canvas.style.zoom="";
wrap.style.height="";
wrap.style.width="";
wrap.scrollLeft=savedScroll}

    $("#prevBtn").addEventListener("click",()=>jumpKnot(-1));
$("#nextBtn").addEventListener("click",()=>jumpKnot(1));
$("#todayBtn").addEventListener("click",scrollToday);
$("#popoverClose").addEventListener("click",hidePopover);
document.addEventListener("keydown",e=>{
if(e.key==="Escape")hidePopover()}
);
document.addEventListener("click",e=>{
if(popoverPinned&&!e.target.closest(".card,.popover"))hidePopover()}
);
$("#printBtn").addEventListener("click",()=>{
hidePopover();
window.print()}
);
window.addEventListener("beforeprint",fitForPrint);
window.addEventListener("afterprint",unfitPrint);
enableDrag();
refresh(true);
setInterval(()=>refresh(false),5*60*1000);
document.addEventListener("visibilitychange",()=>{
if(!document.hidden)refresh(false)}
)
  }
)();
