const projects=[
{id:'omaf',title:'OMAF Water ERP',cat:'uiux',meta:'2022–2025 · Live product',desc:'End-to-end product design for a live manufacturing ERP — field research, workflow architecture, UI system, developer handoff and staff training across a language barrier.',tags:['Product Design','Field Research','Live ERP','20+ Daily Users'],img:'thumbs/omaf.jpg',url:'https://www.behance.net/gallery/248620209/OMAF-Water-Digitizing-a-Manufacturing-Plant'},
{id:'hoomanely',title:'Hoomanely — Activation & Community',cat:'uiux',meta:'2026 · UX/UI Case Study',desc:'Redesigning activation and community for a proactive pet-health platform. Two problems, four hypotheses, five high-fidelity screens and three real-user test sessions.',tags:['Activation','Community UX','Product Thinking','Usability Testing'],img:'thumbs/hoomanely-video-cover.jpg',video:'assets/hoomanely-case-study.mp4',poster:'thumbs/hoomanely-video-cover.jpg',url:'https://www.behance.net/gallery/256765221/Hoomanely-Redesigning-Activation-Community',slides:Array.from({length:19},(_,i)=>`assets/hoomanely-slides/slide-${String(i+1).padStart(2,'0')}.jpg`)},
{id:'sahi',title:'Sahi',cat:'uiux',meta:'2026 · Self-initiated concept',desc:'A verified, anonymous school-review platform — product architecture, identity verification, trust logic, complaint lifecycle and 20 screens.',tags:['Product Strategy','Trust Architecture','PWA','20 Screens'],img:'thumbs/sahi.jpg',url:'https://www.behance.net/gallery/250418159/Sahi-Indias-First-Verified-School-Reviews'},
{id:'smart',title:'Smart Food Safe',cat:'uiux',meta:'2026 · Product design case study',desc:'A supplier food-safety query portal with a complete workflow, four key screens and six reusable component systems, delivered end-to-end in seven days.',tags:['SaaS UI/UX','Workflow Design','Design System'],img:'thumbs/smartfood.jpg',url:'https://www.behance.net/gallery/249878423/FOOD-SAFETY-COMPLIANCE-MODULE-CASE-STUDY'},
{id:'serene',title:'Serene Wellness',cat:'uiux',meta:'2025 · Personal',desc:'A UI/UX redesign exploration — decluttering a wellness app, elevating cycle tracking and building a streamlined onboarding flow.',tags:['UI/UX','Information Architecture','Design System'],img:'thumbs/serene.jpg',url:'https://www.behance.net/gallery/247893911/Serene-Wellness-UIUX-Design'},
{id:'upsilon',title:'Upsilon Estate Bali',cat:'brand',meta:'2024 · Bali',desc:'A timeless luxury identity rooted in Balinese heritage — built around a refined visual system across touchpoints.',tags:['Brand Identity','Luxury','Stationery','Signage'],img:'thumbs/upsilon.jpg',url:'https://www.behance.net/gallery/246943467/Upsilon-Estate-Bali-%28Logo-and-Brand-design%29'},
{id:'tfs',title:'Time For Salad',cat:'brand',meta:'2019 · Brooklyn, NY',desc:'Brand identity, sub-brand architecture, packaging, and environmental signage for a healthy salad and cold-pressed juicery in Brooklyn.',tags:['Brand Identity','Sub-brand Architecture','Signage','Packaging'],img:'thumbs/tfs.jpg',url:'https://www.behance.net/gallery/247084967/Time-for-Salad-Flagship-Brand-Identity',also:['packaging']},
{id:'forus',title:'Forus Logistics',cat:'brand',meta:'2024 · Germany',desc:'A kinetic identity system engineered for motion — built for a global transportation brand operating across Europe.',tags:['Brand Identity','Logo System','Vehicle Livery'],img:'thumbs/forus.jpg',url:'https://www.behance.net/gallery/247009971/Forus-Logistics-Branding'},
{id:'byfn',title:'B.Y.F.N.',cat:'brand',meta:'2022 · Uzbekistan',desc:'Brand identity and stationery system for an education centre in Uzbekistan — logo, colour system, business collateral and marketing materials.',tags:['Brand Identity','Stationery','Freelance'],img:'thumbs/byfn.jpg',url:'https://www.behance.net/gallery/190937383/BYFN-LOGO-BRANDING'},
{id:'prism',title:'Prism Pop',cat:'packaging',meta:'2025 · Packaging',desc:'Brand identity and structural packaging design for a children’s magnetic tile toy — from dieline engineering to retail-ready shelf presence across multiple SKU variants.',tags:['Structural Packaging','Dieline Engineering','Retail'],img:'thumbs/prism-pop.jpg',url:'https://www.behance.net/gallery/248883893/Prism-Pop-From-Dieline-to-Shelf'},
{id:'vixii',title:'VIXII Pop-Up — Email & Invite Design',cat:'social',meta:'2026 · United Kingdom',desc:'Email marketing and digital invite design for VIXII Rooms — a pop-up in Marylebone, London.',tags:['Email Design','E-Invite','Event Marketing','VIXII'],img:'thumbs/vixii-popup.png',url:'email-design-vixii-popup.html'},
{id:'memeraki',title:'Art in Context',cat:'social',meta:'2026 · Design exercise',desc:'A curatorial design exercise for MeMeraki — placing Indian folk and craft artworks into three fully realised interior aesthetics.',tags:['Art Curation','Interior Context','MeMeraki'],img:'thumbs/memeraki.jpg',url:'https://www.behance.net/gallery/250018659/Art-in-Context-MeMeraki-Design-Assignment'}
];
const cats=[['uiux','UI / UX','Interfaces, apps & experiences','thumbs/sahi.jpg'],['brand','Brand Identity','Identity systems & visual worlds','thumbs/upsilon.jpg'],['packaging','Packaging','Physical design & print','thumbs/prism-pop.jpg'],['social','Social & Marketing','Campaigns, email & digital content','thumbs/memeraki.jpg']];
const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
const nav=$('#siteNav'), take=$('#takeSeat'), char=$('#characterLayer'), chair=$('#chairLayer'), stage=$('.hero-stage'), bubble=$('#speechBubble');
let introTriggered=false;
// The chair/character videos are native 1920x1080 and sit inside .hero-stage via
// object-fit:contain, so they letterbox differently depending on the stage's own
// aspect ratio at any given viewport size. A fixed left/top % only lines up at one
// specific window size. Instead we compute where a point actually renders inside
// that letterboxed video box, every time, from its known position in the native
// 1920x1080 frame (measured directly off the source video frames).
const VIDEO_ASPECT=1920/1080, SEAT_FX=0.635, SEAT_FY=0.705, HEAD_FX=0.4167, HEAD_FY=0.13;
// The WebM layers carry a thin ragged noise band down their left edge (roughly the
// first 56 of 1920 native columns). Under mix-blend-mode:screen that band shows as a
// faint vertical line. It is trimmed with clip-path rather than by re-encoding the
// videos: these are VP9-with-alpha files, ffmpeg cannot decode that alpha channel, so
// any re-encode silently flattens the transparency and turns the whole video box into
// an opaque black rectangle against the page. The trim is computed from the same
// letterboxed rect as the overlays, so it tracks the video at every viewport size.
const TRIM_FX=56/1920;
// Trimming is delayed: for the first ~0.8s the character walks in from the left and
// his foot genuinely occupies those columns, so an immediate trim would clip his shoe.
let edgeTrimmed=false;
function anchorPx(fx,fy){
  const w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return null;
  let renderW,renderH,offX,offY;
  if(w/h>VIDEO_ASPECT){renderH=h;renderW=h*VIDEO_ASPECT;offX=(w-renderW)/2;offY=0}
  else{renderW=w;renderH=w/VIDEO_ASPECT;offX=0;offY=(h-renderH)/2}
  return{x:offX+fx*renderW,y:offY+fy*renderH}
}
function positionOverlays(){
  if(!stage)return;
  const seat=anchorPx(SEAT_FX,SEAT_FY);
  if(seat&&take){take.style.left=seat.x+'px';take.style.top=seat.y+'px'}
  const head=anchorPx(HEAD_FX,HEAD_FY);
  if(head&&bubble){bubble.style.left=head.x+'px';bubble.style.top=head.y+'px'}
  applyEdgeTrim();
}
function applyEdgeTrim(){
  if(!edgeTrimmed||!stage)return;
  const edge=anchorPx(TRIM_FX,0);
  if(!edge)return;
  const inset=`inset(0 0 0 ${edge.x}px)`;
  [char,chair].forEach(v=>{if(v)v.style.clipPath=inset});
}
function trimEdges(){edgeTrimmed=true;applyEdgeTrim()}
let seatRT;
window.addEventListener('resize',()=>{clearTimeout(seatRT);seatRT=setTimeout(positionOverlays,80)});
positionOverlays();
function playHero(){positionOverlays();edgeTrimmed=false;[char,chair].forEach(v=>{if(v)v.style.clipPath='none'});[char,chair].forEach(v=>{try{v.currentTime=0;v.play().catch(()=>{})}catch(e){}});setTimeout(trimEdges,800);setTimeout(()=>{take.classList.add('show');if(bubble)bubble.classList.add('show')},4900)}
window.addEventListener('load',playHero);
// Scrolling is natural: never hijack the visitor's scroll position or jump to About.
// Reveal navigation once the visitor starts moving; the hero CTA remains the explicit
// route to projects/categories.
take.onclick=()=>{nav.classList.add('visible');openCategories(true)};
$('#exploreButton').onclick=()=>{nav.classList.add('visible');$('#about').scrollIntoView({behavior:'smooth'})};
window.addEventListener('scroll',()=>{if(scrollY>45)nav.classList.add('visible')},{passive:true});
const overlay=$('#categoryOverlay');function openCategories(forceDefault=false){if(forceDefault){activeCat=DEFAULT_CAT;renderProjects(DEFAULT_CAT)}overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('lock');renderCats()};function closeCategories(){overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('lock')}
function renderCats(){const list=$('#categoryList');list.innerHTML=cats.map(c=>`<button class="category-option${c[0]===activeCat?' active':''}" data-cat="${c[0]}" aria-current="${c[0]===activeCat}"><span><strong>${c[1]}</strong><small>${c[2]}</small></span></button>`).join('');$$('.category-option').forEach(b=>b.onclick=()=>{introTriggered=true;scrollLock=true;closeCategories();renderProjects(b.dataset.cat);$('#work').scrollIntoView({behavior:'smooth'});setTimeout(()=>scrollLock=false,1200)})}
$('#filterTrigger').onclick=openCategories;$('#categoryClose').onclick=closeCategories;$('.overlay-backdrop').onclick=closeCategories;
// Counts are derived from the projects array (incl. `also` cross-listings) so the
// labels can never drift out of sync with the actual project list.
function countFor(cat){return projects.filter(p=>p.cat===cat||(p.also||[]).includes(cat)).length}
// Persistent category switcher above the project grid: stays visible after a
// category is chosen so a visitor can switch without reopening the picker.
function renderCatBar(active){
  const bar=$('#catBar');if(!bar)return;
  bar.innerHTML=cats.map(c=>`<button class="cat-tab${c[0]===active?' active':''}" role="tab" aria-selected="${c[0]===active}" data-cat="${c[0]}"><img src="${c[3]}" alt="" loading="lazy"><span class="cat-tab-overlay"><span class="cat-tab-name">${c[1]}</span><span class="cat-tab-count">${countFor(c[0])} projects</span></span><span class="cat-tab-dot"></span></button>`).join('');
  $$('.cat-tab').forEach(b=>b.onclick=()=>renderProjects(b.dataset.cat));
}
// UI/UX is the default discipline: the work section opens on it whether the visitor
// clicks SEE PROJECTS or just scrolls past the hero, and the popup picker shows it
// pre-highlighted. activeCat always mirrors what's currently on screen, so reopening
// the picker highlights whatever the visitor last chose.
const DEFAULT_CAT='uiux';
let activeCat=DEFAULT_CAT;
function renderProjects(cat=DEFAULT_CAT){activeCat=cat;const list=cat==='all'?projects:projects.filter(p=>p.cat===cat || (p.also||[]).includes(cat));$('#projectGrid').innerHTML=list.map(p=>`<article class="project-card project-${p.id}" data-id="${p.id}"><div class="project-image"><img src="${p.img}" alt="${p.title}" loading="lazy"></div><div class="project-info"><div class="project-top"><h3 class="project-title">${p.title}</h3></div><div class="project-meta">${p.meta}</div><p class="project-desc">${p.desc}</p><div class="project-tags">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div></div></article>`).join('');$$('.project-card').forEach(c=>c.onclick=()=>{const p=projects.find(x=>x.id===c.dataset.id);if(!p)return;openCase(p.id)});renderCatBar(cat)}
renderProjects();
const caseOverlay=$('#caseOverlay');let activeCaseId=null;function projectUrl(id){const u=new URL(window.location.href);u.searchParams.set('project',id);return u.href}function openCase(id,options={}){const p=projects.find(x=>x.id===id);if(!p)return;activeCaseId=id;if(options.updateUrl!==false&&new URL(window.location.href).searchParams.get('project')!==id){const u=new URL(window.location.href);u.searchParams.set('project',id);history.pushState({project:id},'',u)}const shareLabel=$('#caseShareLabel');if(shareLabel)shareLabel.textContent='Share';$('#caseKicker').textContent=p.meta;$('#caseTitle').textContent=p.title;$('#caseIntro').innerHTML=`<p>${p.desc}</p>${p.id==='hoomanely'?`<p class="case-context-note">Independent redesign exploration · Proposed solutions and target metrics, not shipped product results.</p>`:''}`;if(p.slides){$('#caseMedia').innerHTML=`${p.video?`<section class="case-video-section"><div class="case-video-heading"><div><p class="eyebrow">WATCH THE WALKTHROUGH</p><h3>Hoomanely, in 90 seconds.</h3><p>A guided overview of the problem framing, design decisions and proposed experience.</p></div><a href="${p.url}" target="_blank" rel="noopener noreferrer">View on Behance</a></div><div class="case-video-frame"><video controls playsinline preload="metadata" poster="${p.poster}"><source src="${p.video}" type="video/mp4">Your browser does not support embedded video. <a href="${p.video}">Watch the video</a>.</video></div></section>`:''}<div class="case-slide-toolbar"><span>FULL CASE STUDY · ${p.slides.length} SLIDES</span><a href="${p.url}" target="_blank" rel="noopener noreferrer">View on Behance</a></div><div class="case-slide-stack">${p.slides.map((src,i)=>`<button class="case-slide" type="button" aria-label="View slide ${i+1} larger"><img src="${src}" alt="Hoomanely case study slide ${i+1} of ${p.slides.length}" loading="${i<3?'eager':'lazy'}"><span>${String(i+1).padStart(2,'0')} / ${String(p.slides.length).padStart(2,'0')}</span></button>`).join('')}</div><div class="case-external case-behance-footer"><h3>Prefer Behance?</h3><p>Open the published presentation in a new tab.</p><a href="${p.url}" target="_blank" rel="noopener noreferrer">View on Behance</a></div>`;$$('.case-slide').forEach(b=>b.onclick=()=>{const img=b.querySelector('img');const lightbox=document.createElement('div');lightbox.className='slide-lightbox';lightbox.innerHTML=`<button type="button" aria-label="Close enlarged slide">×</button><img src="${img.src}" alt="${img.alt}">`;lightbox.onclick=()=>lightbox.remove();document.body.appendChild(lightbox)})}else if(p.url.endsWith('.html')){$('#caseMedia').innerHTML=`<iframe src="${p.url}" title="${p.title} case study"></iframe>`}else{$('#caseMedia').innerHTML=`<div class="case-external"><h3>Continue to the case study</h3><p>The complete presentation for this project lives on Behance.</p><a href="${p.url}" target="_blank" rel="noopener">Open project</a></div>`}caseOverlay.classList.add('open');caseOverlay.setAttribute('aria-hidden','false');document.body.classList.add('lock');$('#caseScroll').scrollTop=0}
function closeCase(options={}){if(options.updateUrl!==false){const u=new URL(window.location.href);if(u.searchParams.has('project')){u.searchParams.delete('project');history.replaceState({},'',u)}}caseOverlay.classList.remove('open');caseOverlay.setAttribute('aria-hidden','true');document.body.classList.remove('lock');$('#caseMedia').innerHTML='';activeCaseId=null;const label=$('#caseShareLabel');if(label)label.textContent='Share'}$('#caseClose').onclick=()=>closeCase();$('.case-backdrop').onclick=()=>closeCase();const caseShare=$('#caseShare');if(caseShare)caseShare.onclick=async()=>{if(!activeCaseId)return;const link=projectUrl(activeCaseId);try{if(navigator.share){await navigator.share({title:projects.find(p=>p.id===activeCaseId)?.title||'Shaykat portfolio',url:link})}else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(link);$('#caseShareLabel').textContent='Link copied'}else{window.prompt('Copy this project link:',link)}}catch(err){if(err&&err.name!=='AbortError'){window.prompt('Copy this project link:',link)}}};window.addEventListener('popstate',()=>{const id=new URL(window.location.href).searchParams.get('project');if(id){openCase(id,{updateUrl:false})}else if(caseOverlay.classList.contains('open'))closeCase({updateUrl:false})});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCase();closeCategories()}});const initialProject=new URL(window.location.href).searchParams.get('project');if(initialProject)openCase(initialProject,{updateUrl:false});

