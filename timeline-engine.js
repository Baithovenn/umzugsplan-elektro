const TL=(()=>{
"use strict";

    const dayMs=86400000,WD=["So","Mo","Di","Mi","Do","Fr","Sa"];

    const GEO={
unit:100,minU:1,maxU:5,breakDays:14,breakU:3.2,x0:370,cardW:280,cardH:72,pitch:82,branchGap:48,gap:10,corridor:36,padTop:30,padBottom:26,padRight:56,pillHalf:12}
;

    function isoDay(iso){
if(!iso)return null;
const[y,m,d]=iso.split("-").map(Number);
return Math.floor(Date.UTC(y,m-1,d)/dayMs)}

    function parts(iso){
const[y,m,d]=iso.split("-").map(Number);
return{
y,m,d,wd:WD[new Date(Date.UTC(y,m-1,d)).getUTCDay()]}
}

    const two=n=>String(n).padStart(2,"0");
function fmtShort(iso){
const p=parts(iso);
return`${two(p.d)}.${two(p.m)}.`}
function fmtRange(a,b){
if(!b||b===a)return fmtShort(a);
const A=parts(a),B=parts(b);
return A.m===B.m&&A.y===B.y?`${two(A.d)}.–${fmtShort(b)}`:`${fmtShort(a)}–${fmtShort(b)}`}
function fmtWd(a,b){
if(!a)return"Termin offen";
const A=parts(a);
if(!b||b===a)return`${A.wd} ${fmtShort(a)}`;
const B=parts(b);
return A.m===B.m&&A.y===B.y?`${A.wd} ${two(A.d)}.–${B.wd} ${fmtShort(b)}`:`${A.wd} ${fmtShort(a)} – ${B.wd} ${fmtShort(b)}`}
function fmtLong(iso){
if(!iso)return"Termin offen";
const p=parts(iso);
return`${p.wd} ${two(p.d)}.${two(p.m)}.${p.y}`}

    function buildModel(data,todayISO){

      const locById=id=>data.locations.find(x=>x.id===id),locName=id=>locById(id)?.name||id||"offen",locIndex=id=>{
const i=data.locations.findIndex(x=>x.id===id);
return i<0?999:i}
,evById=id=>data.events.find(x=>x.id===id),person=id=>data.people.find(x=>x.id===id)?.name||id||"—",cat=id=>data.categories.find(x=>x.id===id),asset=id=>data.assets.find(x=>x.id===id),kindLabel=loc=>!loc?"":loc.type||({
buero:"Büro",nebenraum:"Nebenraum",lager:"Lager",quelle:"Quelle",system:""}
[loc.kind]||""),roomShort=id=>String(id).replace(/^FI-/,""),respLabel=id=>!id||id==="offen"?"Zuständigkeit offen":person(id);

      const events=data.events.filter(e=>e.status!=="cancelled"),activeMoves=data.moves.filter(m=>m.status!=="cancelled"&&(!m.eventId||evById(m.eventId)?.status!=="cancelled")&&asset(m.assetId)?.active!==false),movesOf=ev=>activeMoves.filter(m=>m.eventId===ev.id),today=isoDay(todayISO);

      const isFITarget=id=>{
const l=locById(id);
return!!l&&(l.visible==="main"||l.visible==="side"||id==="FI-LAGER")}
;

      const splitMoves=ev=>{
const all=movesOf(ev);
return{
all,fi:all.filter(m=>isFITarget(m.to)),out:all.filter(m=>!isFITarget(m.to))}
}
;

      function laneOf(ev){
const explicit=String(ev.timelineLane||"").toLowerCase();
if(explicit==="source"||explicit==="quelle")return"source";
if(explicit==="target"||explicit==="ziel")return"target";
const sm=splitMoves(ev);
if(sm.fi.length)return"target";
if(sm.out.length)return"source";
if(!(ev.affectedRooms||[]).length)return"source";
if(["elektrofirma","baur"].includes(ev.responsible))return"source";
return"target"}

      const evState=ev=>{
const day=isoDay(ev.date),end=isoDay(ev.endDate||ev.date),done=ev.status==="done",overdue=!done&&end!==null&&end<today;
return{
done,overdue,past:day!==null&&day<today,isToday:day===today}
}
;

      const knotMap=new Map(),knotFor=date=>{
if(!knotMap.has(date))knotMap.set(date,{
date,endDate:date,events:[],standaloneMoves:[]}
);
return knotMap.get(date)}
;

      for(const ev of events)if(ev.date){
const k=knotFor(ev.date);
k.events.push(ev);
if(ev.endDate&&ev.endDate>k.endDate)k.endDate=ev.endDate}
for(const m of activeMoves)if(!m.eventId&&m.date)knotFor(m.date).standaloneMoves.push(m);
const knots=[...knotMap.values()].sort((a,b)=>a.date<b.date?-1:1);

      const makeSourceCard=(ev,knot)=>{
const st=evState(ev);
return{
kind:"event",lane:"source",id:`s:${ev.id}`,event:ev,knot,title:ev.title,where:(ev.affectedRooms||[]).map(roomShort).join(" · "),kicker:respLabel(ev.responsible),dateText:fmtWd(ev.date,ev.endDate),estimated:!!ev.estimated,...st,note:ev.note||"",rooms:(ev.affectedRooms||[]).map(locName),moves:[]}
}
;

      const assetLine=m=>asset(m.assetId)?.label||m.assetId,stripSource=(label,from)=>String(label).replace(new RegExp(`\\s*${String(from).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?![\\w-])`),"").replace(/\s{2,}/g," ").trim()||label;

      const assetsBySource=moves=>{
const by=new Map();
for(const m of moves){
if(!by.has(m.from))by.set(m.from,[]);
by.get(m.from).push(stripSource(assetLine(m),m.from))}
return[...by.entries()].map(([from,labels])=>`${locName(from)}: ${labels.join(", ")}`).join(" · ")}
;

      const makeOutboundCard=(moves,knot,ev=null)=>{
const tos=[...new Set(moves.map(m=>m.to))],done=moves.every(m=>m.status==="done"),estimated=!!ev?.estimated,overdue=!done&&knot&&isoDay(knot.endDate||knot.date)<today;
return{
kind:"outbound",lane:"source",id:`o:${ev?ev.id:knot?.date||"open"}:${tos.join("+")}`,event:ev,knot,title:moves.map(m=>`${locName(m.from)} → ${locName(m.to)}: ${assetLine(m)}`).join(" · "),where:tos.map(locName).join(" · "),kicker:ev?respLabel(ev.responsible):respLabel(moves[0]?.responsible),dateText:knot?fmtWd(ev?.date||knot.date,ev?.endDate||""):"Termin offen",estimated,done,overdue,past:knot?isoDay(knot.date)<today:false,moves,note:ev?.note||"",rooms:[]}
}
;

      const makeRoomCard=(loc,group,knot)=>{
const evs=[...group.events],moves=group.moves,allDone=moves.length?moves.every(m=>m.status==="done"):evs.length?evs.every(e=>e.status==="done"):false,anyEst=evs.some(e=>e.estimated),overdue=!allDone&&!!knot&&isoDay(knot.endDate||knot.date)<today,responsibles=[...new Set([...moves.map(m=>m.responsible),...evs.map(e=>e.responsible)].filter(Boolean))].map(person),dateText=knot?fmtWd(evs.length?evs[0].date:knot.date,evs.length?evs.map(e=>e.endDate).filter(Boolean).sort().at(-1):""):"Termin offen",eventText=[...new Set(evs.map(e=>e.title))].join(" / "),notes=[...new Set([...evs.map(e=>e.note),...moves.map(m=>m.note)].filter(Boolean))].join(" "),title=moves.length?`aus ${assetsBySource(moves)}`:eventText;
return{
kind:"room",lane:"target",id:`r:${knot?knot.date:"open"}:${loc.id}`,loc,knot,events:evs,moves,title,where:loc.name,kicker:kindLabel(loc),dateText,estimated:anyEst,done:allDone,overdue,past:knot?isoDay(knot.date)<today:false,meta:moves.length?eventText:(evs.length?"keine Einzelbewegung hinterlegt":""),noAssets:!moves.length,openScope:false,responsibles,note:notes}
}
;

      const makeEventTargetCard=(ev,knot)=>{
const st=evState(ev);
return{
kind:"event",lane:"target",id:`t:${ev.id}`,event:ev,knot,title:ev.title,where:(ev.affectedRooms||[]).map(roomShort).join(" · ")||"FI",kicker:"",dateText:fmtWd(ev.date,ev.endDate),estimated:!!ev.estimated,...st,meta:respLabel(ev.responsible),note:ev.note||"",rooms:(ev.affectedRooms||[]).map(locName),moves:[]}
}
;

      const buildTargetCards=(evs,standalone,knot)=>{
const groups=new Map(),eventOnly=[],g=id=>{
if(!groups.has(id))groups.set(id,{
moves:[],events:new Set()}
);
return groups.get(id)}
;
for(const ev of evs){
const sm=splitMoves(ev),mv=sm.fi;
if(mv.length){
for(const m of mv){
g(m.to).moves.push(m);
g(m.to).events.add(ev)}
for(const r of ev.affectedRooms||[])if(isFITarget(r))g(r).events.add(ev)}
else eventOnly.push(ev)}
for(const m of standalone.filter(m=>isFITarget(m.to)))g(m.to).moves.push(m);
const roomCards=[...groups.entries()].sort((a,b)=>locIndex(a[0])-locIndex(b[0])).map(([id,group])=>makeRoomCard(locById(id)||{
id,name:locName(id),kind:"system"}
,group,knot));
return[...eventOnly.map(e=>makeEventTargetCard(e,knot)),...roomCards]}
;

      for(const k of knots){
const src=[],tgt=[];
for(const ev of k.events){
const lane=laneOf(ev),sm=splitMoves(ev);
if(lane==="source"){
const c=makeSourceCard(ev,k);
c.moves=sm.out.length?sm.out:sm.all;
src.push(c)}
else tgt.push(ev);
if(lane==="target"&&sm.out.length)src.push(makeOutboundCard(sm.out,k,ev))}
for(const m of k.standaloneMoves.filter(m=>!isFITarget(m.to)))src.push(makeOutboundCard([m],k));
k.source=src;
k.target=buildTargetCards(tgt,k.standaloneMoves,k);
k.label=fmtRange(k.date,k.endDate);
k.estimated=k.events.length>0&&k.events.every(e=>e.estimated);
k.done=k.events.length>0&&k.events.every(e=>e.status==="done")&&k.standaloneMoves.every(m=>m.status==="done");
k.past=isoDay(k.date)<today;
k.isToday=isoDay(k.date)===today;
k.overdue=!k.done&&isoDay(k.endDate||k.date)<today}

      const undatedEvents=events.filter(e=>!e.date).map(ev=>{
const lane=laneOf(ev),sm=splitMoves(ev);
if(lane==="source"){
const c=makeSourceCard(ev,null);
c.moves=sm.out.length?sm.out:sm.all;
return c}
if(!sm.fi.length)return makeEventTargetCard(ev,null);
const c=makeEventTargetCard(ev,null);
c.where=[...new Set(sm.fi.map(m=>m.to))].map(id=>roomShort(locName(id))).join(" · ");
c.meta=sm.fi.map(assetLine).join(" · ");
c.moves=sm.fi;
return c}
);

      const looseMoves=activeMoves.filter(m=>!m.eventId&&!m.date&&m.status!=="done"),isPlaceholder=m=>["OFFEN","BESCHAFFUNG"].includes(m.from),aggMap=new Map();
for(const m of looseMoves.filter(isPlaceholder)){
const a=asset(m.assetId),key=a?.category||"other";
if(!aggMap.has(key))aggMap.set(key,{
category:cat(key)?.name||key,items:[]}
);
aggMap.get(key).items.push({
label:a?.label||m.assetId,to:locName(m.to),from:locName(m.from),note:m.note||a?.note||""}
)}
const undatedAssets={
aggregated:[...aggMap.values()].sort((a,b)=>b.items.length-a.items.length),single:looseMoves.filter(m=>!isPlaceholder(m)).map(m=>({
label:asset(m.assetId)?.label||m.assetId,from:locName(m.from),to:m.to==="OFFEN"?"Ziel offen":locName(m.to),note:m.note||"",responsible:person(m.responsible)}
))}
;

      const heuristic=events.map(ev=>({
id:ev.id,title:ev.title,lane:laneOf(ev),explicit:!!ev.timelineLane}
));
return{
knots,undatedEvents,undatedAssets,todayISO,heuristic,helpers:{
locName,person,asset,cat}
}

    }

    function assignSourceRows(knots){

      const rows=[];
let maxRow=0;

      for(const k of knots){

        for(const card of k.source){

          let row=0;
const x1=k.x-GEO.branchGap-GEO.cardW,x2=x1+GEO.cardW;

          while(true){

            rows[row]=rows[row]||[];

            if(!rows[row].some(([a,b])=>a<x2+GEO.gap&&x1-GEO.gap<b)){

              rows[row].push([x1,x2]);
card.row=row+1;
maxRow=Math.max(maxRow,card.row);
break;

            }

            row++;

          }

        }

      }

      return maxRow;

    }

    // Zielseite bewusst von rechts nach links packen. Ein späterer Termin darf
    // näher an der Achse liegen; frühere Karten weichen nach unten aus, wenn
    // sie den Ast-/Stapelbereich eines späteren Knotens überdecken würden.
    function assignTargetRows(knots){

      const rows=[];
const maxRowAtKnot=new Map();
let maxRow=0;

      for(let i=knots.length-1;
i>=0;
i--){

        const k=knots[i];
let localMax=0;

        for(const card of k.target){

          const x1=k.x+GEO.branchGap,x2=x1+GEO.cardW;
let coveredMax=0;

          for(let j=i+1;
j<knots.length;
j++){

            const covered=knots[j];

            if(covered.x>x2+GEO.gap)break;

            if(covered.x>=x1-GEO.gap)coveredMax=Math.max(coveredMax,maxRowAtKnot.get(covered)||0);

          }

          let row=Math.max(localMax,coveredMax);

          while(true){

            rows[row]=rows[row]||[];

            if(!rows[row].some(([a,b])=>a<x2+GEO.gap&&x1-GEO.gap<b)){

              rows[row].push([x1,x2]);
card.row=row+1;
localMax=card.row;

              maxRowAtKnot.set(k,localMax);
maxRow=Math.max(maxRow,card.row);
break;

            }

            row++;

          }

        }

      }

      return maxRow;

    }

    function layout(model){
const G=GEO,ks=model.knots,breaks=[];
let x=G.x0;
ks.forEach((k,i)=>{
if(i>0){
const days=isoDay(k.date)-isoDay(ks[i-1].date);
let u;
if(days>G.breakDays){
u=Math.max(G.breakU,(G.cardW+G.branchGap+20)/G.unit);
breaks.push({
x:x+u*G.unit/2,days}
)}
else u=Math.min(G.maxU,Math.max(G.minU,days));
x+=u*G.unit}
k.x=x}
);
const srcRows=Math.max(1,assignSourceRows(ks)),tgtRows=Math.max(1,assignTargetRows(ks)),axisY=G.padTop+srcRows*G.pitch+G.corridor,height=axisY+G.corridor+tgtRows*G.pitch+G.padBottom,width=(ks.length?ks.at(-1).x:G.x0)+G.branchGap+G.cardW+G.padRight,cards=[];
for(const k of ks){
for(const c of k.source){
c.x=k.x-G.branchGap-G.cardW;
c.y=axisY-G.corridor-(c.row-1)*G.pitch-G.cardH;
c.mid=c.y+G.cardH/2;
cards.push(c)}
for(const c of k.target){
c.x=k.x+G.branchGap;
c.y=axisY+G.corridor+(c.row-1)*G.pitch;
c.mid=c.y+G.cardH/2;
cards.push(c)}
}
const t=isoDay(model.todayISO);
let todayX=null;
if(ks.length){
const exact=ks.find(k=>isoDay(k.date)===t);
if(exact)todayX=exact.x;
else if(t<isoDay(ks[0].date))todayX=ks[0].x-34;
else if(t>isoDay(ks.at(-1).date))todayX=ks.at(-1).x+34;
else for(let i=1;
i<ks.length;
i++){
const a=isoDay(ks[i-1].date),b=isoDay(ks[i].date);
if(t>a&&t<b){
todayX=ks[i-1].x+(t-a)/(b-a)*(ks[i].x-ks[i-1].x);
break}
}
}
return{
width,height,axisY,srcRows,tgtRows,breaks,todayX,cards}
}

    return{
GEO,buildModel,layout,isoDay,fmtShort,fmtRange,fmtWd,fmtLong}

  }
)();
(typeof window!=="undefined"?window:globalThis).TL=TL;
