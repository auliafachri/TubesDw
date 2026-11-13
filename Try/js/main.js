(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animasi kemunculan saat scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* Transisi antar halaman: tirai naik lalu pindah halaman */
  const curtain = $('#curtain');
  addEventListener('pageshow', () => { curtain.className = 'curtain out'; });
  $$('a[href]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (rm || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || !/\.html(\?|#|$)/.test(h) || /^https?:/.test(h)) return;
    e.preventDefault();
    curtain.className = 'curtain in';
    setTimeout(() => { location.href = h; }, 450);
  }));

  /* Filter portofolio (+ dukung ?f=kategori) */
  const btns = $$('[data-f]');
  const apply = f => {
    btns.forEach(b => b.classList.toggle('active', b.dataset.f === f));
    $$('#grid [data-c]').forEach(c => {
      const ok = f === 'all' || c.dataset.c.split(' ').includes(f);
      c.classList.toggle('is-hidden', !ok);
      if (ok) { c.classList.remove('show'); requestAnimationFrame(() => c.classList.add('show')); }
    });
  };
  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.f)));
  if (btns.length) { const q = new URLSearchParams(location.search).get('f'); if (q && btns.some(b => b.dataset.f === q)) apply(q); }

  /* Lightbox galeri (modal Bootstrap) */
  const im = $('#imgModal');
  if (im) im.addEventListener('show.bs.modal', e => {
    const src = $('img', e.relatedTarget), big = $('#imgBig');
    big.setAttribute('style', src.getAttribute('style')); big.alt = src.alt; $('#imgTitle').textContent = src.alt;
  });

  /* Form: validasi HTML5 + alert Bootstrap */
  const form = $('#brief');
  if (form) {
    form.addEventListener('invalid', () => form.classList.add('was-validated'), true);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      $('#notif').innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert">Terima kasih, <b>' +
        $('#nama').value.replace(/[<>&]/g, '') + '</b>! Brief kamu sudah kami terima dan akan dibalas lewat email.' +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Tutup"></button></div>';
      form.reset(); form.classList.remove('was-validated');
    });
  }

  /* Lanyard: seret untuk memutar & mengayun */
  $$('.lan').forEach((lan, i) => {
    const sw = $('.sw', lan), bd = $('.bd', lan);
    let a = 0, av = 0, s = 0, sv = 0, t = i, drag = false, lx = 0;
    lan.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; lan.setPointerCapture(e.pointerId); });
    lan.addEventListener('pointermove', e => {
      if (!drag) return;
      const d = e.clientX - lx; lx = e.clientX;
      s += d * .8; sv = d * .8; a = Math.max(-28, Math.min(28, a + d * .1)); av = 0;
    });
    ['pointerup', 'pointercancel'].forEach(ev => lan.addEventListener(ev, () => drag = false));
    lan.addEventListener('dblclick', () => sv = 22);
    (function loop() {
      if (!drag) { s += sv; sv *= .965; av += -a * .012; av *= .985; a += av; }
      if (!rm) t += .02;
      sw.style.transform = `rotate(${a + Math.sin(t) * 1.3}deg)`;
      bd.style.transform = `rotateY(${s}deg)`;
      requestAnimationFrame(loop);
    })();
  });
})();
