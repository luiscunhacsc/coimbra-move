/* Seconds in local service-day time, including >24h trips. No timezone conversion. */
export function shiftDate(date,offset){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10)}
export function activeTrips(data,date,operator='all'){
 const rows=[];
 for(const offset of [-1,0,1]){
  const day=shiftDate(date,offset),active=new Set(data.services.map((s,i)=>s.includes(day)?i:-1));
  data.trips.forEach((trip,id)=>{if(trip[1].some(s=>active.has(s))&&(operator==='all'||data.routes[trip[0]][2]===operator))rows.push({trip,id:id+':'+offset,offset:offset*86400})});
 }
 return rows;
}
export function departures(data,stop,date,start,operator='all'){
 const result=[];
 for(const x of activeTrips(data,date,operator))x.trip[3].forEach((c,i)=>{const t=c[2]+x.offset;if(c[0]===stop&&c[3]&&i<x.trip[3].length-1&&t>=start&&t<=start+4*3600)result.push({time:t,route:x.trip[0],head:x.trip[2],end:x.trip[3].at(-1)[0]})});
 return result.sort((a,b)=>a.time-b.time).slice(0,16);
}
/* Round-based earliest arrival. Each round boards one vehicle; transfers require
   5 minutes at the identical stop ID. The best path for each boarding count is
   returned. Deliberately no inferred walking edges or inaccessible-stop claims. */
export function plan(data,from,to,date,start,maxTransfers=1,operator='all'){
 const journeys=activeTrips(data,date,operator),N=data.stops.length;let previous=Array(N).fill(null);previous[from]={time:start,path:[]};const answers=[];
 for(let round=0;round<=maxTransfers;round++){
  const next=Array(N).fill(null);
  for(const x of journeys){let boarding=null;
   for(const c of x.trip[3]){
    const arrive=c[1]+x.offset,depart=c[2]+x.offset;
    if(boarding&&c[4]&&arrive<=start+4*3600){
     const candidate={time:arrive,path:[...boarding.path,{route:x.trip[0],head:x.trip[2],from:boarding.stop,to:c[0],departure:boarding.time,arrival:arrive,trip:x.id}]};
     if(!next[c[0]]||candidate.time<next[c[0]].time)next[c[0]]=candidate;
    }
    const p=previous[c[0]],margin=round===0?0:300;
    if(c[3]&&p&&depart>=p.time+margin&&depart>=start&&depart<=start+4*3600&&!boarding)boarding={stop:c[0],time:depart,path:p.path};
   }
  }
  if(next[to])answers.push(next[to]);previous=next;
 }
 return answers.filter((a,i)=>!answers.some((b,j)=>j<i&&b.time<=a.time)).sort((a,b)=>a.time-b.time);
}
