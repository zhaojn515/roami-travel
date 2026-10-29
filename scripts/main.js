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

  // Starter Kit form submission
  const starterKitForm = document.getElementById('starter-kit-form');
  if (starterKitForm) {
    starterKitForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const submitButton = starterKitForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      try {
        const response = await fetch('/api/send-starter-kit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error(data.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('Sorry, there was an error. Please try again or contact hello@roamitravel.com');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
});
