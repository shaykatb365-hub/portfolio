// Page-view analytics with GoatCounter (free, no cookies, no consent banner needed).
// Dashboard: https://shaykat.goatcounter.com
//
// Setup: put your GoatCounter site code below (the part before .goatcounter.com).
// Until it is set, this file does nothing.
//
// Respects the same "don't count me" switch as track.js: open the site once with
// ?notrack=1 in each browser you use (?notrack=0 to undo). Local copies are not counted.
(function(){
  const GOATCOUNTER_CODE='shaykat';

  if(!GOATCOUNTER_CODE||GOATCOUNTER_CODE==='YOUR-GOATCOUNTER-CODE')return;
  if(/^(localhost|127\.)/.test(location.hostname)||location.protocol==='file:')return;
  if(/^deploy-preview-|--/.test(location.hostname))return; // Netlify previews
  const nt=new URLSearchParams(location.search).get('notrack');
  try{if(nt==='1'||(nt!=='0'&&localStorage.getItem('pf_notrack')==='1'))return}catch(e){}

  const s=document.createElement('script');
  s.async=true;
  s.src='https://gc.zgo.at/count.js';
  s.dataset.goatcounter='https://'+GOATCOUNTER_CODE+'.goatcounter.com/count';
  document.head.appendChild(s);
})();
