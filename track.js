// Visitor insights: a tiny, cookie-free tracker that reports what visitors do on the
// portfolio (case studies opened and how far they got, resume downloads, outbound
// clicks) to /.netlify/functions/track. No IP addresses or personal data are sent.
//
// Per-application links: share the site as  https://<site>/?ref=company-name
// and every event from that visitor is tagged with that ref (kept for 30 days).
//
// To stop counting your own visits, open the site once with ?notrack=1
// (and ?notrack=0 to turn counting back on) in each browser you use.
(function(){
  const ENDPOINT='/.netlify/functions/track';
  const store={
    get(k){try{return localStorage.getItem(k)}catch(e){return null}},
    set(k,v){try{localStorage.setItem(k,v)}catch(e){}},
    del(k){try{localStorage.removeItem(k)}catch(e){}}
  };
  const url=new URL(location.href);

  const nt=url.searchParams.get('notrack');
  if(nt==='1')store.set('pf_notrack','1');
  if(nt==='0')store.del('pf_notrack');
  if(nt!==null){url.searchParams.delete('notrack');history.replaceState(history.state,'',url)}
  if(store.get('pf_notrack')==='1'||/^(localhost|127\.)/.test(location.hostname)&&!url.searchParams.has('trackdev'))return;

  const clean=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
  const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);

  // Ref: from the URL, else remembered from an earlier visit within 30 days.
  let ref=clean(url.searchParams.get('ref'));
  const DAY=864e5;
  if(ref){store.set('pf_ref',JSON.stringify({ref,at:Date.now()}))}
  else{try{const r=JSON.parse(store.get('pf_ref')||'null');if(r&&Date.now()-r.at<30*DAY)ref=r.ref}catch(e){}}

  let vid=store.get('pf_vid');if(!vid){vid=rid();store.set('pf_vid',vid)}
  const sid=rid();
  const firstVisit=!store.get('pf_seen');store.set('pf_seen','1');

  function send(type,data={}){
    const body=JSON.stringify(Object.assign({type,ref,vid,sid,t:Date.now()},data));
    try{
      if(navigator.sendBeacon&&navigator.sendBeacon(ENDPOINT,new Blob([body],{type:'application/json'})))return;
    }catch(e){}
    try{fetch(ENDPOINT,{method:'POST',body,headers:{'content-type':'application/json'},keepalive:true}).catch(()=>{})}catch(e){}
  }
  window.pfTrack=send;

  // 1. Page view
  let referrer='';
  try{if(document.referrer){const r=new URL(document.referrer);if(r.hostname!==location.hostname)referrer=r.hostname}}catch(e){}
  send('pageview',{referrer,firstVisit,project:url.searchParams.get('project')||'',w:innerWidth});

  // 2. Case studies: open, how far they got, how long they stayed
  const overlay=document.getElementById('caseOverlay');
  const scroller=document.getElementById('caseScroll');
  let current=null;
  function caseId(){try{return typeof activeCaseId!=='undefined'&&activeCaseId?activeCaseId:null}catch(e){return null}}
  function openCurrent(id,silent){
    current={id,start:Date.now(),depth:0,maxSlide:0,slides:0,video:0};
    if(!silent)send('case_open',{project:id});
    // Slides seen (Hoomanely-style decks)
    const slides=[...document.querySelectorAll('#caseMedia .case-slide')];
    current.slides=slides.length;
    if(slides.length&&'IntersectionObserver' in window){
      const c=current;
      c.io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const n=slides.indexOf(e.target)+1;if(n>c.maxSlide)c.maxSlide=n}}),{root:scroller,threshold:.5});
      slides.forEach(s=>c.io.observe(s));
    }
    // Walkthrough video progress
    const v=document.querySelector('#caseMedia video');
    if(v){
      const c=current;
      v.addEventListener('play',()=>{if(!c.video){c.video=1;send('video_play',{project:c.id})}});
      v.addEventListener('timeupdate',()=>{if(v.duration){const p=Math.floor(v.currentTime/v.duration*4)*25;if(p>c.video)c.video=p}});
    }
  }
  function closeCurrent(){
    if(!current)return;
    const c=current;current=null;
    if(c.io)c.io.disconnect();
    send('case_close',{project:c.id,seconds:Math.round((Date.now()-c.start)/1000),depth:c.depth,maxSlide:c.maxSlide,slides:c.slides,video:c.video>1?c.video:(c.video?1:0)});
  }
  if(scroller)scroller.addEventListener('scroll',()=>{
    if(!current)return;
    const max=scroller.scrollHeight-scroller.clientHeight;
    const d=max>0?Math.min(100,Math.round(scroller.scrollTop/max*100)):100;
    if(d>current.depth)current.depth=d;
  },{passive:true});
  if(overlay){
    let wasOpen=overlay.classList.contains('open');
    new MutationObserver(()=>{
      const open=overlay.classList.contains('open');
      const id=caseId();
      if(open&&(!wasOpen||(current&&id&&current.id!==id))){closeCurrent();if(id)setTimeout(()=>openCurrent(id),0)}
      if(!open&&wasOpen)closeCurrent();
      wasOpen=open;
    }).observe(overlay,{attributes:true,attributeFilter:['class']});
    // A shared ?project= link opens the case on load, before this observer existed.
    if(wasOpen&&caseId())openCurrent(caseId());
  }
  // Category browsing
  document.addEventListener('click',e=>{
    const cat=e.target.closest('[data-cat]');
    if(cat)send('category',{detail:cat.dataset.cat});
  },true);

  // 3. Resume, certificates and outbound clicks
  document.addEventListener('click',e=>{
    const el=e.target.closest('a,button');if(!el)return;
    const id=el.id||'';
    const href=el.getAttribute('href')||'';
    const where=current?current.id:'';
    if(/^resumeTrigger/.test(id))return send('resume_open',{detail:id.replace('resumeTrigger','').toLowerCase()||'nav'});
    if(/^certsTrigger/.test(id))return send('certs_open');
    if(el.matches('a[download]')&&/resume/i.test(href))return send('resume_download');
    if(el.matches('a[download]'))return send('cert_download',{detail:href.split('/').pop()});
    if(id==='caseShare')return send('share',{project:where});
    if(/^mailto:/i.test(href))return send('click',{detail:'email',project:where});
    if(/behance\.net/i.test(href))return send('click',{detail:'behance',project:where});
    if(/linkedin\.com/i.test(href))return send('click',{detail:'linkedin',project:where});
    if(/^https?:/i.test(href)){try{const h=new URL(href).hostname;if(h!==location.hostname)send('click',{detail:h,project:where})}catch(_){}}
  },true);

  // 4. Time on site (sent when the tab is hidden or closed)
  const started=Date.now();let lastSent=0;
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='hidden'){
      // Back on the tab with a case study still open: keep measuring it.
      if(!current&&overlay&&overlay.classList.contains('open')&&caseId())openCurrent(caseId(),true);
      return;
    }
    closeCurrent();
    const s=Math.round((Date.now()-started)/1000);
    if(s-lastSent>=5){lastSent=s;send('leave',{seconds:s})}
  });

  // Expose the ref so the contact form can attach it to inquiries.
  window.pfRef=ref;
})();
