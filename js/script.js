/* ── Cursor (desktop / fine-pointer only — skipped on touch for perf) ── */
const hasFinePointer = window.matchMedia('(pointer:fine)').matches;
if(hasFinePointer){
  const cur=document.getElementById('cur'),curR=document.getElementById('cur-r');
  let mx=0,my=0,rx=0,ry=0,curRunning=false;
  function tick(){
    rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
    cur.style.transform=`translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    if(Math.abs(mx-rx)<.1 && Math.abs(my-ry)<.1){
      rx=mx; ry=my;
      curR.style.transform=`translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      curRunning=false;
      return;
    }
    curR.style.transform=`translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    if(!curRunning){ curRunning=true; requestAnimationFrame(tick); }
  });
  document.querySelectorAll('a,button,.chip,.sk-chip,.proj-cta,.proj-stage-action,.proj-dot,.clink,.modal-x,.soc').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
  });
}

/* ── Scroll / nav / progress ── */
const prog=document.getElementById('prog'),nav=document.getElementById('nav');
let isScrolling = false;
let scrollableH = 1;
function updateScrollableH(){ scrollableH = Math.max(document.documentElement.scrollHeight - innerHeight, 1); }
updateScrollableH();
window.addEventListener('resize', updateScrollableH, {passive:true});
window.addEventListener('scroll',()=>{
  if(!isScrolling){
    window.requestAnimationFrame(()=>{
      prog.style.transform=`scaleX(${window.scrollY/scrollableH})`;
      nav.classList.toggle('up',window.scrollY>20);
      isScrolling = false;
    });
    isScrolling = true;
  }
},{passive:true});

/* ── Active nav link ── */
(()=>{
  const allLinks=document.querySelectorAll('.nav-pill-link, .nav-drawer-link');
  const ids=[...new Set([...allLinks].map(a=>a.dataset.section))];
  const sio=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        allLinks.forEach(a=>a.classList.toggle('active',a.dataset.section===e.target.id));
      }
    });
  },{rootMargin:'-40% 0px -55% 0px'});
  ids.forEach(id=>{const el=document.getElementById(id);if(el)sio.observe(el);});
})();

/* ── Reveal on scroll ── */
const io=new IntersectionObserver(e=>e.forEach(x=>{
  if(x.isIntersecting){
    x.target.classList.add('on');
    io.unobserve(x.target);
  }
}),{threshold:.06});
document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s').forEach(el=>io.observe(el));

/* ── Pause infinite animations while their section is off-screen ── */
const animIO=new IntersectionObserver(e=>e.forEach(x=>x.target.classList.toggle('anim-paused',!x.isIntersecting)));
['hero','contact'].forEach(id=>{const el=document.getElementById(id);if(el)animIO.observe(el);});

/* ── Magnetic buttons (fine-pointer only) ── */
if(hasFinePointer){
  document.querySelectorAll('.btn-cta,.modal-live').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px) translateY(-1px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });
}

/* ── Modals ── */
function openModal(id){
  const bg=document.getElementById('modal-'+id);
  if(!bg)return;
  bg.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(id){
  const bg=document.getElementById('modal-'+id);
  if(!bg)return;
  bg.classList.remove('open');
  document.body.style.overflow='';
}
document.querySelectorAll('.modal-bg').forEach(bg=>{
  bg.addEventListener('click',e=>{
    if(e.target===bg){bg.classList.remove('open');document.body.style.overflow='';}
  });
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.querySelectorAll('.modal-bg.open').forEach(bg=>{bg.classList.remove('open');document.body.style.overflow='';});
});

/* ── Cinematic projects ── */
/* shared visual config keyed by project slug */
const projVisual = {
  sufra:    { index:'01', image:'images/Sufra.webp',    modal:'sufra',    bg:'radial-gradient(ellipse 80% 60% at 50% 30%, #0d1f12 0%, #060e0a 60%, #040c08 100%)', accent:'72,185,110',   tint:'rgba(72,185,110,0.04)' },
  bfm:      { index:'02', image:'images/BFM.webp',      modal:'bfm',      bg:'radial-gradient(ellipse 80% 60% at 50% 30%, #1a0e1f 0%, #0e0812 60%, #080510 100%)', accent:'160,100,210',  tint:'rgba(160,100,210,0.045)' },
  uop:      { index:'03', image:'images/UOP.webp',      modal:'uop',      bg:'radial-gradient(ellipse 80% 60% at 50% 30%, #0a1520 0%, #060e18 60%, #040a12 100%)', accent:'80,140,220',   tint:'rgba(80,140,220,0.04)' },
  taskat:   { index:'04', image:'images/Taskat.webp',   modal:'taskat',   bg:'radial-gradient(ellipse 80% 60% at 50% 30%, #0f0f1f 0%, #0a0a18 60%, #060610 100%)', accent:'100,100,230',  tint:'rgba(100,100,230,0.04)' },
  netspeed: { index:'05', image:'images/NetSpeed.webp', modal:'netspeed', bg:'radial-gradient(ellipse 80% 60% at 50% 30%, #1a1000 0%, #120b00 60%, #0a0700 100%)', accent:'242,179,109',  tint:'rgba(242,179,109,0.04)' }
};

/* per-language copy */
const projCopy = {
  ar: {
    sufra:    { title:'سُفرة', sub:'منصة SaaS متعددة المستأجرين للمطاعم مبنية على Laravel — نقطة بيع، شاشة مطبخ، قائمة QR رقمية، إدارة طاولات وعملاء وفريق، مخزون، تقارير مبيعات، وسوبر آدمن كامل. حالياً في الإنتاج مع عملاء مطاعم حقيقيين.' },
    bfm:      { title:'BookForMe', sub:'SaaS متعدد المستأجرين واسع النطاق للشركات الخدمية — صالونات وعيادات ومنتجعات — يغطي الحجوزات والتجارة الإلكترونية والمخزون والموظفين والعضويات والتسويق عبر 7 مستودعات.' },
    uop:      { title:'لوحة تحكم UOP', sub:'CMS كامل وموقع عام لجامعة فلسطين — تضمّنت المهمة إعادة هيكلة معمارية شاملة لنظام قديم يحتوي على 10+ سنوات من بيانات الإنتاج.' },
    netspeed: { title:'NetSpeed', sub:'منصة ISP عالية الحركة تخدم 10,000+ مستخدم متزامن — جُلبت لحل مشكلة أداء حرجة وإعادة بناء واجهة المستخدم بالكامل.' },
    taskat:   { title:'تسكات', sub:'هجين بين Jira وSlack لفرق البرمجيات — لوحات كانبان، سبرنتات، إشعارات فورية، ورسائل فريق تحت معمارية متعددة المستأجرين.' }
  },
  en: {
    sufra:    { title:'Sufra', sub:'A Laravel-powered multi-tenant restaurant SaaS — POS, kitchen display, digital QR menu, table management, customer directory, team management, inventory, sales reports, and a full super-admin layer. Currently live with real restaurant clients.' },
    bfm:      { title:'BookForMe', sub:'A large-scale multi-tenant SaaS for service businesses — salons, clinics, spas — covering bookings, e-commerce, inventory, staff, memberships, and marketing across 7 repositories.' },
    uop:      { title:'UOP Dashboard', sub:'A full CMS and public website for the University of Palestine — including a complete architectural overhaul of a legacy system storing 10+ years of production data.' },
    netspeed: { title:'NetSpeed', sub:'A high-traffic ISP management platform serving 10,000+ concurrent users — brought in to solve a critical performance problem and overhaul the user experience.' },
    taskat:   { title:'Taskat', sub:'A Jira/Slack hybrid for software teams — kanban boards, sprints, real-time notifications, and team messaging under a multi-tenant architecture.' }
  }
};

const projectState = {
  current: 'sufra',
  timer: null,
  /* kept for backwards compat — actual text comes from projCopy[currentLang] */
  data: projCopy.ar
};

const projCinema  = document.getElementById('proj-cinema');
const projDots    = [...document.querySelectorAll('.proj-dot')];
const projSteps   = [...document.querySelectorAll('.proj-step')];
const projKeys    = ['sufra','bfm','uop','netspeed','taskat'];

/* populate each card's text from projCopy */
function populateCards(lang){
  projKeys.forEach(key=>{
    const p = projCopy[lang]?.[key] || projCopy.ar[key];
    if(!p) return;
    const sub = document.getElementById(`pc-sub-${key}`);
    if(sub) sub.textContent = p.sub || '';
  });
}

const exitTimeouts = {};
let lastSwitchAt = 0;

function setActiveProject(key){
  const prevKey = projectState.current;
  projectState.current = key;
  const idx = projKeys.indexOf(key);
  const now = Date.now();
  const fastSwitch = now - lastSwitchAt < 150;
  lastSwitchAt = now;
  projKeys.forEach((k)=>{
    const card = document.getElementById(`proj-card-${k}`);
    if(!card) return;
    if(exitTimeouts[k]){ clearTimeout(exitTimeouts[k]); exitTimeouts[k] = null; }
    if(k === key){
      card.classList.remove('exit');
      card.classList.add('active');
    } else if(k === prevKey){
      card.classList.remove('active');
      card.classList.add('exit');
      if(fastSwitch){
        card.classList.remove('exit');
      } else {
        exitTimeouts[k] = setTimeout(()=>{ card.classList.remove('exit'); exitTimeouts[k] = null; }, 400);
      }
    } else {
      card.classList.remove('active','exit');
    }
  });
  projDots.forEach((dot,i)=>dot.classList.toggle('active', i === idx));
}

function activateCard(key){
  if(projectState.current === key) return;
  setActiveProject(key);
}

const projObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) activateCard(entry.target.dataset.project);
  });
},{ threshold: 0, rootMargin: '-40% 0px -40% 0px' });
projSteps.forEach(step=>projObserver.observe(step));

/* ── Mobile arrow navigation + swipe ── */
function mobileProjNav(dir){
  const idx = projKeys.indexOf(projectState.current);
  /* loop: wrap around both ends */
  const next = (idx + dir + projKeys.length) % projKeys.length;
  setActiveProject(projKeys[next]);
}

/* touch swipe on the sticky panel */
(function(){
  const el = document.getElementById('proj-sticky');
  if(!el) return;
  let startX = 0, startY = 0;
  el.addEventListener('touchstart', e=>{
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e=>{
    if(window.innerWidth > 768) return; /* desktop — ignore */
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; /* not a horizontal swipe */
    /* RTL-aware: swipe left = next in LTR, prev in RTL */
    const isRtl = document.documentElement.dir === 'rtl';
    mobileProjNav(dx < 0 ? (isRtl ? -1 : 1) : (isRtl ? 1 : -1));
  }, { passive: true });
})();

/* cards and first activation handled by applyLang init below */
projectState.current = '';

/* ── Form validation + submit ── */
function setErr(id, msg){ const el=document.getElementById(id); if(el){el.textContent=msg; el.previousElementSibling?.classList.toggle('invalid',!!msg);} }
function clearErrs(){ ['name','email','subject','message'].forEach(f=>setErr('err-'+f,'')); }

function validateForm(){
  const ar = currentLang==='ar';
  let ok = true;
  const name = document.getElementById('fn').value.trim();
  const email = document.getElementById('fe').value.trim();
  const msg   = document.getElementById('fm').value.trim();
  if(!name || name.length < 2){
    setErr('err-name', ar ? 'الرجاء إدخال اسمك' : 'Please enter your name'); ok=false;
  } else if(name.length > 80){
    setErr('err-name', ar ? 'الاسم طويل جداً' : 'Name too long'); ok=false;
  } else setErr('err-name','');
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    setErr('err-email', ar ? 'بريد إلكتروني غير صالح' : 'Please enter a valid email'); ok=false;
  } else setErr('err-email','');
  if(!msg || msg.length < 10){
    setErr('err-message', ar ? 'الرسالة قصيرة جداً (10 أحرف على الأقل)' : 'Message too short (min 10 characters)'); ok=false;
  } else if(msg.length > 2000){
    setErr('err-message', ar ? 'الرسالة طويلة جداً (2000 حرف كحد أقصى)' : 'Message too long (max 2000 characters)'); ok=false;
  } else setErr('err-message','');
  return ok;
}

function resetForm(){
  const form = document.getElementById('contact-form');
  const succ = document.getElementById('form-success');
  form.reset(); clearErrs();
  succ.style.display = 'none';
  form.style.display = 'block';
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = false;
  const span = btn.querySelector('[data-i18n]');
  if(span) span.textContent = i18n[currentLang]['contact.formSend'];
}

async function handleForm(e){
  e.preventDefault();
  clearErrs();
  if(!validateForm()) return;
  const form = e.target;
  const btn  = form.querySelector('button[type=submit]');
  const span = btn.querySelector('[data-i18n]');
  span.textContent = currentLang==='ar' ? 'جاري الإرسال…' : 'Sending…';
  btn.disabled = true;
  const payload = {
    access_key: document.querySelector('[name="access_key"]').value,
    name:    document.getElementById('fn').value.trim(),
    email:   document.getElementById('fe').value.trim(),
    subject: document.getElementById('fs').value.trim() || 'Portfolio Inquiry',
    message: document.getElementById('fm').value.trim(),
  };
  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if(json.success){
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'flex';
    } else {
      span.textContent = currentLang==='ar' ? 'حدث خطأ، أعد المحاولة' : 'Error, please try again';
      btn.disabled = false;
    }
  } catch(_){
    span.textContent = currentLang==='ar' ? 'تعذّر الإرسال' : 'Failed to send';
    btn.disabled = false;
  }
}

/* live validation — clear error as user types */
['fn','fe','fs','fm'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', ()=>{ const key={'fn':'name','fe':'email','fs':'subject','fm':'message'}[id]; setErr('err-'+key,''); el.classList.remove('invalid'); });
});

/* ── i18n ── */
let currentLang = localStorage.getItem('lang') || 'ar';

const i18n = {
  ar: {
    'nav.name': 'محمد النملة',
    'nav.role': 'مطوّر الواجهة الخلفية',
    'nav.about': 'عنّي',
    'nav.projects': 'المشاريع',
    'nav.skills': 'المهارات',
    'nav.experience': 'الخبرة',
    'nav.contact': 'تواصل',
    'nav.available': 'متاح للعمل',
    'nav.hire': 'توظيف',
    'hero.eyebrow': 'فلسطين · مطوّر الواجهة الخلفية',
    'hero.tagline': 'أبني أنظمة قابلة<strong> للتوسع</strong>',
    'hero.scroll': 'تمرير',
    'about.label': 'عنّي',
    'about.heading': 'مطوّر يفكّر بمنطق الأنظمة',
    'about.p1': 'أنا <strong>مطوّر الواجهة الخلفية</strong> متخصص في بناء واجهات برمجية عالية الأداء، وأنظمة SaaS متعددة المستأجرين، وحلول الوقت الفعلي — خريج تقنية المعلومات من الجامعة الإسلامية بغزة.',
    'about.p2': 'عملت على منصات حجز، أنظمة إدارة جامعية، إدارة مشاريع، بنية ISP، ونقاط بيع للمطاعم — كل مشروع يتطلب أمانًا وأداءً ودقةً في التصميم.',
    'about.p3': 'أتعامل مع كل مشروع بعقلية <strong>الإنتاج أولاً</strong>: تصميم قاعدة البيانات قبل الكود، الأمان افتراضيًا، والأداء هدف قابل للقياس.',
    'about.factLocationK': 'الموقع',
    'about.factLocationV': 'فلسطين 🇵🇸',
    'about.factRoleK': 'الدور الحالي',
    'about.factEduK': 'التعليم',
    'about.factEduV': 'بكالوريوس تقنية المعلومات · IUG',
    'about.factStatusK': 'الحالة',
    'about.factStatusV': 'متاح للعمل ✦',
    'about.cardName': 'محمد النملة',
    'about.cardRole': 'مطوّر الواجهة الخلفية · فلسطين',
    'projects.label': 'المشاريع',
    'projects.heading': 'مشاريع مختارة',
    'projects.sub': 'بعض من الأعمال التي شاركت في بنائها — انقر على أي مشروع لعرض التفاصيل.',
    'projects.openBtn': 'عرض التفاصيل',
    'proj.role.fullstack': 'مطوّر متكامل',
    'proj.role.fullstackBackend': 'مطوّر متكامل (واجهة خلفية أولاً)',
    'proj.role.backend': 'مطوّر الواجهة الخلفية',
    'proj.status.live': 'في الإنتاج',
    'proj.status.delivered': 'مُسلَّم',
    'skills.label': 'المهارات',
    'skills.heading': 'التقنيات التي أعمل بها',
    'skills.sub': 'مجموعة عملية لبناء أنظمة إنتاجية — من تصميم الواجهة الخلفية والقواعد إلى النشر والاختبار.',
    'skills.overEyebrow': 'نظرة على الأدوات',
    'skills.overTitle': 'أدوات للشحن، لا لجمع الشعارات',
    'skills.overText': 'أفضّل الأدوات التي تحسّن سرعة التسليم وسهولة الصيانة وموثوقية الإنتاج. الواجهة الخلفية هي تخصصي الأساسي، والواجهة الأمامية تدعم ذلك عند الحاجة.',
    'skills.m1': 'اللغة الأساسية',
    'skills.m2': 'الإطار الرئيسي',
    'skills.m3': 'قاعدة البيانات',
    'skills.card1': 'الواجهة الخلفية',
    'skills.card2': 'قواعد البيانات والتخزين',
    'skills.card3': 'DevOps والأدوات',
    'skills.card4': 'الواجهة الأمامية',
    'exp.label': 'المسيرة',
    'exp.heading': 'الخبرة',
    'exp.sub': 'مسيرتي المهنية في تطوير البرمجيات',
    'exp.job1Period': 'أكتوبر 2023 — حتى الآن',
    'exp.job1Title': 'مطوّر الواجهة الخلفية',
    'exp.badgeCurrent': 'حالي',
    'exp.job1l1': 'تصميم وبناء واجهات خلفية آمنة وقابلة للتوسع لمنصات SaaS وERP وحجوزات لعملاء مؤسسيين متعددين.',
    'exp.job1l2': 'هندسة مخططات قواعد بيانات معقدة وتحسين REST APIs عالية الحمل — تخفيضات ملموسة في زمن الاستجابة وصلت للإنتاج.',
    'exp.job1l3': 'تطبيق نظام RBAC دقيق في بيئات متعددة المستأجرين لثلاث مستويات مستخدمين.',
    'exp.job1l4': 'سبرنتات Agile، مراجعات كود منظمة، تغطية PHPUnit، CI/CD عبر GitHub Actions.',
    'exp.job2Period': 'يونيو 2023 — أكتوبر 2023',
    'exp.job2Title': 'مطوّر الواجهة الخلفية — تدريب',
    'exp.badgeIntern': 'تدريب',
    'exp.job2l1': 'برنامج مكثّف لمدة 4 أشهر يغطي سير عمل الويب الحديث ودورة حياة التطوير الكاملة في كود إنتاجي.',
    'exp.job2l2': 'بناء ميزات Laravel مع مطورين متمرسين وتعلم أنماط المعمارية وثقافة مراجعة الكود.',
    'exp.job3Title': 'بكالوريوس تقنية المعلومات — تطوير الويب',
    'exp.job3Co': 'الجامعة الإسلامية بغزة',
    'exp.badgeEdu': 'تعليم',
    'exp.job1Loc': 'الكويت · فلسطين',
    'exp.job3Loc': 'غزة، فلسطين',
    'exp.job3l1': 'تقنيات الويب المتقدمة، أنظمة قواعد البيانات، الخوارزميات، ومبادئ هندسة البرمجيات.',
    'exp.job3l2': 'أساس أكاديمي متين في OOP وهياكل البيانات وتطوير الواجهة الخلفية.',
    'contact.label': 'تواصل',
    'contact.heading': 'تواصل معي',
    'contact.sub': 'منفتح على الفرص الجديدة والتعاونات والمشاريع المثيرة.',
    'contact.leftHeading': 'لنعمل معاً',
    'contact.leftP': 'سواء كان منتج SaaS، أو API عالي الحمل، أو نظاماً يحتاج معمارية مدروسة — أودّ أن أسمع عنه.',
    'contact.emailK': 'البريد الإلكتروني',
    'contact.phoneK': 'الهاتف',
    'contact.locationK': 'الموقع',
    'contact.locationV': 'فلسطين 🇵🇸',
    'contact.formHeading': 'أرسل رسالة',
    'contact.formName': 'الاسم',
    'contact.formNamePh': 'اسمك',
    'contact.formEmail': 'البريد الإلكتروني',
    'contact.formSubject': 'الموضوع',
    'contact.formSubjectPh': 'استفسار عن مشروع',
    'contact.formMessage': 'الرسالة',
    'contact.formMessagePh': 'أخبرني عن مشروعك...',
    'contact.formSend': 'إرسال',
    'contact.successTitle': 'تم الإرسال بنجاح!',
    'contact.successMsg': 'شكراً لتواصلك معي. سأراجع رسالتك وأرد عليك في أقرب وقت ممكن.',
    'contact.successBack': 'إرسال رسالة أخرى',
    'footer.copy': '© 2025 <b>محمد النملة</b> · فلسطين 🇵🇸',
    'm.close': 'إغلاق →',
    'm.sufra.badge': 'مطوّر متكامل (خلفية أولاً) · في الإنتاج',
    'm.sufra.title': 'سُفرة',
    'm.sufra.sub': 'SaaS متعدد المستأجرين للمطاعم مبني على Laravel — نقطة بيع، شاشة مطبخ، قائمة QR رقمية، إدارة طاولات، مخزون، تقارير مبيعات، وطبقة سوبر آدمن. حالياً في الإنتاج مع عملاء حقيقيين.',
    'm.sufra.date': 'أبريل 2025 – حتى الآن',
    'm.sufra.org': 'مطوّر متكامل (خلفية أولاً)',
    'm.sufra.s1': 'واجهة خلفية Laravel',
    'm.sufra.s2': 'نقطة بيع أوف لاين',
    'm.sufra.s3': 'إشعارات فورية WebSockets',
    'm.sufra.s4': 'كاش Redis + Push',
    'm.sufra.live': 'عرض الموقع',
    'm.bfm.badge': 'مطوّر الواجهة الخلفية · في الإنتاج',
    'm.bfm.sub': 'SaaS متعدد المستأجرين واسع النطاق للشركات الخدمية — صالونات وعيادات ومنتجعات — يغطي الحجوزات والتجارة الإلكترونية والمخزون والموظفين والعضويات والتسويق عبر 7 مستودعات.',
    'm.bfm.date': 'مارس 2024 – حتى الآن',
    'm.bfm.s1': 'بوابات متخصصة',
    'm.bfm.s2': 'عملات مدعومة',
    'm.bfm.s3': 'مستودعات',
    'm.bfm.s4': 'إنتاج مع عملاء مؤسسيين',
    'm.bfm.live': 'عرض الموقع',
    'm.uop.badge': 'مطوّر الواجهة الخلفية · مُسلَّم',
    'm.uop.title': 'لوحة تحكم UOP',
    'm.uop.sub': 'CMS كامل وموقع عام لجامعة فلسطين — وإعادة هيكلة معمارية شاملة لنظام قديم يحتوي على 10+ سنوات من البيانات.',
    'm.uop.date': 'أكتوبر 2024 – أبريل 2025',
    'm.uop.s1': 'نوع محتوى',
    'm.uop.s2': 'مستودعات',
    'm.uop.s3': 'توثيق OpenAPI 3.0',
    'm.uop.s4n': 'ع+EN',
    'm.uop.s4': 'ثنائي اللغة',
    'm.uop.live': 'عرض الموقع',
    'm.taskat.badge': 'مطوّر الواجهة الخلفية · مُسلَّم',
    'm.taskat.title': 'تسكات',
    'm.taskat.sub': 'هجين بين Jira وSlack لفرق البرمجيات — لوحات كانبان، سبرنتات، إشعارات فورية، ورسائل الفريق، تحت اشتراك متعدد المستأجرين.',
    'm.taskat.date': 'فبراير 2025 – مارس 2025',
    'm.taskat.access': '🔒 خاص',
    'm.taskat.s1': 'محرك سبرنت كامل',
    'm.taskat.s2': 'دردشة فورية',
    'm.taskat.s3': 'أدوار ديناميكية لكل مشروع',
    'm.taskat.s4': 'متعدد المستأجرين',
    'm.netspeed.badge': 'مطوّر الواجهة الخلفية · مُسلَّم',
    'm.netspeed.sub': 'منصة ISP عالية الحركة تخدم أكثر من 10,000 مستخدم متزامن — جُلبت لحل مشكلة أداء حرجة وإعادة بناء تجربة المستخدم.',
    'm.netspeed.date': 'يناير 2025',
    'm.netspeed.s1': 'مستخدم متزامن',
    'm.netspeed.s2': 'زمن استجابة API',
    'm.netspeed.s3': 'انخفاض حمل قاعدة البيانات',
    'm.netspeed.s4': 'مصادقة Hotspot',
    'm.netspeed.live': 'عرض الموقع',
  },
  en: {
    'nav.name': 'Mohammed Al-Namla',
    'nav.role': 'Backend Developer',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'nav.available': 'Available for work',
    'nav.hire': 'Hire me',
    'hero.eyebrow': 'Palestine · Backend Developer',
    'hero.tagline': 'Building systems that <strong>scale</strong>',
    'hero.scroll': 'Scroll',
    'about.label': 'About',
    'about.heading': 'A developer who thinks in systems',
    'about.p1': 'I\'m a <strong>backend developer</strong> specialising in high-performance APIs, multi-tenant SaaS architectures, and real-time solutions — graduate in Information Technology from the Islamic University of Gaza.',
    'about.p2': 'I\'ve worked on booking platforms, university CMS, project management, ISP infrastructure, and restaurant POS — every project demanding security, performance, and design precision.',
    'about.p3': 'I approach every project with a <strong>production-first</strong> mindset: schema before code, security by default, and performance as a measurable goal.',
    'about.factLocationK': 'Location',
    'about.factLocationV': 'Palestine 🇵🇸',
    'about.factRoleK': 'Current role',
    'about.factEduK': 'Education',
    'about.factEduV': 'B.Sc. Information Technology · IUG',
    'about.factStatusK': 'Status',
    'about.factStatusV': 'Available for work ✦',
    'about.cardName': 'Mohammed Al-Namla',
    'about.cardRole': 'Backend Developer · Palestine',
    'projects.label': 'Projects',
    'projects.heading': 'Selected Projects',
    'projects.sub': 'A selection of work I\'ve built — click any project to see the details.',
    'projects.openBtn': 'Open case study',
    'proj.role.fullstack': 'Full-Stack Developer',
    'proj.role.fullstackBackend': 'Full-Stack Developer (Backend-First)',
    'proj.role.backend': 'Backend Developer',
    'proj.status.live': 'Production Live',
    'proj.status.delivered': 'Delivered',
    'skills.label': 'Skills',
    'skills.heading': 'Technologies I work with',
    'skills.sub': 'A practical set for shipping production systems — from backend and database design to deployment and testing.',
    'skills.overEyebrow': 'Toolset overview',
    'skills.overTitle': 'Tools for shipping, not for collecting logos',
    'skills.overText': 'I favour tools that improve delivery speed, maintainability, and production reliability. Backend is my core speciality; frontend supports that when needed.',
    'skills.m1': 'Primary language',
    'skills.m2': 'Main framework',
    'skills.m3': 'Database',
    'skills.card1': 'Backend',
    'skills.card2': 'Databases & Storage',
    'skills.card3': 'DevOps & Tooling',
    'skills.card4': 'Frontend',
    'exp.label': 'Career',
    'exp.heading': 'Experience',
    'exp.sub': 'My professional journey in software development',
    'exp.job1Period': 'Oct 2023 — Present',
    'exp.job1Title': 'Backend Developer',
    'exp.badgeCurrent': 'Current',
    'exp.job1l1': 'Designing and building secure, scalable backends for SaaS, ERP, and booking platforms across multiple enterprise clients.',
    'exp.job1l2': 'Engineering complex database schemas and optimising high-load REST APIs — measurable latency reductions shipped to production.',
    'exp.job1l3': 'Implementing fine-grained RBAC in multi-tenant environments across three user tiers.',
    'exp.job1l4': 'Agile sprints, structured code reviews, PHPUnit coverage, CI/CD via GitHub Actions.',
    'exp.job2Period': 'Jun 2023 — Oct 2023',
    'exp.job2Title': 'Backend Developer — Internship',
    'exp.badgeIntern': 'Internship',
    'exp.job2l1': 'Intensive 4-month programme covering modern web workflows and the full development lifecycle in production-grade code.',
    'exp.job2l2': 'Building Laravel features alongside senior developers, learning architecture patterns and code-review culture.',
    'exp.job3Title': 'B.Sc. Information Technology — Web Development',
    'exp.job3Co': 'Islamic University of Gaza',
    'exp.badgeEdu': 'Education',
    'exp.job1Loc': 'Kuwait · Palestine',
    'exp.job3Loc': 'Gaza, Palestine',
    'exp.job3l1': 'Advanced web technologies, database systems, algorithms, and software engineering principles.',
    'exp.job3l2': 'Strong academic foundation in OOP, data structures, and backend development.',
    'contact.label': 'Contact',
    'contact.heading': 'Get in touch',
    'contact.sub': 'Open to new opportunities, collaborations, and interesting projects.',
    'contact.leftHeading': "Let's work together",
    'contact.leftP': "Whether it's a challenging SaaS product, a high-scale API, or a complex system that needs careful architecture — I'd love to hear about it.",
    'contact.emailK': 'Email',
    'contact.phoneK': 'Phone',
    'contact.locationK': 'Location',
    'contact.locationV': 'Palestine 🇵🇸',
    'contact.formHeading': 'Send a message',
    'contact.formName': 'Name',
    'contact.formNamePh': 'Your name',
    'contact.formEmail': 'Email',
    'contact.formSubject': 'Subject',
    'contact.formSubjectPh': 'Project inquiry',
    'contact.formMessage': 'Message',
    'contact.formMessagePh': 'Tell me about your project...',
    'contact.formSend': 'Send Message',
    'contact.successTitle': 'Message Sent!',
    'contact.successMsg': 'Thanks for reaching out. I\'ll review your message and get back to you as soon as possible.',
    'contact.successBack': 'Send another message',
    'footer.copy': '© 2025 <b>Mohammed Al-Namla</b> · Palestine 🇵🇸',
    'm.close': '← Close',
    'm.sufra.badge': 'Full-Stack (Backend-First) · Live in Production',
    'm.sufra.title': 'Sufra',
    'm.sufra.sub': 'Laravel-powered multi-tenant restaurant SaaS — POS, kitchen display, digital QR menu, table management, inventory, sales reports, and a full super-admin layer. Currently live with real restaurant clients.',
    'm.sufra.date': 'Apr 2025 – Present',
    'm.sufra.org': 'Full-Stack Developer (Backend-First)',
    'm.sufra.s1': 'Laravel REST backend',
    'm.sufra.s2': 'Offline-first POS',
    'm.sufra.s3': 'Real-time via WebSockets',
    'm.sufra.s4': 'Redis cache + web push',
    'm.sufra.live': 'View Live Site',
    'm.bfm.badge': 'Backend Developer · Production Live',
    'm.bfm.sub': 'A large-scale multi-tenant SaaS for service businesses — salons, clinics, spas — covering bookings, e-commerce, inventory, staff, memberships, and marketing across 7 repositories.',
    'm.bfm.date': 'Mar 2024 – Present',
    'm.bfm.s1': 'Specialist portals',
    'm.bfm.s2': 'Currencies supported',
    'm.bfm.s3': 'Repositories',
    'm.bfm.s4': 'Live with enterprise clients',
    'm.bfm.live': 'View Live Site',
    'm.uop.badge': 'Backend Developer · Delivered',
    'm.uop.title': 'UOP Dashboard',
    'm.uop.sub': 'Full CMS and public website for the University of Palestine — and a complete architectural overhaul of a legacy system storing 10+ years of production data.',
    'm.uop.date': 'Oct 2024 – Apr 2025',
    'm.uop.s1': 'Content types',
    'm.uop.s2': 'Repositories',
    'm.uop.s3': 'OpenAPI 3.0 documented',
    'm.uop.s4n': 'AR+EN',
    'm.uop.s4': 'Bilingual',
    'm.uop.live': 'View Staging',
    'm.taskat.badge': 'Backend Developer · Delivered',
    'm.taskat.title': 'Taskat',
    'm.taskat.sub': 'A Jira/Slack hybrid for software teams — kanban boards, sprints, real-time notifications, and team messaging under one multi-tenant subscription.',
    'm.taskat.date': 'Feb 2025 – Mar 2025',
    'm.taskat.access': '🔒 Private',
    'm.taskat.s1': 'Full sprint engine',
    'm.taskat.s2': 'Real-time chat',
    'm.taskat.s3': 'Dynamic roles per project',
    'm.taskat.s4': 'Multi-tenant',
    'm.netspeed.badge': 'Backend Developer · Delivered',
    'm.netspeed.sub': 'High-traffic ISP management platform serving 10,000+ concurrent users — brought in to solve a critical performance problem and overhaul the user experience.',
    'm.netspeed.date': 'Jan 2025',
    'm.netspeed.s1': 'Concurrent users',
    'm.netspeed.s2': 'API response time',
    'm.netspeed.s3': 'DB load reduction',
    'm.netspeed.s4': 'Hotspot auth',
    'm.netspeed.live': 'View Live',
  }
};

/* Modal body HTML per lang */
const modalBodies = {
  sufra: {
    ar: `
<div class="modal-sec"><h4>الفكرة</h4><p>سُفرة هو نظام تشغيل متكامل للمطاعم. رأيت أن معظم أدوات إدارة المطاعم إما مكلفة جداً، معقدة جداً، أو غير مبنية للسوق الناطق بالعربية. قدت جميع القرارات التقنية من المعمارية حتى النشر — بناءً على واجهة خلفية <strong>Laravel</strong>، بعقلية <strong>الخلفية أولاً (Backend-First)</strong> مع تسليم كامل للواجهات الأمامية أيضاً (<strong>Full-Stack</strong>).</p></div>
<div class="modal-sec"><h4>ما تغطيه المنصة</h4>
<p><strong>لوحة تحكم صاحب المطعم</strong></p>
<div class="modal-feature-grid"><ul>
<li>إدارة الطلبات الفورية وتتبعها</li>
<li>نقطة بيع مع إدارة الطاولات وتدفقات الكاشير</li>
<li>شاشة مطبخ (KDS) لتوزيع الطلبات</li>
<li>شاشة النادل لإدخال الطلبات على الطاولة</li>
<li>إدارة القائمة: فئات وعناصر وعروض وأسعار</li>
<li>تخطيط الطاولات والتعيينات</li>
</ul><ul>
<li>دليل العملاء مع تاريخ الطلبات</li>
<li>إدارة الفريق مع صلاحيات مبنية على الأدوار</li>
<li>تقارير المبيعات والتحليلات</li>
<li>إدارة المخزون والموردين وتدقيق المخزون</li>
<li>إعدادات وتخصيصات كاملة لكل مطعم</li>
</ul></div>
<p style="margin-top:14px"><strong>واجهة العميل (العامة)</strong></p>
<ul><li>قائمة رقمية عبر QR مع عرض غني للعناصر</li><li>طلب إلكتروني مع سلة وإتمام الدفع</li><li>تاريخ الطلبات والتتبع لكل عميل</li></ul>
<p style="margin-top:14px"><strong>السوبر آدمن</strong></p>
<ul><li>تحكم كامل في جميع المطاعم والمستخدمين</li><li>إدارة الاشتراكات والخطط</li><li>إحصاءات تفصيلية لكل مطعم ونشاطه</li><li>نظام إعلانات لتواصل المنصة</li></ul></div>
<div class="modal-sec"><h4>التحدي الأول — نقطة البيع يجب أن تعمل بدون إنترنت</h4><div class="modal-challenge"><div class="mc-label">المشكلة</div><div class="mc-body">المطاعم في غزة تواجه انقطاعات إنترنت متكررة. نقطة بيع تتوقف عند انقطاع الاتصال ليست منتجاً — إنها عبء.</div></div><div class="modal-challenge"><div class="mc-label">الحل</div><div class="mc-body">بنيت نقطة بيع offline-first باستخدام <strong>IndexedDB outbox queue</strong> على الواجهة الأمامية، تتزامن مع واجهة خلفية <strong>Laravel REST API</strong>: كل العمليات تُكتب محلياً أولاً، ثم تُرسَل وتُعالَج عبر endpoints مخصصة للمزامنة عند عودة الاتصال. الكاشير لا يلاحظ الانقطاع أبداً. صفر خسارة في الطلبات.</div></div></div>
<div class="modal-sec"><h4>التحدي الثاني — إشعارات فورية بدون خدمة خارجية</h4><div class="modal-challenge"><div class="mc-label">المشكلة</div><div class="mc-body">الإشعارات المبنية على polling بطيئة ومكلفة. خدمات push الخارجية تضيف اعتمادية خارجية وتكاليف شهرية متكررة.</div></div><div class="modal-challenge"><div class="mc-label">الحل</div><div class="mc-body">طبّقت البث الفوري عبر <strong>Laravel Broadcasting + WebSockets (Reverb/Echo)</strong>: عندما يضع العميل طلباً، حدث Laravel Event يُطلَق فوراً ويُبَث للمطعم مباشرة عبر قناة خاصة — بدون أي polling وبدون أي خدمة سحابية خارجية مدفوعة (<strong>Zero-cost Third-party Dependency</strong>)، مع معالجة الطابور عبر <strong>Laravel Queues</strong> لضمان عدم حظر الطلب الأساسي.</div></div></div>
<div class="modal-sec"><h4>نموذج الأمان</h4><p>الواجهة الخلفية مبنية بالكامل على <strong>Laravel</strong> مع مصادقة عبر <strong>Sanctum</strong> وتفويض دقيق عبر <strong>Policies &amp; Gates</strong> بثلاثة أدوار معزولة: <code>customer</code> و<code>owner</code> و<code>admin</code>. كل طلب API يمر عبر middleware للتحقق من الهوية والصلاحية قبل الوصول لأي بيانات.</p></div>
<div class="modal-sec"><h4>الكاش</h4><p>طبقة <strong>Redis</strong> مدمجة في Laravel تجلس بين لوحة تحكم المالك وتطبيق القائمة العام. كل عملية تعديل تقوم بـ <strong>Cache Busting</strong> لكلا الكاشين في نفس الوقت — التغييرات تظهر فوراً للعملاء دون إرهاق قاعدة البيانات.</p></div>
<div class="modal-sec"><h4>التقنيات المستخدمة</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">Sanctum</span><span class="modal-tag">Laravel Reverb</span><span class="modal-tag">Queues</span><span class="modal-tag">MySQL</span><span class="modal-tag">Redis</span><span class="modal-tag">Nuxt 4</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Dexie / IndexedDB</span><span class="modal-tag">PWA</span><span class="modal-tag">Web Push</span><span class="modal-tag">Pinia</span><span class="modal-tag">Zod</span><span class="modal-tag">Tailwind CSS</span></div></div>`,
    en: `
<div class="modal-sec"><h4>The Idea</h4><p>Sufra (سُفرة) is a complete restaurant operating system. I identified that most restaurant management tools in the market were either too expensive, too complex, or not built for the Arabic-speaking market. I led all technical decisions from architecture to deployment — built on a <strong>Laravel</strong> backend, approached <strong>backend-first</strong> while also owning the frontend end-to-end (<strong>Full-Stack</strong>).</p></div>
<div class="modal-sec"><h4>What the Platform Covers</h4>
<p><strong>Partner Dashboard — Restaurant Owner</strong></p>
<div class="modal-feature-grid"><ul>
<li>Real-time order management and tracking</li>
<li>POS terminal with table management and cashier flows</li>
<li>Kitchen Display System (KDS) for order dispatch</li>
<li>Waiter-facing screen for table-side order entry</li>
<li>Menu: categories, items, offers, and pricing</li>
<li>Table layout and assignment management</li>
</ul><ul>
<li>Customer directory with full order history</li>
<li>Team management with role-based access control</li>
<li>Sales reports and analytics dashboard</li>
<li>Inventory management, suppliers, stock auditing</li>
<li>Full per-restaurant settings and customization</li>
</ul></div>
<p style="margin-top:14px"><strong>Customer-Facing (Public)</strong></p>
<ul><li>QR-based digital menu with rich item display</li><li>Online ordering with cart and checkout</li><li>Order history and tracking per customer</li></ul>
<p style="margin-top:14px"><strong>Super-Admin</strong></p>
<ul><li>Full control over all restaurants and users</li><li>Subscription and plan management</li><li>Detailed per-restaurant statistics and activity</li><li>Announcement system for platform-wide communication</li></ul></div>
<div class="modal-sec"><h4>Challenge 1 — The POS must work without internet</h4><div class="modal-challenge"><div class="mc-label">Problem</div><div class="mc-body">Restaurants in Gaza face frequent internet outages. A POS that stops working when the connection drops is not a product — it's a liability.</div></div><div class="modal-challenge"><div class="mc-label">Solution</div><div class="mc-body">I built an offline-first POS using an <strong>IndexedDB outbox queue</strong> on the frontend, syncing against a <strong>Laravel REST API</strong>: all mutations (orders, payments, status changes) are written locally first, then pushed to dedicated sync endpoints once connectivity resumes. The cashier never notices an outage. Zero order loss.</div></div></div>
<div class="modal-sec"><h4>Challenge 2 — Real-time notifications without a third-party service</h4><div class="modal-challenge"><div class="mc-label">Problem</div><div class="mc-body">Polling-based notifications are slow and wasteful. Third-party push services add recurring monthly costs and external dependencies.</div></div><div class="modal-challenge"><div class="mc-label">Solution</div><div class="mc-body">I implemented real-time broadcasting with <strong>Laravel Broadcasting + WebSockets (Reverb/Echo)</strong>: when a customer places an order, a Laravel event fires instantly and is broadcast straight to the restaurant on a private channel — no polling, no paid third-party service (<strong>Zero-cost Third-party Dependency</strong>), with <strong>Laravel Queues</strong> handling the dispatch so the request/response cycle is never blocked.</div></div></div>
<div class="modal-sec"><h4>Security Model</h4><p>The backend is built entirely on <strong>Laravel</strong>, with authentication via <strong>Sanctum</strong> and fine-grained authorization through <strong>Policies &amp; Gates</strong> across three isolated roles: <code>customer</code>, <code>owner</code>, and <code>admin</code>. Every API request passes through middleware that verifies identity and permission before touching any data.</p></div>
<div class="modal-sec"><h4>Caching</h4><p>A <strong>Redis</strong> cache layer built into Laravel sits between the owner dashboard and the public menu app. Every mutation performs <strong>Cache Busting</strong> on both caches simultaneously — menu changes reflect instantly for customers without hammering the database.</p></div>
<div class="modal-sec"><h4>Tech Stack</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">Sanctum</span><span class="modal-tag">Laravel Reverb</span><span class="modal-tag">Queues</span><span class="modal-tag">MySQL</span><span class="modal-tag">Redis</span><span class="modal-tag">Nuxt 4</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Dexie / IndexedDB</span><span class="modal-tag">PWA</span><span class="modal-tag">Web Push</span><span class="modal-tag">Pinia</span><span class="modal-tag">Zod</span><span class="modal-tag">Tailwind CSS</span></div></div>`
  },
  bfm: {
    ar: `
<div class="modal-sec"><h4>الهندسة العكسية والتطوير في بيئة قائمة</h4><p>انضممت إلى نظام معقد مكوّن من 7 مستودعات نشطة بدون توثيق مسبق (<strong>Zero Handover Documentation</strong>)، ونجحت في استيعاب المعمارية كاملاً والمساهمة الفورية في توسيع المنصة — هندسة عكسية حقيقية للكود الإنتاجي الحي.</p></div>
<div class="modal-sec"><h4>ما تغطيه المنصة</h4>
<p><strong>لوحة تحكم صاحب العمل</strong></p>
<div class="modal-feature-grid"><ul>
<li>لوحة إحصاءات مع تحليلات تفصيلية للأعمال</li>
<li>إدارة الحجوزات: تقويم، إعادة جدولة، تاريخ مع تصدير</li>
<li>إدارة الموارد (غرف، كراسي، محطات) مع منع التعارض</li>
<li>إدارة الموظفين: ملفات، ورديات، ساعات عمل، تعيين خدمات</li>
<li>إدارة الفروع للشركات متعددة المواقع</li>
<li>تجارة إلكترونية: منتجات وخصومات وكوبونات</li>
<li>إدارة مخزون وموردين وتدقيق</li>
</ul><ul>
<li>نظام عضويات واشتراكات</li>
<li>نظام ولاء وهدايا</li>
<li>تذكيرات ونظام إشعارات آلي</li>
<li>إدارة حزم SMS مع تتبع الاستهلاك</li>
<li>نظام إعلانات</li>
<li>تقارير تفصيلية عبر جميع الوحدات</li>
<li>بوابات دفع متعددة العملات (5+ عملات)</li>
</ul></div>
<p style="margin-top:14px"><strong>تطبيق الموظف</strong></p>
<ul><li>جدول الحجوزات الشخصي وإدارة الطابور</li><li>تحديثات حالة الحجوزات في الوقت الفعلي</li></ul>
<p style="margin-top:14px"><strong>واجهة العميل</strong></p>
<ul><li>حجز إلكتروني مع اختيار الموظف وتوفر فوري</li><li>كشف التعارضات لمنع الحجز المزدوج</li><li>شراء منتجات وعضويات إلكتروني</li><li>دمج بوابة الدفع</li></ul></div>
<div class="modal-sec"><h4>تحدي إدارة التعارض — Conflict Prevention</h4><div class="modal-challenge"><div class="mc-label">التحدي</div><div class="mc-body">المنصة تخدم شركات متعددة الفروع، كل فرع بموارد (غرف، كراسي، محطات) وموظفين يعملون بساعات محددة. الحجز المزدوج لنفس المورد أو الموظف في نفس الوقت كان مشكلة حقيقية تؤثر مباشرة على العملاء.</div></div><div class="modal-challenge"><div class="mc-label">الحل</div><div class="mc-body">بنيت آلية <strong>Conflict Detection</strong> على مستوى الـ Backend تتحقق عند كل حجز من توفر المورد والموظف في الفترة الزمنية المطلوبة عبر جميع الفروع — مع منع الحجز المزدوج (<strong>Double-Booking Prevention</strong>) بشكل ذري قبل تأكيد أي حجز.</div></div></div>
<div class="modal-sec"><h4>الحجم</h4><p>7 مستودعات: سوبر آدمن، microservice للـ onboarding، API الشركاء، لوحة الشركاء (Nuxt 3)، تطبيق حجز العملاء (Nuxt 3)، تطبيق الموظف، وصفحات المتاجر العامة. ميزات الوقت الفعلي مدعومة بـ <strong>Laravel Reverb WebSockets</strong>. دعم ثنائي اللغة (عربي/إنجليزي) مع RTL كامل.</p></div>
<div class="modal-sec"><h4>التقنيات المستخدمة</h4><div class="modal-tags"><span class="modal-tag">Laravel 11</span><span class="modal-tag">PHP 8.2/8.3</span><span class="modal-tag">Nuxt 3</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Laravel Reverb</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">AWS S3</span><span class="modal-tag">Yajra DataTables</span><span class="modal-tag">Tailwind CSS</span></div></div>`,
    en: `
<div class="modal-sec"><h4>Reverse Engineering &amp; Brownfield Development</h4><p>I joined a complex, 7-repository production system with <strong>zero documentation handover</strong>. I reverse-engineered the live codebase to map the architecture, then contributed immediately — expanding the platform and hardening its stability without a single onboarding session.</p></div>
<div class="modal-sec"><h4>What the Platform Covers</h4>
<p><strong>Partner Dashboard — Business Owner</strong></p>
<div class="modal-feature-grid"><ul>
<li>Statistics dashboard with detailed business analytics</li>
<li>Booking management: calendar view, rescheduling, history with export</li>
<li>Resource management (rooms, chairs, stations) with conflict prevention</li>
<li>Staff management: profiles, shifts, working hours, service assignments</li>
<li>Branch management for multi-location businesses</li>
<li>Internal e-commerce: products, discounts, coupon system</li>
<li>Inventory management, suppliers, and stock auditing</li>
</ul><ul>
<li>Membership and subscription system</li>
<li>Loyalty and gifting system</li>
<li>Reminders and automated notification system</li>
<li>SMS package management with consumption tracking</li>
<li>Announcement system</li>
<li>Detailed reports across all modules</li>
<li>Multi-currency payment gateway (5+ currencies)</li>
</ul></div>
<p style="margin-top:14px"><strong>Employee App</strong></p>
<ul><li>Personal booking schedule and queue management</li><li>Real-time booking status updates</li></ul>
<p style="margin-top:14px"><strong>Customer-Facing</strong></p>
<ul><li>Online booking with staff selection and real-time availability</li><li>Conflict detection to prevent double-booking</li><li>Online product and membership purchasing</li><li>Payment gateway integration</li></ul></div>
<div class="modal-sec"><h4>Conflict Prevention Engineering</h4><div class="modal-challenge"><div class="mc-label">Challenge</div><div class="mc-body">The platform serves multi-branch businesses where resources (rooms, chairs, stations) and staff have defined working hours. Double-booking the same resource or staff member across time slots was a real problem that directly affected end customers.</div></div><div class="modal-challenge"><div class="mc-label">Solution</div><div class="mc-body">I built a backend <strong>Conflict Detection</strong> layer that validates resource and staff availability for the requested time slot across all branches on every booking attempt — enforcing <strong>atomic Double-Booking Prevention</strong> before any booking is confirmed.</div></div></div>
<div class="modal-sec"><h4>The Scale</h4><p>7 repositories: super-admin back-office, partner onboarding microservice, partner management API, partner dashboard (Nuxt 3), customer booking app (Nuxt 3), employee app, and public store profiles. Real-time features powered by <strong>Laravel Reverb WebSockets</strong>. Full Arabic/English bilingual support with RTL layout switching throughout.</p></div>
<div class="modal-sec"><h4>Tech Stack</h4><div class="modal-tags"><span class="modal-tag">Laravel 11</span><span class="modal-tag">PHP 8.2/8.3</span><span class="modal-tag">Nuxt 3</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Laravel Reverb</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">AWS S3</span><span class="modal-tag">Yajra DataTables</span><span class="modal-tag">Tailwind CSS</span></div></div>`
  },
  uop: {
    ar: `
<div class="modal-sec"><h4>المشكلة</h4><div class="modal-challenge"><div class="mc-label">الخلل المعماري</div><div class="mc-body">الملفات الثنائية — الصور والمستندات وملفات PDF — كانت مخزّنة مباشرة كـ BLOBs داخل قاعدة البيانات. كل صفحة تعرض صوراً كانت تسحب بيانات ثنائية ضخمة عبر محرك قاعدة البيانات، مما يسبب ضغطاً شديداً على الخادم، بطئاً في التحميل، وتكلفة بنية تحتية مرتفعة. الملف الواحد أيضاً قد يُرفع مرات متعددة بدون أي آلية لإعادة الاستخدام.</div></div></div>
<div class="modal-sec"><h4>الحل — نظام ملفات Polymorphic</h4><div class="modal-challenge"><div class="mc-label">التصميم</div><div class="mc-body">أعدت تصميم بنية تخزين الملفات بالكامل:<br><br>• جدول <code>files</code> — يخزن metadata الملف والمسار (سجل واحد لكل ملف فعلي)<br>• جدول <code>file_assignments</code> — يربط الملفات بأي نموذج باستخدام <code>assignable_type / assignable_id</code><br><br>الملف المُرفوع مرة واحدة يُستخدم عبر الأخبار والفعاليات والمعارض والكليات وأي نموذج آخر. عند الرفع، الصور تُضغط وتُحوَّل لـ <strong>WebP</strong>، والمستندات تُعالَج لاستخراج <strong>thumbnail</strong>.</div></div></div>
<div class="modal-sec"><h4>تحدي الهجرة</h4><div class="modal-challenge"><div class="mc-label">القيد</div><div class="mc-body">قاعدة البيانات القديمة تحتوي على 10+ سنوات من بيانات الإنتاج التي لا يمكن خسارتها أو تعطيلها.</div></div><div class="modal-challenge"><div class="mc-label">الحل</div><div class="mc-body">بنيت <strong>Artisan migration command</strong> مخصصاً يتصل بالقاعدتين في وقت واحد، يستخرج كل ملف ثنائي، يعالجه، يخزّنه في النظام الجديد، ويدرج سجلات نظيفة ومنظّمة — بدون أي فقدان للبيانات.</div></div></div>
<div class="modal-sec"><h4>مزامنة FTP</h4><div class="modal-challenge"><div class="mc-label">القيد</div><div class="mc-body">الخادم الرئيسي للعميل خاص والموقع العام يسحب الأصول من FTP — تأخير المزامنة كان سيُعطّل تجربة الرفع.</div></div><div class="modal-challenge"><div class="mc-label">الحل</div><div class="mc-body">طبّقت جدول <code>file_sync_logs</code> لتتبع حالة المزامنة، و<strong>Queue Job</strong> يعمل في الخلفية بعد اكتمال الطلب الرئيسي، مع منطق إعادة محاولة تلقائي. تأخير FTP مفصول تماماً عن تجربة المستخدم.</div></div></div>
<div class="modal-sec"><h4>النتيجة</h4><p>تحرير كامل لمحرك قاعدة البيانات من اختناق الأصول الثنائية، وتقليص الحجم التخزيني الأساسي للداتابيز بشكل جوهري، مع تسريع زمن تحميل الصفحات (<strong>Page Load Time</strong>) بفضل أصول الـ WebP والمزامنة الخلفية المفصولة عن تجربة الرفع.</p></div>
<div class="modal-sec"><h4>التقنيات المستخدمة</h4><div class="modal-tags"><span class="modal-tag">Laravel 12</span><span class="modal-tag">Nuxt 4</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Inertia.js</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">OpenAPI 3.0</span><span class="modal-tag">TypeScript</span><span class="modal-tag">Queue Jobs</span><span class="modal-tag">FTP Sync</span></div></div>`,
    en: `
<div class="modal-sec"><h4>The Problem</h4><div class="modal-challenge"><div class="mc-label">Architectural Flaw</div><div class="mc-body">Binary files — images, documents, PDFs — were stored directly as BLOBs inside the database. Every page load pulled large binary data through the database engine, causing severe server load, slow page times, high infrastructure cost, and no file reuse mechanism.</div></div></div>
<div class="modal-sec"><h4>The Solution — Polymorphic File System</h4><div class="modal-challenge"><div class="mc-label">Design</div><div class="mc-body">I redesigned the entire file storage architecture:<br><br>• <code>files</code> table — stores file metadata and path (one record per physical file)<br>• <code>file_assignments</code> table — links files to any model using <code>assignable_type / assignable_id</code><br><br>A single upload is stored once and reused across news posts, events, galleries, colleges, or any other model. On upload, images are compressed and converted to <strong>WebP</strong>; documents are processed to extract a <strong>thumbnail</strong> as the cover image.</div></div></div>
<div class="modal-sec"><h4>The Migration Challenge</h4><div class="modal-challenge"><div class="mc-label">Constraint</div><div class="mc-body">The legacy database contained 10+ years of production data that couldn't be lost or interrupted.</div></div><div class="modal-challenge"><div class="mc-label">Solution</div><div class="mc-body">I built a custom <strong>Artisan migration command</strong> that connected to both databases simultaneously, extracted each binary file from the old schema, processed it, stored it in the new file system, and inserted clean normalized records — without any data loss.</div></div></div>
<div class="modal-sec"><h4>FTP Sync</h4><div class="modal-challenge"><div class="mc-label">Constraint</div><div class="mc-body">The client's main server is private and the external public website pulls assets from an FTP server — sync latency would block uploads.</div></div><div class="modal-challenge"><div class="mc-label">Solution</div><div class="mc-body">I implemented a <code>file_sync_logs</code> table to track sync status per file, a <strong>background Queue Job</strong> that handles FTP upload after the main request completes, and automatic retry logic on failure. FTP sync is completely decoupled from the user's upload experience.</div></div></div>
<div class="modal-sec"><h4>Result</h4><p>The database engine was fully freed from binary asset bottlenecks — core storage footprint reduced dramatically. <strong>Page Load Time</strong> improved through WebP asset delivery and decoupled background FTP sync. A single upload now serves every model on the platform indefinitely.</p></div>
<div class="modal-sec"><h4>Tech Stack</h4><div class="modal-tags"><span class="modal-tag">Laravel 12</span><span class="modal-tag">Nuxt 4</span><span class="modal-tag">Vue 3</span><span class="modal-tag">Inertia.js</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">OpenAPI 3.0</span><span class="modal-tag">TypeScript</span><span class="modal-tag">Queue Jobs</span><span class="modal-tag">FTP Sync</span></div></div>`
  },
  taskat: {
    ar: `
<div class="modal-sec"><h4>ما هو</h4><p>تسكات يعطي فرق البرمجيات كل ما يحتاجونه للتخطيط والشحن: مشاريع، مشكلات، لوحات كانبان، سبرنتات، حالات مخصصة، تسميات، أولويات، مرفقات ملفات، وبحث عالمي — مدمجاً مع طبقة رسائل الفريق حتى يبقى السياق والتواصل في نفس المكان.</p></div>
<div class="modal-sec"><h4>معمارية الواجهة الخلفية</h4>
<div class="modal-challenge"><div class="mc-label">معمارية تعدد المستأجرين المعزولة — Isolated Multi-tenancy</div><div class="mc-body"><strong>Workspaces متعددة المستأجرين</strong> تحت اشتراك واحد — نشر واحد يخدم فرقاً متعددة معزولة تماماً بدون تعقيد بنية تحتية إضافي ودون أي تسرب للبيانات بين الـ workspaces.</div></div>
<div class="modal-challenge"><div class="mc-label">نظام الصلاحيات الديناميكي على مستوى المشروع — Project-Scoped Dynamic RBAC</div><div class="mc-body">تجاوزت الـ RBAC التقليدي المبني على أدوار عالمية ثابتة: كل مستخدم يحمل مجموعة صلاحيات <strong>مختلفة لكل مشروع</strong> يتصفحه — بمعنى أن المستخدم قد يكون Admin في مشروع A و Viewer في مشروع B في نفس الوقت، مع دعم كامل للعضوية المتزامنة.</div></div>
<div class="modal-challenge"><div class="mc-label">الوقت الفعلي عبر WebSockets</div><div class="mc-body">تحديثات اللوحة والإشعارات والرسائل جميعها حية بدون polling — أي تغيير في اللوحة يظهر فوراً لجميع أعضاء الفريق المتصلين.</div></div>
<div class="modal-challenge"><div class="mc-label">دورة حياة السبرنت الكاملة</div><div class="mc-body"><strong>Sprint lifecycle management</strong>: إنشاء وبدء وإكمال السبرنتات مع عمليات جماعية على المشكلات وإدارة تلقائية للـ backlog عند نهاية كل sprint.</div></div></div>
<div class="modal-sec"><h4>التقنيات المستخدمة</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">PHP 8+</span><span class="modal-tag">Nuxt 3</span><span class="modal-tag">Vue 3</span><span class="modal-tag">WebSockets</span><span class="modal-tag">Laravel Broadcasting</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">Redis</span><span class="modal-tag">Tailwind CSS</span></div></div>`,
    en: `
<div class="modal-sec"><h4>What It Is</h4><p>Taskat gives software teams everything they need to plan and ship: projects, issues, kanban boards, sprints, custom statuses, labels, priorities, file attachments, and global search — combined with a team messaging layer so context and communication stay in one place.</p></div>
<div class="modal-sec"><h4>Backend Architecture</h4>
<div class="modal-challenge"><div class="mc-label">Isolated Multi-tenancy Architecture</div><div class="mc-body"><strong>Multi-tenant workspaces</strong> under a single subscription — one deployment serves multiple fully isolated teams with zero data leakage between workspaces, at a fraction of the infrastructure overhead of per-team deployments.</div></div>
<div class="modal-challenge"><div class="mc-label">Project-Scoped Dynamic RBAC</div><div class="mc-body">Goes beyond traditional flat RBAC: each user carries a <strong>different permission set per project</strong> — the same user can be an Admin on Project A and a Viewer on Project B simultaneously. Permissions resolve dynamically based on the project currently being accessed, not a single global role.</div></div>
<div class="modal-challenge"><div class="mc-label">Real-time via WebSockets</div><div class="mc-body">Board updates, notifications, and messaging are all live without polling — any board change is reflected instantly for every connected team member.</div></div>
<div class="modal-challenge"><div class="mc-label">Full Sprint Lifecycle</div><div class="mc-body">Create, start, and complete sprints with bulk issue operations and automatic backlog handling at sprint close — a full Agile workflow engine, not just a task list.</div></div></div>
<div class="modal-sec"><h4>Tech Stack</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">PHP 8+</span><span class="modal-tag">Nuxt 3</span><span class="modal-tag">Vue 3</span><span class="modal-tag">WebSockets</span><span class="modal-tag">Laravel Broadcasting</span><span class="modal-tag">Sanctum</span><span class="modal-tag">MySQL</span><span class="modal-tag">Redis</span><span class="modal-tag">Tailwind CSS</span></div></div>`
  },
  netspeed: {
    ar: `
<div class="modal-sec"><h4>المشكلة</h4><div class="modal-challenge"><div class="mc-label">شكوى العميل</div><div class="mc-body">صاحب المنصة جاء بشكوى مباشرة: النظام بطيء، والمستخدمون يلاحظون. المنصة كانت تخدم 10,000+ مستخدم نشط متزامن عبر إدارة بطاقات الإنترنت، مكافآت الولاء، تذاكر الدعم، والعمليات الميدانية — وكانت تعاني تحت الحمل.</div></div></div>
<div class="modal-sec"><h4>ما فعلته</h4><div class="modal-challenge"><div class="mc-label">الأداء</div><div class="mc-body">حللت أكثر استعلامات قاعدة البيانات تكلفةً ودمجت <strong>Redis caching</strong> عبر المسارات الحرجة. النتيجة: ~60% انخفاض في حمل قاعدة البيانات وزمن استجابة API أقل من 200ms في أوقات الذروة.</div></div><div class="modal-challenge"><div class="mc-label">إعادة بناء واجهة المستخدم</div><div class="mc-body">أعدت بناء الواجهة الموجّهة للعملاء لبوابة إدارة بطاقات الإنترنت — الجزء الأكثر استخداماً. بسّطت التدفقات الرئيسية حتى تطلّبت الإجراءات الشائعة خطوات أقل.</div></div><div class="modal-challenge"><div class="mc-label">تكامل العتاد — Hardware Integration</div><div class="mc-body">طوّرت وأمّنت الـ <strong>Hotspot API</strong> المخصص للاتصال مباشرة مع روترات وأجهزة الشبكة الخارجية — يتحقق من بطاقات الإنترنت ويُفعّلها بشكل فوري وآمن عند اتصال المستخدم بالشبكة.</div></div></div>
<div class="modal-sec"><h4>المنصة</h4>
<ul>
<li>إدارة بطاقات الإنترنت: تفعيل، تجديد، والتحكم بالبطاقات</li>
<li>نظام نقاط ولاء وهدايا (هدايا مادية وبطاقات)</li>
<li>تذاكر دعم فني كاملة مع تصنيف وتاريخ</li>
<li>عمليات ميدانية: إصلاحات شبكات، إصلاحات عملاء، تركيبات جديدة</li>
<li>لوحة إدارة مع RBAC وسجل نشاط وتاريخ تسجيل الدخول ورسوم بيانية حية</li>
</ul></div>
<div class="modal-sec"><h4>التقنيات المستخدمة</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">PHP 8+</span><span class="modal-tag">Redis Cache</span><span class="modal-tag">MySQL</span><span class="modal-tag">AdminLTE</span><span class="modal-tag">jQuery</span><span class="modal-tag">Blade</span><span class="modal-tag">Hotspot API</span><span class="modal-tag">RBAC</span></div></div>`,
    en: `
<div class="modal-sec"><h4>The Problem</h4><div class="modal-challenge"><div class="mc-label">Client complaint</div><div class="mc-body">The platform owner came with a direct complaint: the system is slow, and users notice. The platform was serving 10,000+ concurrent active users across internet card management, loyalty rewards, support ticketing, and field operations — and it was struggling under the load.</div></div></div>
<div class="modal-sec"><h4>What I Did</h4><div class="modal-challenge"><div class="mc-label">Performance</div><div class="mc-body">Profiled the most expensive database queries and integrated <strong>Redis caching</strong> across the critical paths. Result: ~60% reduction in database load and sub-200ms average API response time under peak load.</div></div><div class="modal-challenge"><div class="mc-label">UI/UX Overhaul</div><div class="mc-body">Rebuilt the client-facing interface for the internet card management portal — the most-used part of the system. Simplified the primary user flows so the most common actions required fewer steps.</div></div><div class="modal-challenge"><div class="mc-label">Hardware Integration</div><div class="mc-body">Developed and secured a custom <strong>Hotspot API</strong> that communicates directly with external routers and network hardware — validating and activating internet cards instantly and securely at the moment a user connects to the network.</div></div></div>
<div class="modal-sec"><h4>The Platform</h4>
<ul>
<li>Internet card management: activation, renewal, and card control</li>
<li>Points-based loyalty and gifting system (physical and card gifts)</li>
<li>Full support ticketing with categorization and history</li>
<li>Field operations: network repairs, client repairs, new installations</li>
<li>Admin dashboard with RBAC, activity logging, login history, and real-time charts</li>
</ul></div>
<div class="modal-sec"><h4>Tech Stack</h4><div class="modal-tags"><span class="modal-tag">Laravel</span><span class="modal-tag">PHP 8+</span><span class="modal-tag">Redis Cache</span><span class="modal-tag">MySQL</span><span class="modal-tag">AdminLTE</span><span class="modal-tag">jQuery</span><span class="modal-tag">Blade</span><span class="modal-tag">Hotspot API</span><span class="modal-tag">RBAC</span></div></div>`
  }
};

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = lang === 'ar'
    ? 'محمد النملة — مطوّر الواجهة الخلفية'
    : 'Mohammed Al-Namla — Backend Developer';
  const t = i18n[lang];
  /* plain text nodes */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  /* innerHTML nodes (contain <strong> etc.) */
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  /* placeholder attributes */
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  /* modal body blocks */
  document.querySelectorAll('[data-i18n-modal]').forEach(el => {
    const key = el.dataset.i18nModal;
    if (modalBodies[key] && modalBodies[key][lang]) el.innerHTML = modalBodies[key][lang];
  });
  /* cinematic projects re-render with new language */
  populateCards(lang);
  /* toggle button label */
  document.getElementById('lang-toggle').textContent = lang === 'ar' ? 'EN' : 'ع';
  /* proj open btns */
  document.querySelectorAll('.proj-cta [data-i18n]').forEach(span => {
    span.textContent = t['projects.openBtn'] || (lang === 'ar' ? 'عرض التفاصيل' : 'Open case study');
  });
  /* text lengths changed — page height may differ */
  updateScrollableH();
}

function toggleLang() {
  applyLang(currentLang === 'ar' ? 'en' : 'ar');
}

function toggleMobileMenu() {
  const burger = document.getElementById('nav-burger');
  const drawer = document.getElementById('nav-drawer');
  const open = drawer.classList.toggle('open');
  burger.classList.toggle('open', open);
}
function closeMobileMenu() {
  document.getElementById('nav-burger').classList.remove('open');
  document.getElementById('nav-drawer').classList.remove('open');
}

/* init */
applyLang(currentLang);
projectState.current = '';
activateCard('sufra');
