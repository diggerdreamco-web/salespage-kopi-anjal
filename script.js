// ============ CHECKOUT SYSTEM ============
const modal = document.getElementById('checkoutModal');
const closeBtn = document.getElementById('closeModal');
const checkoutForm = document.getElementById('checkoutForm');
const selectedPackageEl = document.getElementById('selectedPackage');
const summaryPackageEl = document.getElementById('summaryPackage');
const summaryTotalEl = document.getElementById('summaryTotal');
const customRow = document.getElementById('customRow');
const summaryCustom = document.getElementById('summaryCustom');
const jerseysContainer = document.getElementById('jerseysContainer');

const CUSTOM_PRICE = 5;
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PACKAGE_LABELS = {
  single: { name: 'Sehelai Jersi', jerseys: ['Jersi'] },
  combo2: { name: 'Kombo Home + Away', jerseys: ['Home', 'Away'] },
  combo4: { name: 'Kombo Lengkap', jerseys: ['Home', 'Away', 'Keeper Home', 'Keeper Away'] },
};

let selectedPackage = null;
let selectedPrice = 0;
let selectedJerseys = 1;

// Build jersey selector form
function buildJerseyForm(pkgKey) {
  const pkg = PACKAGE_LABELS[pkgKey];
  if (!pkg) return;

  jerseysContainer.innerHTML = '';

  // For single jersey, add type selector
  if (pkgKey === 'single') {
    jerseysContainer.innerHTML += `
      <div class="jersey-item">
        <div class="jersey-item-title">Jersi #1</div>
        <div class="form-group">
          <label>Pilih Jenis Jersi *</label>
          <select class="jersey-type" required>
            <option value="">— Pilih Jenis —</option>
            <option value="Home">Home</option>
            <option value="Away">Away</option>
            <option value="Keeper Home">Keeper Home</option>
            <option value="Keeper Away">Keeper Away</option>
          </select>
        </div>
        <div class="form-group">
          <label>Saiz *</label>
          <select class="jersey-size" required>
            <option value="">— Pilih Saiz —</option>
            ${SIZES.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <label class="jersey-custom-toggle">
          <input type="checkbox" class="custom-check"> Tambah Nama / Nombor (+RM${CUSTOM_PRICE})
        </label>
        <div class="jersey-custom-fields">
          <div class="form-group" style="margin:0">
            <label>Nama (max 12 huruf)</label>
            <input type="text" class="jersey-name" maxlength="12" placeholder="cth: AZAM">
          </div>
          <div class="form-group" style="margin:0">
            <label>No.</label>
            <input type="text" class="jersey-number" maxlength="3" placeholder="10">
          </div>
        </div>
      </div>
    `;
  } else {
    pkg.jerseys.forEach((type, i) => {
      jerseysContainer.innerHTML += `
        <div class="jersey-item" data-type="${type}">
          <div class="jersey-item-title">Jersi ${i + 1} — ${type}</div>
          <div class="form-group">
            <label>Saiz *</label>
            <select class="jersey-size" required>
              <option value="">— Pilih Saiz —</option>
              ${SIZES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <label class="jersey-custom-toggle">
            <input type="checkbox" class="custom-check"> Tambah Nama / Nombor (+RM${CUSTOM_PRICE})
          </label>
          <div class="jersey-custom-fields">
            <div class="form-group" style="margin:0">
              <label>Nama (max 12 huruf)</label>
              <input type="text" class="jersey-name" maxlength="12" placeholder="cth: AZAM">
            </div>
            <div class="form-group" style="margin:0">
              <label>No.</label>
              <input type="text" class="jersey-number" maxlength="3" placeholder="10">
            </div>
          </div>
        </div>
      `;
    });
  }

  // Bind custom checkbox toggle
  document.querySelectorAll('.custom-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const fields = chk.closest('.jersey-item').querySelector('.jersey-custom-fields');
      fields.classList.toggle('active', chk.checked);
      updateSummary();
    });
  });
}

function getCustomCount() {
  return document.querySelectorAll('.custom-check:checked').length;
}

function updateSummary() {
  if (!selectedPackage) return;
  const customCount = getCustomCount();
  const customTotal = customCount * CUSTOM_PRICE;
  const finalPrice = selectedPrice + customTotal;

  if (customCount > 0) {
    summaryCustom.textContent = `+RM${customTotal} (${customCount} helai)`;
    customRow.style.display = 'flex';
  } else {
    customRow.style.display = 'none';
  }

  summaryTotalEl.textContent = `RM${finalPrice}`;
}

// Package selection
document.querySelectorAll('.select-package').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.price-card');
    selectedPackage = card.dataset.package;
    selectedPrice = parseInt(card.dataset.price);
    selectedJerseys = parseInt(card.dataset.jerseys);

    const pkg = PACKAGE_LABELS[selectedPackage];
    selectedPackageEl.textContent = `${pkg.name} — RM${selectedPrice}`;
    summaryPackageEl.textContent = `${pkg.name} (${selectedJerseys} helai) — RM${selectedPrice}`;

    buildJerseyForm(selectedPackage);
    updateSummary();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Close modal
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

