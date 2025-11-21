/* js/main.js
   Main interactivity:
   - Smooth scroll
   - Reveal on-scroll (IntersectionObserver)
   - Simulator (compound interest + monthly contribution)
   - Optional currency conversion via exchangerate.host
   - Contact form (client-side mock submit)
*/

// ===== Utilities =====
function formatRupiah(n){
  return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
}
function formatCurrency(n, code){
  if(code === 'IDR') return formatRupiah(n);
  return new Intl.NumberFormat('en-US',{style:'currency',currency:code,maximumFractionDigits:2}).format(n);
}
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Smooth scroll for internal links =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if(target){
      e.preventDefault();
      const offset = Math.max(0, target.offsetTop - 60);
      window.scrollTo({top: offset, behavior: 'smooth'});
    }
  });
});

// ===== Reveal on scroll =====
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
},{threshold: 0.12});
reveals.forEach(r => obs.observe(r));

// ===== Simulator logic =====
document.getElementById('calcBtn').addEventListener('click', async function(){
  const P = Number(document.getElementById('principal').value) || 0;
  const C = Number(document.getElementById('contrib').value) || 0;
  const r = (Number(document.getElementById('rate').value) || 0) / 100;
  const years = Number(document.getElementById('years').value) || 1;
  const currency = document.getElementById('currency').value || 'IDR';

  if(P < 0 || C < 0 || r < 0 || years <= 0){
    alert('Masukkan nilai yang valid.');
    return;
  }

  const n = 12;
  const periods = years * n;
  const monthlyRate = r / n;

  const fvPrincipal = P * Math.pow(1 + monthlyRate, periods);
  const fvContrib = (monthlyRate === 0) ? C * periods : C * ( (Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate );
  const total = fvPrincipal + fvContrib;

  let converted = null;
  if(currency !== 'IDR'){
    try{
      const resp = await fetch(`https://api.exchangerate.host/convert?from=IDR&to=${currency}&amount=${total}`);
      if(resp.ok){
        const data = await resp.json();
        if(data && data.result){
          converted = data.result;
        }
      }
    }catch(err){
      console.warn('Gagal mengambil kurs:', err);
    }
  }

  const resultEl = document.getElementById('result');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="muted">Total Proyeksi (setelah ${years} tahun)</div>
        <strong style="font-size:18px">${formatCurrency(total, 'IDR')}</strong>
        ${ converted ? `<div class="muted" style="margin-top:6px">≈ ${formatCurrency(converted, currency)}</div>` : '' }
      </div>
      <div style="text-align:right;color:var(--muted)">
        <div>Nilai Awal: <strong>${formatCurrency(P,'IDR')}</strong></div>
        <div>Kontribusi/bln: <strong>${formatCurrency(C,'IDR')}</strong></div>
        <div>Estimasi return: <strong>${(r*100).toFixed(2)}%</strong> p.a.</div>
      </div>
    </div>
  `;
});

// ===== Contact form (client-side mock) =====
document.getElementById('contactForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const msgEl = document.getElementById('contactMsg');

  if(!name || !email || !message){
    msgEl.style.display = 'block';
    msgEl.style.background = '#fff4f4';
    msgEl.style.color = '#9b1c1c';
    msgEl.textContent = 'Mohon isi semua field.';
    return;
  }

  msgEl.style.display = 'block';
  msgEl.style.background = '#eefbf4';
  msgEl.style.color = '#0b6efd';
  msgEl.textContent = 'Mengirim...';

  // For reference, include uploaded file path in the success message.
  const uploadedFilePath = '/mnt/data/TugasIPBW.pdf';

  await new Promise(res => setTimeout(res, 900));

  msgEl.style.background = '#e8fff4';
  msgEl.style.color = '#0b8a56';
  msgEl.innerHTML = 'Terima kasih! Pesan telah diterima (mock). ';
  const link = document.createElement('a');
  link.href = uploadedFilePath;
  link.target = '_blank';
  link.textContent = 'Buka File Tugas (PDF)';
  link.style.marginLeft = '8px';
  msgEl.appendChild(link);

  document.getElementById('contactForm').reset();
});

// ===== Small UI enhancements =====
['principal','contrib','rate','years'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') document.getElementById('calcBtn').click(); });
});
document.querySelectorAll('.card').forEach(c=>{
  c.addEventListener('mouseenter', ()=> c.classList.add('hovered'));
  c.addEventListener('mouseleave', ()=> c.classList.remove('hovered'));
});
