import{plan,departures}from'./router.js';
import{reference37,referenceDepartures}from'./line37.js';
const $=id=>document.getElementById(id),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let data,selected={from:null,to:null},favorites=[];
try{favorites=JSON.parse(localStorage.getItem('coimbra-favorites')||'[]')}catch{}if(!Array.isArray(favorites))favorites=[];
function lisbon(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`}}
function time(t){const day=Math.floor(t/86400);t=((t%86400)+86400)%86400;return String(Math.floor(t/3600)).padStart(2,'0')+':'+String(Math.floor(t/60)%60).padStart(2,'0')+(day>0?` (+${day} dia)`:'')}
function stamp(d){return d.split('-').reverse().join('/')}
function start(){const [h,m]=$('time').value.split(':').map(Number);return h*3600+m*60}
function key(i){const s=data.stops[i];return s[3]+':'+s[4]+':'+s[1]+':'+s[2]}
function label(i){const s=data.stops[i];return `${s[0]} · ${s[4]} · ${s[3]}`}
function tab(id){document.querySelectorAll('.tabview').forEach(e=>e.hidden=e.id!==id);document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e.dataset.tab===id));if(id==='saved')renderSaved()}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function find(q){if(!data)return[];q=norm(q.trim());return data.stops.map((s,i)=>({s,i})).filter(({s})=>norm(s[0]+' '+s[4]+' '+s[3]).includes(q)).slice(0,30).map(x=>x.i)}
for(const name of ['from','to']){$(name).oninput=()=>{selected[name]=null;const box=$(name+'Options');box.replaceChildren();if($(name).value.length<2)return;for(const i of find($(name).value).slice(0,10)){const b=document.createElement('button');b.type='button';b.textContent=label(i);b.onclick=()=>{selected[name]=i;$(name).value=label(i);box.replaceChildren()};box.append(b)}}}
document.addEventListener('click',e=>{for(const name of ['from','to'])if(!$(name).parentElement.contains(e.target))$(name+'Options').replaceChildren()});
$('swap').onclick=()=>{[selected.from,selected.to]=[selected.to,selected.from];[$('from').value,$('to').value]=[$('to').value,$('from').value]};
const now=lisbon();$('date').value=now.date;$('time').value=now.time;
function showMap(i){const s=data.stops[i],lat=s[1],lon=s[2];$('mapBox').hidden=false;$('mapTitle').textContent=s[0];$('mapLink').href=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;$('map').src=`https://www.openstreetmap.org/export/embed.html?bbox=${lon-.008}%2C${lat-.005}%2C${lon+.008}%2C${lat+.005}&layer=mapnik&marker=${lat}%2C${lon}`}
function star(i){const b=document.createElement('button');b.className='star';const saved=favorites.includes(key(i));b.textContent=saved?'★':'☆';b.setAttribute('aria-label',(saved?'Remover dos':'Adicionar aos')+' favoritos: '+data.stops[i][0]);b.onclick=()=>{const k=key(i);favorites=favorites.includes(k)?favorites.filter(x=>x!==k):[...favorites,k];try{localStorage.setItem('coimbra-favorites',JSON.stringify(favorites))}catch{}renderSaved();renderStops();b.replaceWith(star(i))};return b}
function stopRows(target,ids,dist){target.replaceChildren();if(!ids.length){target.innerHTML='<p class="empty">Nenhuma paragem encontrada.</p>';return}for(const i of ids){const row=document.createElement('div');row.className='stoprow';const b=document.createElement('button');b.innerHTML=escape(data.stops[i][0])+`<small>${escape(data.stops[i][3])} · ${escape(data.stops[i][4])}${dist?' · '+Math.round(dist(i))+' m em linha reta':''}</small>`;b.onclick=()=>showStop(i);row.append(b,star(i));target.append(row)}}
function renderStops(){if(data)stopRows($('stopList'),find($('stopQuery').value||'Coimbra').slice(0,20))}
function renderSaved(){if(!data)return;const ids=data.stops.map((_,i)=>i).filter(i=>favorites.includes(key(i)));stopRows($('savedList'),ids);if(!ids.length)$('savedList').innerHTML='<p class="empty">Guarda uma paragem na estrela ☆ para a encontrares aqui.</p>'}
$('stopQuery').oninput=renderStops;
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{tab('stops');$('stopQuery').value=b.dataset.query;renderStops();$('stopQuery').focus()});
function valid(operator,date){return data.sources.filter(s=>operator==='all'||s.operator===operator).every(s=>date>=s.from&&date<=s.to)}
function showStop(i){const s=data.stops[i],date=$('date').value,hour=start();showMap(i);const rows=departures(data,i,date,hour);$('results').innerHTML=`<div class="resulthead"><div><p class="eyebrow">PRÓXIMAS PARTIDAS PROGRAMADAS</p><h2>${escape(s[0])}</h2><p>${stamp(date)} · após ${time(hour)} · ${escape(s[3])}</p></div></div><div class="notice" id="departures"></div>`;const box=$('departures');if(!valid(s[3],date)){box.textContent='Não há horários válidos para este operador nesta data.';return}box.innerHTML=rows.length?rows.map(x=>`<div class="dep"><strong>${time(x.time)}</strong><span class="line">${escape(data.routes[x.route][0])}</span><p>${escape(x.head||data.stops[x.end][0])}<br><small>Horário programado</small></p></div>`).join(''):'Sem partidas encontradas nas próximas 4 horas.';const actions=document.createElement('div');actions.className='chips';for(const [k,title]of[['from','Partir daqui'],['to','Chegar aqui']]){const b=document.createElement('button');b.textContent=title;b.onclick=()=>{selected[k]=i;$(k).value=label(i);tab('travel')};actions.append(b)}box.append(actions);if(innerWidth<730)$('results').scrollIntoView({behavior:'smooth',block:'start'})}
$('searchForm').onsubmit=async e=>{e.preventDefault();if(!data)return;const {from,to}=selected;if(from===null||to===null){$('results').innerHTML='<div class="notice">Seleciona a origem e o destino nas sugestões de paragens.</div>';return}if(from===to){$('results').innerHTML='<div class="notice">A origem e o destino são a mesma paragem.</div>';return}const date=$('date').value,op=$('operator').value;if(!valid(op,date)){$('results').innerHTML='<div class="notice">A data está fora da validade de um dos operadores selecionados. Consulta as datas abaixo ou escolhe apenas um operador.</div>';return}if(op!=='all'&&[from,to].some(i=>data.stops[i][3]!==op)){$('results').innerHTML='<div class="notice">Seleciona paragens do operador escolhido.</div>';return}$('search').disabled=true;$('results').innerHTML='<div class="notice">A calcular ligações…</div>';await new Promise(r=>setTimeout(r,20));try{const hour=start(),answers=plan(data,from,to,date,hour,Number($('transfers').value),op);$('results').innerHTML=`<div class="resulthead"><div><p class="eyebrow">O TEU PERCURSO</p><h2>${answers.length?'Ligações encontradas':'Sem ligação neste intervalo'}</h2><p>${stamp(date)} · Horário de Lisboa · Sem informação em tempo real</p></div></div>`;if(!answers.length)$('results').innerHTML+='<div class="notice">Não encontrámos uma ligação até 4 horas após a partida, com os transbordos escolhidos. Experimenta outra hora ou paragem. Esta versão não liga paragens diferentes a pé, mesmo quando estão próximas.</div>';for(const ans of answers){const card=document.createElement('article');card.className='journey';const first=ans.path[0],duration=Math.ceil((ans.time-first.departure)/60);card.innerHTML=`<div class="journeytop"><strong>${time(first.departure)} → ${time(ans.time)}</strong><span class="tag">${duration} min · ${ans.path.length===1?'Direto':(ans.path.length-1)+' transbordo(s)'}</span></div>`+ans.path.map((l,j)=>`${j?`<p class="wait">Espera de ${Math.round((l.departure-ans.path[j-1].arrival)/60)} min na mesma paragem</p>`:''}<div class="leg"><span class="line">${escape(data.routes[l.route][0])}</span><small>${escape(data.routes[l.route][2])} · ${escape(l.head)}</small><p><b>${time(l.departure)}</b> ${escape(data.stops[l.from][0])}</p><p><b>${time(l.arrival)}</b> ${escape(data.stops[l.to][0])}</p></div>`).join('');$('results').append(card)}showMap(from);if(innerWidth<730)$('results').scrollIntoView({behavior:'smooth'})}catch(err){$('results').textContent='Não foi possível calcular a ligação. Tenta novamente.';console.error(err)}finally{$('search').disabled=false}};
$('locate').onclick=()=>{if(!data)return;if(!navigator.geolocation){$('stopList').textContent='Geolocalização indisponível neste navegador.';return}$('locate').disabled=true;navigator.geolocation.getCurrentPosition(p=>{const rad=x=>x*Math.PI/180;const distance=i=>{const s=data.stops[i],dl=rad(s[1]-p.coords.latitude),dn=rad(s[2]-p.coords.longitude),a=Math.sin(dl/2)**2+Math.cos(rad(s[1]))*Math.cos(rad(p.coords.latitude))*Math.sin(dn/2)**2;return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))};const ids=data.stops.map((_,i)=>i).sort((a,b)=>distance(a)-distance(b)).slice(0,12);stopRows($('stopList'),ids,distance);$('locate').disabled=false},()=>{$('stopList').textContent='Não foi possível obter a localização. Pesquisa pelo nome da paragem.';$('locate').disabled=false},{timeout:10000,maximumAge:60000})};
async function load(){try{const r=await fetch('./data/network.json');if(!r.ok)throw Error(r.status);data=await r.json();if(data.schema!==1)throw Error('Schema');$('search').disabled=false;$('openReference37').disabled=false;const date=lisbon().date,expired=data.sources.some(s=>s.to<date),age=(Date.now()-Date.parse(data.updated))/86400000;$('status').classList.toggle('warn',expired||age>3);$('status').textContent=(expired?'Atenção: existem horários expirados. ':age>3?'Atenção: dados descarregados há mais de 3 dias. ':'● Horários oficiais carregados. ')+`Sem tempo real · Atualização: ${new Date(data.updated).toLocaleDateString('pt-PT',{timeZone:'Europe/Lisbon'})}`;$('sources').innerHTML=data.sources.map(s=>`<div class="source"><strong>${escape(s.operator)}</strong> · ${s.stops} paragens<small>Calendário global: ${stamp(s.from)}–${stamp(s.to)} · Cada viagem tem os seus dias de circulação.</small><a href="${escape(s.url)}" target="_blank" rel="noopener">Dados AGIT · CC BY 4.0 ↗</a></div>`).join('')+'<p>Sem informação validada de acessibilidade, tarifas ou percursos a pé. As redes incluem os troços exteriores a Coimbra necessários às linhas.</p>';renderStops();renderSaved();renderLines()}catch(err){$('status').classList.add('warn');$('status').textContent='Não foi possível carregar os dados. Abre o site por HTTP/HTTPS e verifica a ligação. Recarrega para tentar novamente.';console.error(err)}}
load();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn);let installEvent;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;$('install').hidden=false});$('install').onclick=async()=>{if(installEvent){await installEvent.prompt();$('install').hidden=true}};

