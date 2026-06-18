/* ===========================================================
   Олександр Каплун — психолог-консультант
   Скрипт: мобільне меню, поява секцій, рік у підвалі.
   =========================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Поточний рік у підвалі --- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Мобільне меню --- */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    // Закривати меню після кліку на пункт
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  /* --- Плавна поява блоків при прокручуванні --- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Фолбек для старих браузерів
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- Відправлення форми через Netlify Forms (AJAX) --- */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  if (form) {
    // Локалізація повідомлень за станом форми (мова береться з прихованого поля lang)
    var FORM_MESSAGES = {
      uk: {
        sending: 'Надсилаю…',
        success: 'Дякую! Повідомлення надіслано — я відповім якнайшвидше.',
        error:   'Не вдалося надіслати. Спробуйте ще раз або напишіть напряму нижче.'
      },
      en: {
        sending: 'Sending…',
        success: 'Thank you! Your message has been sent — I will reply as soon as possible.',
        error:   'Could not send the message. Please try again or contact me directly below.'
      },
      ru: {
        sending: 'Отправляю…',
        success: 'Спасибо! Сообщение отправлено — отвечу как можно скорее.',
        error:   'Не удалось отправить. Попробуйте ещё раз или напишите напрямую ниже.'
      }
    };
    var langInput = form.querySelector('input[name="lang"]');
    var formLang = (langInput && langInput.value) || document.documentElement.lang || 'uk';
    var msg = FORM_MESSAGES[formLang] || FORM_MESSAGES.uk;

    // Заповнюємо приховані трекінг-поля з URL/referrer (для аналітики джерел)
    var qs = new URLSearchParams(window.location.search);
    var trackingMap = {
      page_url: window.location.href,
      referrer: document.referrer || 'direct',
      utm_source: qs.get('utm_source') || '',
      utm_medium: qs.get('utm_medium') || '',
      utm_campaign: qs.get('utm_campaign') || '',
      utm_content: qs.get('utm_content') || '',
      utm_term: qs.get('utm_term') || ''
    };
    Object.keys(trackingMap).forEach(function (k) {
      var f = form.querySelector('input[name="' + k + '"]');
      if (f) f.value = trackingMap[k];
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('.form-submit');
      if (btn) { btn.disabled = true; }
      if (status) { status.className = 'form-status'; status.textContent = msg.sending; }

      var data = new FormData(form);
      var encoded = new URLSearchParams(data).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded
      })
      .then(function (res) {
        if (!res.ok) throw new Error('network');
        form.reset();
        if (status) {
          status.className = 'form-status is-success';
          status.textContent = msg.success;
        }
      })
      .catch(function () {
        if (status) {
          status.className = 'form-status is-error';
          status.textContent = msg.error;
        }
      })
      .finally(function () {
        if (btn) { btn.disabled = false; }
      });
    });
  }

  /* --- Лайт-YouTube: клік замінює превʼю на реальний iframe --- */
  document.querySelectorAll('.lite-yt').forEach(function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-id');
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = el.getAttribute('data-title') || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.loading = 'eager';
      el.innerHTML = '';
      el.appendChild(iframe);
    }, { once: true });
  });

  /* --- Лайтбокс для дипломів --- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.diploma').forEach(function (el) {
      el.addEventListener('click', function () {
        openLightbox(el.getAttribute('data-full'));
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightboxClose) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

});
