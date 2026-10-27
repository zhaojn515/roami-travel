// Roami Travel - Main JS
document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      const expanded = mainNav.classList.contains('active');
      navToggle.setAttribute('aria-expanded', expanded);
      navToggle.innerHTML = expanded ? '✕' : '☰';
    });
  }

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        item.classList.toggle('active');
      });
    }
  });

  // Conversion tracking on CTA buttons
  document.querySelectorAll('[data-track]').forEach(function(el) {
    el.addEventListener('click', function() {
      const action = el.getAttribute('data-track');
      if (typeof window.trackConversion === 'function') {
        window.trackConversion(action);
      }
    });
  });
});