const WA_NUMBER = '60123231524';

// Collect jersey details from form
function collectJerseyDetails() {
  const items = document.querySelectorAll('.jersey-item');
  const details = [];
  items.forEach((item, i) => {
    const typeEl = item.querySelector('.jersey-type');
    const type = typeEl ? typeEl.value : item.dataset.type;
    const size = item.querySelector('.jersey-size').value;
    const customCheck = item.querySelector('.custom-check').checked;
    const name = item.querySelector('.jersey-name').value;
    const number = item.querySelector('.jersey-number').value;
    details.push({
      no: i + 1,
      type,
      size,
      custom: customCheck,
      name: customCheck ? name : '',
      number: customCheck ? number : '',
    });
  });
  return details;
}

// Form submission
checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const customCount = getCustomCount();
  const totalPrice = selectedPrice + (customCount * CUSTOM_PRICE);
  const jerseyDetails = collectJerseyDetails();

  // Validate jersey types & sizes
  for (const j of jerseyDetails) {
    if (!j.size) { alert(`Sila pilih saiz untuk Jersi #${j.no}`); return; }
    if (!j.type) { alert(`Sila pilih jenis untuk Jersi #${j.no}`); return; }
    if (j.custom && (!j.name || !j.number)) {
      alert(`Sila isi nama & nombor untuk Jersi #${j.no} (${j.type})`); return;
    }
  }

  const checkedRadio = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = checkedRadio ? checkedRadio.value : 'toyyibpay';

  // Format jersey details into readable string
  const jerseySummary = jerseyDetails.map(j =>
    `${j.type} (${j.size})${j.custom ? ` - ${j.name} #${j.number}` : ''}`
  ).join(' | ');

  const formData = {
    package: selectedPackage,
    price: totalPrice,
    originalPrice: selectedPrice,
    customCount,
    customAmount: customCount * CUSTOM_PRICE,
    shipping: 0,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postcode: document.getElementById('postcode').value,
    jerseyDetails: jerseySummary,
    jerseys: jerseyDetails,
  };

  const payBtn = document.getElementById('payBtn');
  payBtn.textContent = 'Memproses...';
  payBtn.disabled = true;

  try {
    if (paymentMethod === 'qr') {
      const response = await fetch('/api/manual-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        showQrModal(formData, result.orderRef, result.packageName, totalPrice);
        closeModal();
      } else {
        alert(result.error || 'Gagal memproses order. Sila cuba lagi.');
      }
    } else {
      const response = await fetch('/api/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        const debugInfo = result.details ? `\n\nDetails: ${JSON.stringify(result.details)}` : '';
        const debugMsg = result.message ? `\n\nMessage: ${result.message}` : '';
        alert((result.error || 'Gagal mencipta pembayaran.') + debugInfo + debugMsg);
      }
    }
  } catch (err) {
    alert('Ralat sambungan. Sila semak internet anda dan cuba lagi.');
  } finally {
    payBtn.textContent = 'Bayar Sekarang';
    payBtn.disabled = false;
  }
});

// ============ QR MODAL ============
const qrModal = document.getElementById('qrModal');
const closeQrBtn = document.getElementById('closeQrModal');

function showQrModal(data, orderRef, packageName, amount) {
  document.getElementById('qrAmount').textContent = `RM${amount}`;
  document.getElementById('qrRef').textContent = orderRef;

  const message = encodeURIComponent(
    `Hai! Saya nak confirm order jersi YoungTiger:\n\n` +
    `Ref: ${orderRef}\n` +
    `Nama: ${data.name}\n` +
    `Pakej: ${packageName}\n` +
    `Detail Jersi: ${data.jerseyDetails}\n` +
    `Jumlah: RM${amount}\n` +
    `Telefon: ${data.phone}\n` +
    `Alamat: ${data.address}, ${data.postcode} ${data.city}, ${data.state}\n\n` +
    `Saya lampirkan resit pembayaran di bawah.`
  );
  document.getElementById('waConfirmBtn').href = `https://wa.me/${WA_NUMBER}?text=${message}`;

  qrModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQrModal() {
  qrModal.classList.remove('active');
  document.body.style.overflow = '';
}

closeQrBtn.addEventListener('click', closeQrModal);
qrModal.addEventListener('click', (e) => { if (e.target === qrModal) closeQrModal(); });

// Copy bank account
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.copy;
    const text = document.getElementById(targetId).textContent.replace(/\s+/g, '');
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Tersalin!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });
});

// ============ FAQ ACCORDION ============
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============ NAVBAR SCROLL ============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
});

// ============ SCROLL REVEAL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============ STICKY CTA ============
(function() {
  const stickyCta = document.getElementById('stickyCta');
  const orderSection = document.getElementById('order');
  if (!stickyCta || !orderSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      stickyCta.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0 });

  let started = false;
  window.addEventListener('scroll', () => {
    if (!started && window.scrollY > 600) {
      observer.observe(orderSection);
      started = true;
    }
  });
})();