// Resume viewer: open the supplied PDF in a focused overlay with an explicit download action.
const resumeOverlay=$('#resumeOverlay'), resumeFrame=$('#resumeFrame');
function openResume(){
  if(!resumeOverlay)return;
  resumeOverlay.classList.add('open');
  resumeOverlay.setAttribute('aria-hidden','false');
  document.body.classList.add('lock');
  if(resumeFrame)resumeFrame.focus();
}
function closeResume(){
  if(!resumeOverlay)return;
  resumeOverlay.classList.remove('open');
  resumeOverlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('lock');
}
['#resumeTrigger','#resumeTriggerAbout','#resumeTriggerContact'].forEach(sel=>{const el=$(sel);if(el)el.addEventListener('click',openResume)});
if($('#resumeClose'))$('#resumeClose').onclick=closeResume;
if($('.resume-backdrop'))$('.resume-backdrop').onclick=closeResume;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeResume()});

// Experience certificates viewer: same focused overlay as the resume, with a tab per company.
const certsOverlay=$('#certsOverlay'), certsFrame=$('#certsFrame'), certsTitle=$('#certsTitle'), certsDownload=$('#certsDownload');
const certTabs=[...document.querySelectorAll('.cert-tab')];
function showCert(tab){
  if(!tab)return;
  certTabs.forEach(t=>{const on=t===tab;t.classList.toggle('active',on);t.setAttribute('aria-selected',on?'true':'false')});
  const file=tab.dataset.file;
  if(certsTitle)certsTitle.textContent=tab.dataset.company;
  if(certsFrame){certsFrame.src=file+'#toolbar=0&navpanes=0';certsFrame.title=tab.dataset.company+' experience certificate'}
  if(certsDownload)certsDownload.href=file;
}
function openCerts(){
  if(!certsOverlay)return;
  if(certsFrame&&certsFrame.getAttribute('src')==='about:blank')showCert(certTabs.find(t=>t.classList.contains('active'))||certTabs[0]);
  certsOverlay.classList.add('open');
  certsOverlay.setAttribute('aria-hidden','false');
  document.body.classList.add('lock');
}
function closeCerts(){
  if(!certsOverlay)return;
  certsOverlay.classList.remove('open');
  certsOverlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('lock');
}
certTabs.forEach(t=>t.addEventListener('click',()=>showCert(t)));
['#certsTrigger','#certsTriggerAbout','#certsTriggerContact'].forEach(sel=>{const el=$(sel);if(el)el.addEventListener('click',openCerts)});
if($('#certsClose'))$('#certsClose').onclick=closeCerts;
if($('#certsBackdrop'))$('#certsBackdrop').onclick=closeCerts;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&certsOverlay&&certsOverlay.classList.contains('open'))closeCerts()});

// Floating resume + certificates button (speed dial)
(function(){
  const fab=document.getElementById('docFab'),toggle=document.getElementById('docFabToggle'),actions=document.getElementById('docFabActions');
  if(!fab||!toggle||!actions)return;
  const items=[...actions.querySelectorAll('button')];
  function setOpen(on){
    fab.classList.toggle('open',on);
    toggle.setAttribute('aria-expanded',on?'true':'false');
    toggle.setAttribute('aria-label',on?'Close menu':'Open resume and certificates');
    actions.setAttribute('aria-hidden',on?'false':'true');
    items.forEach(b=>b.tabIndex=on?0:-1);
  }
  toggle.addEventListener('click',()=>setOpen(!fab.classList.contains('open')));
  const r=document.getElementById('resumeTriggerFab'),c=document.getElementById('certsTriggerFab');
  if(r)r.addEventListener('click',()=>{setOpen(false);openResume()});
  if(c)c.addEventListener('click',()=>{setOpen(false);openCerts()});
  document.addEventListener('click',e=>{if(fab.classList.contains('open')&&!fab.contains(e.target))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fab.classList.contains('open')){setOpen(false);toggle.focus()}});
})();
