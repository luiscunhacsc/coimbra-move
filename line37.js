// Display continuity separately from timetable/vehicle continuity.
export function reference37(data) {
  const trips = data.trips.filter(t => data.routes[t[0]][0] === '37' && data.routes[t[0]][2] === 'SMTUC');
  const patterns = new Map();
  for (const trip of trips) {
    const calls = trip[3];
    if (data.stops[calls[0][0]][0] !== 'Rua Paulo Quintela (Vale das Flores)') continue;
    const end = calls.at(-1)[0];
    const onward = trips.find(t => t[3][0][0] === end && t[3].some(c => data.stops[c[0]][0] === 'Armando Gonçalves'));
    if (!onward) continue;
    const destination = onward[3].findIndex(c => data.stops[c[0]][0] === 'Armando Gonçalves');
    const stops = [...calls.map(c => c[0]), ...onward[3].slice(1, destination + 1).map(c => c[0])];
    const key = JSON.stringify(stops);
    if (!patterns.has(key)) patterns.set(key, {stops, trips: []});
    patterns.get(key).trips.push(trip);
  }
  return [...patterns.values()];
}

export function referenceDepartures(data, pattern, date) {
  const source = data.sources.find(s => s.operator === 'SMTUC');
  if (!source || date < source.from || date > source.to) return null;
  return [...new Set(pattern.trips.filter(t => t[1].some(s => data.services[s].includes(date)))
    .filter(t => t[3][0][3]).map(t => t[3][0][2]))].sort((a,b) => a-b);
}