function renderLines(){
 if(!data)return;
 const query=norm($('lineQuery').value.trim()),groups=new Map();
 data.routes.forEach((r,i)=>{const k=r[2]+':'+r[0];if(!groups.has(k))groups.set(k,{number:r[0],operator:r[2],ids:[],names:[]});const g=groups.get(k);g.ids.push(i);g.names.push(r[1])});
 const box=$('lineList');box.replaceChildren();
 if(!query||norm('37 Vale das Flores Armando Gonçalves').includes(query)){const b=document.createElement('button');b.className='primary';b.textContent='37 · Vale das Flores → Armando Gonçalves';b.onclick=showReference37;box.append(b)}
 const matches=[...groups.values()].filter(g=>norm([g.number,g.operator,...g.names].join(' ')).includes(query)).sort((a,b)=>a.number.localeCompare(b.number,'pt',{numeric:true}));
 for(const g of matches){const b=document.createElement('button');b.className='secondary';b.textContent=`${g.number} · ${g.operator} · ${g.names[0]}`;b.onclick=()=>showLine(g);box.append(b)}
 if(!matches.length)box.textContent='Nenhuma linha encontrada.';
}

function showReference37(){
 if(!data)return;
 tab('lines');
 const box=$('results'),patterns=reference37(data);$('mapBox').hidden=true;
 box.innerHTML='<p class="eyebrow">O TEU PERCURSO · LINHA 37</p><h2>Vale das Flores → Armando Gonçalves</h2><p>Via Hospitais da Universidade de Coimbra (HUC).</p>';
 if(!patterns.length){box.innerHTML+='<p class="notice">Este percurso não está disponível nos dados carregados.</p>';return}
 const field=document.createElement('div');field.className='field';
 const label=document.createElement('label');label.htmlFor='referenceVariant';label.textContent='PERCURSO';
 const select=document.createElement('select');select.id='referenceVariant';
 patterns.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=`${p.stops.some(s=>data.stops[s][0]==='I.P.O.')?'Via IPO':'Via HUC'} · ${p.stops.length} paragens`;select.append(o)});
 field.append(label,select);box.append(field);
 const dateLabel=document.createElement('label');dateLabel.htmlFor='referenceDate';dateLabel.textContent='DIA DA VIAGEM';
 const date=document.createElement('input');date.id='referenceDate';date.type='date';date.value=$('date').value||lisbon().date;
 const dateField=document.createElement('div');dateField.className='field';dateField.append(dateLabel,date);box.append(dateField);
 const times=document.createElement('div');times.setAttribute('aria-live','polite');box.append(times);
 const note=document.createElement('p');note.className='small';note.textContent='Percurso de referência via HUC. Os dados separam as viagens nos HUC e não identificam a continuidade do veículo. As horas abaixo são partidas de Vale das Flores para os HUC; não permitem calcular a chegada a Armando Gonçalves nem confirmar quais continuam no mesmo autocarro.';box.append(note);
 const list=document.createElement('ol');list.className='line-stops';box.append(list);
 function render(){
  const pattern=patterns[Number(select.value)],hours=date.value?referenceDepartures(data,pattern,date.value):null;
  times.replaceChildren();const heading=document.createElement('h3');heading.textContent='Partidas de Vale das Flores para os HUC';times.append(heading);
  const p=document.createElement('p');p.textContent=!date.value?'Escolhe uma data.':hours===null?'Sem dados válidos para esta data.':hours.length?hours.map(time).join(' · '):'Sem partidas programadas para este percurso nesta data.';times.append(p);
  list.replaceChildren();for(const i of pattern.stops){const li=document.createElement('li'),b=document.createElement('button');b.textContent=data.stops[i][0]==='Rua Paulo Quintela (Vale das Flores)'?'Vale das Flores':data.stops[i][0];b.onclick=()=>showMap(i);li.append(b);list.append(li)}
 }
 select.onchange=()=>{$('mapBox').hidden=true;render()};date.onchange=render;render();
 if(innerWidth<730)box.scrollIntoView({behavior:'smooth',block:'start'});
}
$('lineQuery').oninput=renderLines;
function showLine(group){
 const patterns=new Map();
 for(const trip of data.trips){if(!group.ids.includes(trip[0]))continue;const stops=trip[3].map(c=>c[0]),key=JSON.stringify(stops);if(!patterns.has(key))patterns.set(key,stops)}
 const variants=[...patterns.values()],box=$('results');box.replaceChildren();$('mapBox').hidden=true;
 const title=document.createElement('h2');title.textContent=`Linha ${group.number} · ${group.operator}`;box.append(title);
 const note=document.createElement('p');note.className='muted';note.textContent='Percursos presentes nos dados carregados. Inclui variantes que podem circular apenas em determinados dias; esta lista não confirma circulação hoje.';box.append(note);
 if(!variants.length){const empty=document.createElement('p');empty.textContent='Sem percursos disponíveis nos dados.';box.append(empty);return}
 const label=document.createElement('label');label.htmlFor='lineVariant';label.textContent='SENTIDO / VARIANTE';
 const select=document.createElement('select');select.id='lineVariant';
 variants.forEach((ids,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${i+1}. ${data.stops[ids[0]][0]} → ${data.stops[ids.at(-1)][0]} · ${ids.length} paragens`;select.append(option)});
 const field=document.createElement('div');field.className='field';field.append(label,select);box.append(field);
 const list=document.createElement('ol');list.className='line-stops';box.append(list);
 const render=()=>{list.replaceChildren();for(const i of variants[Number(select.value)]){const li=document.createElement('li'),b=document.createElement('button');b.textContent=data.stops[i][0];b.onclick=()=>showMap(i);const code=document.createElement('small');code.textContent=`Paragem ${data.stops[i][4]} · Ver no mapa`;li.append(b,code);list.append(li)}};
 select.onchange=()=>{$('mapBox').hidden=true;render()};render();
 if(innerWidth<730)box.scrollIntoView({behavior:'smooth',block:'start'});
}

$('openReference37').onclick=showReference37;
