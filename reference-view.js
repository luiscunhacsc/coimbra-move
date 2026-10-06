import {reference37,referenceJourneys} from './line37.js';

export function mountReference({data,box,date:initialDate,now,time,showMap,star}) {
 let direction='outbound',patterns=[],selectedTrip=null;
 box.innerHTML=`<p class="eyebrow">A TUA LINHA DO DIA A DIA</p><h2 id="routeTitle"></h2>
 <div class="direction-switch" aria-label="Sentido"><button id="outbound">Vale das Flores → Armando</button><button id="return">Armando → Vale das Flores</button></div>
 <div class="row"><div class="field"><label for="referenceDate">DIA DA VIAGEM</label><input type="date" id="referenceDate"></div><div class="field"><label for="referenceVariant">PERCURSO</label><select id="referenceVariant"></select></div></div>
 <div class="chips"><button id="today">Hoje</button><button id="tomorrow">Amanhã</button></div>
 <p id="routeNotice" class="notice"></p><div id="schedule" aria-live="polite"></div>
 <h3>Paragens do percurso</h3><p class="small">Seleciona uma partida para consultar as horas de passagem. Toca numa paragem para abrir o mapa.</p><ol class="line-stops" id="routeStops"></ol>`;
 const $=id=>box.querySelector('#'+id),date=$('referenceDate'),variant=$('referenceVariant');date.value=initialDate;
 function stops(){
  const list=$('routeStops');list.replaceChildren();const pattern=patterns[Number(variant.value)];if(!pattern)return;
  pattern.stops.forEach((id,index)=>{const li=document.createElement('li'),row=document.createElement('div');row.className='route-stop';
   const button=document.createElement('button');button.textContent=data.stops[id][0].replace('Rua Paulo Quintela (Vale das Flores)','Vale das Flores');button.onclick=()=>showMap(id);
   const clock=document.createElement('span');clock.className='stop-time';const call=selectedTrip?.[3][index];clock.textContent=call&&call[0]===id?time(index===selectedTrip[3].length-1?call[1]:call[2]):'—';
   row.append(clock,button,star(id));li.append(row);list.append(li);
  });
 }
 function schedule(){
  selectedTrip=null;const target=$('schedule');target.replaceChildren();const pattern=patterns[Number(variant.value)];
  if(!pattern){target.textContent='Não há percursos disponíveis nos dados carregados.';stops();return}
  const trips=date.value?referenceJourneys(data,pattern,date.value):null;
  if(!trips?.length){target.textContent=!date.value?'Escolhe uma data.':trips===null?'Não há horários válidos para esta data.':'Sem partidas para esta variante neste dia. Experimenta outro percurso ou data.';stops();return}
  const current=now(),seconds=current.time.split(':').reduce((a,n)=>a*60+Number(n),0)*60;
  const upcoming=trips.find(t=>date.value>current.date||(date.value===current.date&&t[3][0][2]>=seconds));
  const summary=document.createElement('div');summary.className='next-departure';
  const caption=document.createElement('span');caption.textContent=upcoming?'Próxima partida programada':'Partidas do dia';const value=document.createElement('strong');value.textContent=upcoming?time(upcoming[3][0][2]):`${trips.length} viagens`;summary.append(caption,value);target.append(summary);
  const heading=document.createElement('h3');heading.textContent=direction==='outbound'?'Vale das Flores → HUC':'Armando Gonçalves → Vale das Flores';target.append(heading);
  const grid=document.createElement('div');grid.className='timetable';target.append(grid);
  trips.forEach(t=>{const b=document.createElement('button');b.textContent=time(t[3][0][2]);b.setAttribute('aria-label',`Partida às ${time(t[3][0][2])}`);b.setAttribute('aria-pressed','false');b.onclick=()=>{selectedTrip=t;grid.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stops()};grid.append(b)});
  const selected=upcoming||trips[0];grid.children[trips.indexOf(selected)].click();
 }
 function setDirection(value){
  direction=value;patterns=reference37(data,direction);variant.replaceChildren();
  $('routeTitle').textContent=direction==='outbound'?'37 · Vale das Flores → Armando Gonçalves':'37 · Armando Gonçalves → Vale das Flores';
  for(const key of ['outbound','return'])$(key).setAttribute('aria-pressed',String(key===direction));
  $('routeNotice').textContent=direction==='outbound'?'Via HUC. As horas disponíveis terminam nos HUC: a continuação até Armando Gonçalves está representada no percurso, mas a fonte não confirma o mesmo veículo nem a hora de chegada.':'Regresso pela Cruz de Celas, Solum e Norton de Matos. Horários programados para este sentido; o percurso é diferente da ida.';
  patterns.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${direction==='return'?'Via Solum':p.stops.some(s=>data.stops[s][0]==='I.P.O.')?'Via IPO':'Via HUC'} · ${p.stops.length} paragens`;variant.append(o)});schedule();
 }
 $('outbound').onclick=()=>setDirection('outbound');$('return').onclick=()=>setDirection('return');date.onchange=schedule;variant.onchange=schedule;
 $('today').onclick=()=>{date.value=now().date;schedule()};$('tomorrow').onclick=()=>{const d=new Date(now().date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);date.value=d.toISOString().slice(0,10);schedule()};
 setDirection(direction);
}
