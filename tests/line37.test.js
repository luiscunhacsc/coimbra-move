import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reference37,referenceDepartures} from '../line37.js';

const data=JSON.parse(readFileSync(new URL('../data/network.json',import.meta.url)));
test('reference reaches Armando through the shared HUC stop without mutating source trips',()=>{
 const before=JSON.stringify(data.trips),patterns=reference37(data);
 assert.ok(patterns.length>0);
 for(const p of patterns){
  assert.equal(data.stops[p.stops[0]][0],'Rua Paulo Quintela (Vale das Flores)');
  assert.equal(data.stops[p.stops.at(-1)][0],'Armando Gonçalves');
  assert.ok(data.stops[p.stops.at(-2)][0].includes('HUC'));
  assert.equal(p.stops.length,p.trips[0][3].length+1);
 }
 assert.equal(JSON.stringify(data.trips),before);
});
test('departures respect service dates, validity and boarding permissions',()=>{
 const d={sources:[{operator:'SMTUC',from:'2026-10-01',to:'2026-10-31'}],services:[['2026-10-06'],['2026-10-07']]};
 const trip=(service,time,board=1)=>[0,[service],'',[[0,time,time,board,1]]];
 const p={trips:[trip(0,36000),trip(0,36000),trip(1,32000),trip(0,37000,0),trip(0,30000)]};
 assert.deepEqual(referenceDepartures(d,p,'2026-10-06'),[30000,36000]);
 assert.deepEqual(referenceDepartures(d,p,'2026-10-08'),[]);
 assert.equal(referenceDepartures(d,p,'2026-11-01'),null);
});
