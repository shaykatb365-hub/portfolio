// Contact form: submitted to Netlify Forms (saved in the Netlify dashboard and
// emailed to you if notifications are on). Sent in the background so the visitor
// stays on the page; falls back to a normal form post if JavaScript fails.
(function(){
  const form=document.getElementById('contactForm');if(!form)return;
  const status=document.getElementById('contactStatus'),btn=document.getElementById('contactSend'),ref=document.getElementById('contactRef');
  if(ref&&window.pfRef)ref.value=window.pfRef;
  if(new URLSearchParams(location.search).get('sent')==='1'&&status){status.textContent='Thanks! Your message is on its way.';status.className='contact-form-status ok'}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity())return;
    btn.disabled=true;status.className='contact-form-status';status.textContent='Sending…';
    try{
      const res=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});
      if(!res.ok)throw new Error(res.status);
      form.reset();if(ref&&window.pfRef)ref.value=window.pfRef;
      status.textContent='Thanks! Your message is on its way. I’ll get back to you soon.';status.className='contact-form-status ok';
      if(window.pfTrack)window.pfTrack('contact_sent');
    }catch(err){
      status.innerHTML='Sorry, that didn’t go through. Please email <a href="mailto:shaikatb365@gmail.com">shaikatb365@gmail.com</a>.';status.className='contact-form-status err';
    }finally{btn.disabled=false}
  });
})();
