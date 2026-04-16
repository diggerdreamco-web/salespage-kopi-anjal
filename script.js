// ========== CHECKOUT SYSTEM ==========
const modal = document.getElementById('checkoutModal');
const closeBtn = document.getElementById('closeModal');
const checkoutForm = document.getElementById('checkoutForm');
const selectedPackageEl = document.getElementById('selectedPackage');
const summaryPackageEl = document.getElementById('summaryPackage');
const summaryTotalEl = document.getElementById('summaryTotal');

let selectedPackage = null;
let selectedPrice = 0;

// Package selection
document.querySelectorAll('.select-package').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.price-card');
    selectedPackage = card.dataset.package;
    selectedPrice = parseInt(card.dataset.price);

    const packageName = card.querySelector('h3').textContent;
    const packageDetails = card.querySelector('li').textContent;

    selectedPackageEl.textContent = `${packageName} — RM${selectedPrice}`;
    summaryPackageEl.textContent = `${packageName} (${packageDetails})`;
    summaryTotalEl.textContent = `RM${selectedPrice}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Close modal
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Form submission - checkout handler
checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check upsell
  const upsellChecked = document.getElementById('upsellCheck').checked;
  const totalPrice = upsellChecked ? selectedPrice + 39 : selectedPrice;

  const formData = {
    package: selectedPackage,
    price: totalPrice,
    upsell: upsellChecked ? 'Kopi Anjal Matcha x1' : null,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postcode: document.getElementById('postcode').value,
  };

  // ToyyibPay Payment Integration
  const payBtn = document.getElementById('payBtn');
  payBtn.textContent = 'Memproses...';
  payBtn.disabled = true;

  try {
    const response = await fetch('/api/create-bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.paymentUrl) {
      // Redirect to ToyyibPay payment page
      window.location.href = result.paymentUrl;
    } else {
      alert(result.error || 'Gagal mencipta pembayaran. Sila cuba lagi.');
      payBtn.textContent = 'Bayar Sekarang';
      payBtn.disabled = false;
    }
  } catch (err) {
    alert('Ralat sambungan. Sila semak internet anda dan cuba lagi.');
    payBtn.textContent = 'Bayar Sekarang';
    payBtn.disabled = false;
  }
});

// ========== FAQ ACCORDION ==========
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all others
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ========== SCROLL REVEAL ANIMATIONS ==========
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ========== PARALLAX HERO ORBS ==========
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const orbs = document.querySelectorAll('.hero-orb');
  orbs.forEach((orb, i) => {
    const speed = 0.15 + (i * 0.05);
    orb.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// ========== NUMBER COUNTER ANIMATION ==========
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      // Only animate pure numbers
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(num) && num > 0 && text.match(/^\d/)) {
        const suffix = text.replace(/[0-9]/g, '');
        const duration = 1500;
        const start = performance.now();

        function animate(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * num);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number, .social-bar-item .number').forEach(el => {
  counterObserver.observe(el);
});

// ========== UPSELL CHECKBOX ==========
const upsellCheck = document.getElementById('upsellCheck');
const upsellRow = document.getElementById('upsellRow');

upsellCheck.addEventListener('change', () => {
  const total = upsellCheck.checked ? selectedPrice + 39 : selectedPrice;
  summaryTotalEl.textContent = `RM${total}`;
  upsellRow.style.display = upsellCheck.checked ? 'flex' : 'none';
});

// ========== COUNTDOWN TIMER ==========
(function() {
  // Set countdown 3 hari dari sekarang, simpan dalam localStorage supaya konsisten
  let endTime = localStorage.getItem('ka_countdown_end');
  if (!endTime || parseInt(endTime) < Date.now()) {
    endTime = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 hari
    localStorage.setItem('ka_countdown_end', endTime);
  }
  endTime = parseInt(endTime);

  function update() {
    const now = Date.now();
    let diff = endTime - now;
    if (diff <= 0) {
      // Reset balik 3 hari
      endTime = Date.now() + (3 * 24 * 60 * 60 * 1000);
      localStorage.setItem('ka_countdown_end', endTime);
      diff = endTime - now;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
    document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cdMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cdSecs').textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
})();

// ========== LIVE VIEWER COUNTER ==========
(function() {
  const liveEl = document.getElementById('liveCount');
  if (!liveEl) return;

  // Random tapi realistic — turun naik antara 18-47
  let count = Math.floor(Math.random() * 20) + 20;
  liveEl.textContent = count;

  setInterval(() => {
    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
    count = Math.max(18, Math.min(47, count + change));
    liveEl.textContent = count;
  }, 4000);
})();

// ========== EXIT INTENT POPUP ==========
(function() {
  const exitPopup = document.getElementById('exitPopup');
  const closeExit = document.getElementById('closeExit');
  const exitCta = document.getElementById('exitCta');
  let shown = false;

  // Trigger bila mouse keluar dari viewport (desktop)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !shown && !sessionStorage.getItem('ka_exit_shown')) {
      exitPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
      shown = true;
      sessionStorage.setItem('ka_exit_shown', '1');
    }
  });

  // Mobile — trigger lepas 45 saat kat page
  setTimeout(() => {
    if (!shown && !sessionStorage.getItem('ka_exit_shown') && window.innerWidth < 768) {
      exitPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
      shown = true;
      sessionStorage.setItem('ka_exit_shown', '1');
    }
  }, 45000);

  function closeExitPopup() {
    exitPopup.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeExit.addEventListener('click', closeExitPopup);
  exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) closeExitPopup();
  });
  exitCta.addEventListener('click', closeExitPopup);

  // Copy discount code on click
  document.getElementById('discountCode').addEventListener('click', function() {
    navigator.clipboard.writeText('ANJAL10').then(() => {
      this.textContent = 'TERSALIN!';
      setTimeout(() => { this.textContent = 'ANJAL10'; }, 1500);
    });
  });
})();

// ========== STICKY CTA BAR ==========
(function() {
  const stickyCta = document.getElementById('stickyCta');
  const orderSection = document.getElementById('order');
  if (!stickyCta || !orderSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Tunjuk sticky bar bila order section dah tak nampak
      if (!entry.isIntersecting) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    });
  }, { threshold: 0 });

  // Mula observe lepas scroll sikit (jangan show kat hero)
  let started = false;
  window.addEventListener('scroll', () => {
    if (!started && window.scrollY > 600) {
      observer.observe(orderSection);
      started = true;
    }
  });
})();
