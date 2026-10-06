"""AGIT NeTEx profile -> small browser dataset. Python standard library only."""
import argparse, collections, datetime as dt, hashlib, io, json, pathlib, urllib.request, zipfile
import xml.etree.ElementTree as ET
NS={'n':'http://www.netex.org.uk/netex'}
BASE=pathlib.Path(__file__).resolve().parents[1]
def text(e,p,default=''):
 return e.findtext(p,default,NS)
def ref(e,p):
 n=e.find(p,NS)
 if n is None: raise ValueError('Missing reference: '+p)
 return n.attrib['ref']
def clock(e,kind):
 s=text(e,'n:'+kind+'Time')
 if not s: raise ValueError('Missing time')
 h,m,sec=map(int,s.split(':'));return h*3600+m*60+sec+int(text(e,'n:'+kind+'DayOffset','0'))*86400

def parse(xml,operator,out):
 root=ET.fromstring(xml); elements=lambda tag:root.findall('.//n:'+tag,NS)
 stops={};routes={};services={}
 for s in elements('ScheduledStopPoint'):
  i=len(out['stops']);stops[s.attrib['id']]=i
  lat=float(text(s,'n:Location/n:Latitude'));lon=float(text(s,'n:Location/n:Longitude'))
  if not (39<lat<42 and -10<lon<-6):raise ValueError('Unexpected coordinates')
  out['stops'].append([text(s,'n:Name'),lat,lon,operator,text(s,'n:PublicCode')])
 for l in elements('Line'):
  routes[l.attrib['id']]=len(out['routes']);out['routes'].append([text(l,'n:ShortName') or text(l,'n:Name'),text(l,'n:Name'),operator])
 periods={}
 for p in elements('UicOperatingPeriod'):
  start=dt.date.fromisoformat(text(p,'n:FromDate')[:10]);end=dt.date.fromisoformat(text(p,'n:ToDate')[:10]);bits=text(p,'n:ValidDayBits')
  if len(bits)!=(end-start).days+1 or set(bits)-{'0','1'}:raise ValueError('Invalid calendar bitset')
  periods[p.attrib['id']]={(start+dt.timedelta(days=i)).isoformat() for i,b in enumerate(bits) if b=='1'}
 days=collections.defaultdict(set)
 for a in elements('DayTypeAssignment'):
  d=ref(a,'n:DayTypeRef');day=text(a,'n:Date');p=a.find('n:OperatingPeriodRef',NS)
  dates={day[:10]} if day else periods[p.attrib['ref']] if p is not None else None
  if dates is None:raise ValueError('Unsupported calendar assignment')
  if text(a,'n:isAvailable','true')=='true':days[d].update(dates)
  else:days[d].difference_update(dates)
 for d,dates in days.items():
  services[d]=len(out['services']);out['services'].append(sorted(dates))
 rr={r.attrib['id']:routes[ref(r,'n:LineRef')] for r in elements('Route')}
 patterns={p.attrib['id']:rr[ref(p,'n:RouteRef')] for p in elements('ServiceJourneyPattern')}
 points={p.attrib['id']:(stops[ref(p,'n:ScheduledStopPointRef')],text(p,'n:ForBoarding','true')=='true',text(p,'n:ForAlighting','true')=='true') for p in elements('StopPointInJourneyPattern')}
 for t in elements('ServiceJourney'):
  calls=[]
  for p in t.findall('n:passingTimes/n:TimetabledPassingTime',NS):
   stop,board,alight=points[ref(p,'n:StopPointInJourneyPatternRef')];a=clock(p,'Arrival');d=clock(p,'Departure')
   if d<a or (calls and a<calls[-1][2]):raise ValueError('Non-monotonic journey')
   calls.append([stop,a,d,int(board),int(alight)])
  if len(calls)<2:raise ValueError('Journey has fewer than two stops')
  out['trips'].append([patterns[ref(t,'n:ServiceJourneyPatternRef')],[services[x.attrib['ref']] for x in t.findall('n:dayTypes/n:DayTypeRef',NS)],text(t,'n:Name'),calls])
 all_dates=sorted(set().union(*days.values()))
 if not all_dates:raise ValueError('Empty calendar')
 return {'operator':operator,'from':all_dates[0],'to':all_dates[-1],'stops':len(stops),'trips':len(elements('ServiceJourney')),'sha256':hashlib.sha256(xml).hexdigest()}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--local',help='Directory with smtuc.xml and metro-mondego.xml');args=ap.parse_args()
 out={'schema':1,'updated':dt.datetime.now(dt.timezone.utc).isoformat(),'timezone':'Europe/Lisbon','stops':[],'routes':[],'services':[],'trips':[],'sources':[]}
 for slug,name in [('smtuc','SMTUC'),('metro-mondego','Metro Mondego')]:
  url=f'https://api.planner.agit.pt/v1/datasets/{slug}/distributions/netex/download'
  if args.local:xml=(pathlib.Path(args.local)/(slug+'.xml')).read_bytes()
  else:
   req=urllib.request.Request(url,headers={'User-Agent':'CoimbraMove/1.0 (daily open-data import)'})
   with urllib.request.urlopen(req,timeout=90) as r:blob=r.read(50*1024*1024)
   xml=zipfile.ZipFile(io.BytesIO(blob)).read('netex.xml')
  info=parse(xml,name,out);info.update(url=url,license='CC BY 4.0',publisher='AGIT');out['sources'].append(info)
 today=dt.date.today().isoformat()
 for s in out['sources']:
  if s['to']<today:raise ValueError('Expired source: '+s['operator'])
 dest=BASE/'data/network.json';dest.parent.mkdir(exist_ok=True)
 temp=dest.with_suffix('.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf-8');temp.replace(dest)
 print(json.dumps({'sources':out['sources'],'bytes':dest.stat().st_size},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
