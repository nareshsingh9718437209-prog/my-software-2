(function(){
  function inPages(){ return /\/pages\//i.test(location.pathname.replace(/\\/g,'/')); }
  function basePath(){ return inPages() ? '' : 'pages/'; }
  function dashUrl(){ return basePath() + 'dashboard.html'; }
  function loginUrl(){ return basePath() + 'login.html'; }

  function sbConfigured(){
    return typeof window.supabase !== 'undefined' &&
      window.DOTERP_SUPABASE_URL && window.DOTERP_SUPABASE_URL.indexOf('YOUR_PROJECT_REF') === -1 &&
      window.DOTERP_SUPABASE_ANON_KEY && window.DOTERP_SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE_ANON_KEY') === -1;
  }
  
  function getClient(){
    if(!window.__doterpSb && sbConfigured()){
      window.__doterpSb = window.supabase.createClient(window.DOTERP_SUPABASE_URL, window.DOTERP_SUPABASE_ANON_KEY);
    }
    return window.__doterpSb || null;
  }

  async function getSession(){
    var sb=getClient(); if(!sb) return null;
    try{ var r=await sb.auth.getSession(); return r && r.data ? r.data.session : null; }catch(e){ return null; }
  }
  async function currentUser(){
    var s=await getSession(); return s && s.user ? s.user : null;
  }
  async function isLoggedIn(){ return !!(await getSession()); }

  function ensureStyles(){
    if(document.getElementById('doterp-login-style')) return;
    var css = ''
      + '.dlogin-overlay{position:fixed;inset:0;background:rgba(12,28,46,.55);backdrop-filter:blur(2px);display:none;align-items:center;justify-content:center;z-index:10000;padding:18px}'
      + '.dlogin-overlay.open{display:flex}'
      + '.dlogin-modal{width:100%;max-width:420px;background:#fff;color:#14243a;border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,.28);overflow:hidden;font-family:\'Plus Jakarta Sans\',system-ui,Segoe UI,Arial,sans-serif}'
      + '.dlogin-head{background:#0f4c81;color:#fff;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}'
      + '.dlogin-head h3{margin:0;font-size:22px;letter-spacing:.5px}'
      + '.dlogin-close{background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1;padding:4px 8px;border-radius:6px}'
      + '.dlogin-body{padding:20px}'
      + '.dlogin-field{margin-bottom:14px}'
      + '.dlogin-field label{display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#334155}'
      + '.dlogin-field input[type=text],.dlogin-field input[type=password],.dlogin-field input[type=email]{width:100%;padding:11px 12px;border:1px solid #c9d8e8;border-radius:8px;font:inherit;outline:none}'
      + '.dlogin-field input:focus{border-color:#0f6fb8;box-shadow:0 0 0 3px rgba(15,111,184,.12)}'
      + '.dlogin-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 14px;font-size:13px}'
      + '.dlogin-row label{display:flex;align-items:center;gap:8px;cursor:pointer;color:#334155}'
      + '.dlogin-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}'
      + '.dlogin-btn{appearance:none;border:0;border-radius:8px;padding:11px 14px;font:inherit;font-weight:700;cursor:pointer}'
      + '.dlogin-btn.primary{background:#f59e0b;color:#2a1a00}'
      + '.dlogin-btn.secondary{background:#eaf2f8;color:#0f4c81}'
      + '.dlogin-links{display:flex;justify-content:space-between;gap:10px;margin-top:12px;font-size:13px}'
      + '.dlogin-links a{color:#0f6fb8;text-decoration:none;font-weight:600;cursor:pointer}'
      + '.dlogin-msg{margin-top:10px;font-size:13px;border-radius:8px;padding:10px 12px;display:none}'
      + '.dlogin-msg.show{display:block}'
      + '.dlogin-msg.err{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3}'
      + '.dlogin-msg.ok{background:#ecfdf3;color:#166534;border:1px solid #86efac}'
      + '.dlogin-note{margin-top:14px;font-size:12px;color:#64748b;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:10px}'
      + '@media (prefers-color-scheme:dark){.dlogin-modal{background:#172a3d;color:#eef3f9}.dlogin-field label,.dlogin-row label{color:#d9e6f5}.dlogin-field input{background:#0f2233;color:#eef3f9;border-color:#2c4560}.dlogin-note{background:#102233;color:#a9b8ca;border-color:#2c4560}}';
    var st=document.createElement('style'); st.id='doterp-login-style'; st.textContent=css; document.head.appendChild(st);
  }

  function ensureModal(){
    if(document.getElementById('doterpLoginOverlay')) return document.getElementById('doterpLoginOverlay');
    ensureStyles();
    var ov=document.createElement('div'); ov.id='doterpLoginOverlay'; ov.className='dlogin-overlay'; ov.innerHTML=''
      + '<div class="dlogin-modal" role="dialog" aria-modal="true" aria-labelledby="dloginTitle">'
      + '  <div class="dlogin-head"><h3 id="dloginTitle">Customer Login</h3><button type="button" class="dlogin-close" data-login-close aria-label="Close">×</button></div>'
      + '  <div class="dlogin-body">'
      + '    <form id="doterpLoginForm" autocomplete="on">'
      + '      <div class="dlogin-field"><label for="dloginId">Email</label><input id="dloginId" name="email" type="email" placeholder="Enter your registered email" required></div>'
      + '      <div class="dlogin-field"><label for="dloginPass">Password</label><input id="dloginPass" name="password" type="password" placeholder="Enter password" required></div>'
      + '      <div class="dlogin-row"><label><input type="checkbox" id="dloginRemember"> Remember me</label><span></span></div>'
      + '      <div class="dlogin-actions"><button type="submit" class="dlogin-btn primary" id="dloginSubmit">Log In</button><button type="button" class="dlogin-btn secondary" data-login-close>Close</button></div>'
      + '      <div class="dlogin-links"><a href="'+dashUrl()+'" id="dloginDashLink" style="display:none">Go to Dashboard</a></div>'
      + '      <div id="dloginMsg" class="dlogin-msg"></div>'
      + '    </form>'
      + '    <div class="dlogin-note">Login with the email and password provided for your purchase. If you don\'t have access, please contact support.</div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(ov);
    return ov;
  }

  function showMsg(text,type){ var el=document.getElementById('dloginMsg'); if(!el) return; el.textContent=text||''; el.className='dlogin-msg show '+(type||''); }
  function hideMsg(){ var el=document.getElementById('dloginMsg'); if(el){ el.className='dlogin-msg'; el.textContent=''; } }

  async function openLogin(e){
    if(e) e.preventDefault();
    var ov=ensureModal(); ov.classList.add('open'); hideMsg();
    var saved = localStorage.getItem('doterp_saved_email')||'';
    var id=document.getElementById('dloginId'); var rem=document.getElementById('dloginRemember');
    if(id && !id.value) id.value=saved; if(rem) rem.checked=!!saved;
    var logged=await isLoggedIn();
    if(logged){ var dl=document.getElementById('dloginDashLink'); if(dl){ dl.style.display='inline'; dl.href=dashUrl(); } showMsg('You are already logged in.','ok'); }
    setTimeout(function(){ var f=document.getElementById(logged?'dloginDashLink':'dloginId'); if(f&&f.focus) f.focus(); }, 30);
  }
  function closeLogin(){ var ov=document.getElementById('doterpLoginOverlay'); if(ov) ov.classList.remove('open'); }

  async function updateNav(){
    var logged=await isLoggedIn();
    var links=document.querySelectorAll('a[href*="login.html"], a[data-login-link]');
    links.forEach(function(a){
      var txt=(a.textContent||'').trim().toLowerCase();
      if(txt==='log in' || txt==='dashboard' || a.hasAttribute('data-login-link')){
        a.textContent = logged ? 'Dashboard' : 'Log In';
        a.setAttribute('href', logged ? dashUrl() : loginUrl());
      }
      if(!a.__dloginBound){
        a.__dloginBound=true;
        a.addEventListener('click', function(ev){
          (async function(){
            if(await isLoggedIn()){ ev.preventDefault(); location.href = dashUrl(); }
            else { ev.preventDefault(); openLogin(); }
          })();
        });
      }
    });
    var manage=document.querySelectorAll('.mng a.btn.w');
    manage.forEach(function(a){ if((a.textContent||'').indexOf('Manage')>-1){ a.setAttribute('href', logged ? dashUrl() : loginUrl()); } });
  }

  async function logout(){
    var sb=getClient();
    if(sb){ try{ await sb.auth.signOut(); }catch(e){} }
    await updateNav();
  }

  function bindModal(){
    var ov=ensureModal();
    if(ov.__bound) return; ov.__bound=true;
    ov.addEventListener('click', function(e){ if(e.target===ov || e.target.closest('[data-login-close]')){ e.preventDefault(); closeLogin(); } });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeLogin(); });
    var form=document.getElementById('doterpLoginForm');
    if(form) form.addEventListener('submit', function(e){
      e.preventDefault();
      (async function(){
        hideMsg();
        var sb=getClient();
        if(!sb){
          showMsg('Login is not configured yet. Please set Supabase URL and anon key in js/supabase-config.js.','err');
          return;
        }
        var email=(document.getElementById('dloginId').value||'').trim();
        var pass=(document.getElementById('dloginPass').value||'').trim();
        var remember=!!(document.getElementById('dloginRemember')&&document.getElementById('dloginRemember').checked);
        var btn=document.getElementById('dloginSubmit');
        if(btn){ btn.disabled=true; btn.textContent='Logging in...'; }
        try{
          var res=await sb.auth.signInWithPassword({ email: email, password: pass });
          if(res.error){ showMsg(res.error.message || 'Invalid email or password.','err'); }
          else {
            if(remember) localStorage.setItem('doterp_saved_email', email); else localStorage.removeItem('doterp_saved_email');
            showMsg('Login successful. Redirecting to your dashboard...','ok');
            await updateNav();
            setTimeout(function(){ location.href = dashUrl(); }, 500);
          }
        }catch(err){ showMsg('Login failed. Please try again.','err'); }
        if(btn){ btn.disabled=false; btn.textContent='Log In'; }
      })();
    });
  }

  async function requireAuth(){
    var logged=await isLoggedIn();
    if(!logged){ openLogin(); setTimeout(async function(){ if(!(await isLoggedIn())) location.href = loginUrl(); }, 400); return null; }
    return await currentUser();
  }

  async function fetchMyPurchases(){
    var sb=getClient(); if(!sb) return { data:null, error:{ message:'Supabase not configured' } };
    return await sb.from('purchases').select('*').order('created_at', { ascending:false });
  }

  window.DotERPAuth = {
    open: openLogin,
    close: closeLogin,
    logout: function(){ return logout(); },
    isLoggedIn: isLoggedIn,
    getUser: currentUser,
    requireAuth: requireAuth,
    fetchMyPurchases: fetchMyPurchases,
    getClient: getClient,
    isConfigured: sbConfigured
  };

  function init(){ ensureStyles(); ensureModal(); bindModal(); updateNav();
    var path=(location.pathname||'').toLowerCase();
    if(/\/login\.html$/.test(path)) { isLoggedIn().then(function(l){ if(l) location.replace(dashUrl()); }); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
(function(){
  function initMobileNav(){
    var nav=document.querySelector('nav'); if(!nav) return;
    var wrap=nav.querySelector('.wrap'); if(!wrap) return;

    function closeMegas(exceptId){
      nav.querySelectorAll('.mega').forEach(function(m){ if(!exceptId || m.id!==exceptId) m.classList.remove('open'); });
      nav.querySelectorAll('.mm-t').forEach(function(t){ if(!exceptId || t.getAttribute('aria-controls')!==exceptId) t.setAttribute('aria-expanded','false'); });
    }

    if(!wrap.querySelector('.nav-toggle')){
      var btn=document.createElement('button');
      btn.type='button'; btn.className='nav-toggle'; btn.setAttribute('aria-label','Open menu'); btn.setAttribute('aria-expanded','false');
      btn.innerHTML='<span></span>';
      wrap.insertBefore(btn, wrap.firstChild);
      btn.addEventListener('click', function(){
        var open=nav.classList.toggle('mob-open');
        btn.setAttribute('aria-expanded', open ? 'true':'false');
        if(!open) closeMegas();
      });
    }

    function openMega(t){
      var id=t.getAttribute('aria-controls');
      var mega=id?document.getElementById(id):null;
      if(!mega) return;
      closeMegas();
      mega.classList.add('open');
      t.setAttribute('aria-expanded','true');
    }

    nav.querySelectorAll('.mm-t').forEach(function(t){
      t.addEventListener('click', function(e){
        e.preventDefault();
        var id=t.getAttribute('aria-controls');
        var mega=id?document.getElementById(id):null;
        if(!mega) return;
        var isOpen=mega.classList.contains('open');
        closeMegas();
        if(!isOpen){ mega.classList.add('open'); t.setAttribute('aria-expanded','true'); }
      });
      t.addEventListener('mouseenter', function(){
        if(window.matchMedia('(min-width: 981px)').matches) openMega(t);
      });
    });

    nav.addEventListener('mouseleave', function(){
      if(window.matchMedia('(min-width: 981px)').matches) closeMegas();
    });

    nav.querySelectorAll('.mega').forEach(function(m){
      m.addEventListener('mouseenter', function(){
        if(window.matchMedia('(min-width: 981px)').matches){
          var id=m.id; var t=nav.querySelector('.mm-t[aria-controls="'+id+'"]');
          if(t){ m.classList.add('open'); t.setAttribute('aria-expanded','true'); }
        }
      });
    });

    document.addEventListener('click', function(e){
      if(!nav.contains(e.target)){
        if(nav.classList.contains('mob-open')){
          nav.classList.remove('mob-open');
          var b=wrap.querySelector('.nav-toggle'); if(b) b.setAttribute('aria-expanded','false');
        }
        closeMegas();
      }
    });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMegas(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initMobileNav); else initMobileNav();
})();
(function(){
  function initHero(){
    var hero=document.querySelector('.hero'); if(!hero) return;
    var slides=[].slice.call(hero.querySelectorAll('.slide')); if(slides.length<2) return;
    var prev=hero.querySelector('.ar.l'), next=hero.querySelector('.ar.r'), dotsWrap=hero.querySelector('.dots');
    var idx=slides.findIndex(function(s){return s.classList.contains('on');}); if(idx<0) idx=0;
    var timer=null;
    function renderDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML='';
      slides.forEach(function(_,i){
        var b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label','Go to slide '+(i+1));
        if(i===idx) b.className='on';
        b.addEventListener('click', function(){ go(i,true); });
        dotsWrap.appendChild(b);
      });
    }
    function show(i){
      slides.forEach(function(s,n){
        s.classList.toggle('on', n===i);
        s.classList.toggle('out', n===idx && n!==i);
      });
      idx=i;
      if(dotsWrap){ [].forEach.call(dotsWrap.children,function(d,n){ d.className = n===idx ? 'on' : ''; }); }
    }
    function go(i,user){
      if(i<0) i=slides.length-1; if(i>=slides.length) i=0;
      show(i);
      if(user) restart();
    }
    function start(){ stop(); timer=setInterval(function(){ go(idx+1,false); }, 3000); }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }
    function restart(){ start(); }
    if(prev) prev.addEventListener('click', function(){ go(idx-1,true); });
    if(next) next.addEventListener('click', function(){ go(idx+1,true); });
    renderDots(); show(idx); start();
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initHero); else initHero();
})();
(function(){
  function initFloatingWidgets(){
    if(document.getElementById('doterp-float-wrap')) return;
    var css = ''
      + '.df-wrap{position:fixed;right:18px;bottom:92px;z-index:9998;display:flex;flex-direction:column;gap:10px;align-items:flex-end;font-family:\'Plus Jakarta Sans\',system-ui,Segoe UI,Arial,sans-serif}'
      + '.df-btn{width:54px;height:54px;border-radius:50%;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;transition:transform .2s;text-decoration:none}'
      + '.df-btn:hover{transform:translateY(-2px) scale(1.03)}'
      + '.df-wa{background:#25D366}'
      + '@media(max-width:520px){.df-wrap{right:12px;bottom:88px}}';
    var st=document.createElement('style'); st.id='doterp-float-style'; st.textContent=css; document.head.appendChild(st);

    var waNumber='919718437209';
    var waText=encodeURIComponent('Hi, I need help with DotERP.');
    var waIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="#fff" aria-hidden="true"><path d="M19.11 17.47c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.15-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.08-.15-.65-1.56-.89-2.13-.23-.56-.47-.49-.65-.5h-.55c-.19 0-.51.07-.77.36-.26.29-1.01.99-1.01 2.41s1.04 2.79 1.18 2.98c.15.19 2.04 3.12 4.95 4.37.69.3 1.23.47 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM16.03 27.7h-.01c-1.91 0-3.78-.51-5.42-1.48l-.39-.23-4.02 1.05 1.07-3.92-.26-.4a11.57 11.57 0 0 1-1.77-6.13c0-6.39 5.2-11.59 11.6-11.59 3.09 0 6 1.2 8.19 3.39a11.52 11.52 0 0 1 3.4 8.2c0 6.39-5.2 11.58-11.59 11.58zm9.87-21.46A13.93 13.93 0 0 0 16.03 2.2C8.34 2.2 2.08 8.46 2.08 16.15c0 2.46.64 4.86 1.86 6.98L2 30l7.05-1.85a13.9 13.9 0 0 0 6.97 1.87h.01c7.68 0 13.94-6.26 13.95-13.94 0-3.72-1.45-7.22-4.08-9.84z"/></svg>';
    var wrap=document.createElement('div'); wrap.id='doterp-float-wrap'; wrap.className='df-wrap';
    wrap.innerHTML='<a class="df-btn df-wa" id="dfWa" href="https://wa.me/'+waNumber+'?text='+waText+'" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="WhatsApp">'+waIcon+'</a>';
    document.body.appendChild(wrap);

    // Tawk.to Live Assist (real-time chat)
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/6af81883e4c8e03c4251ca5a/1k7chvgr4';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
    })();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initFloatingWidgets); else initFloatingWidgets();
})();