// Google tag (gtag.js)
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18518352623');

// Conversion tracking config (placeholder labels — replace after boss provides)
window.ROAMI_CONVERSIONS = {
  starterKit:    { label: 'Cz4lCJuBx7gZEIvC69oC', value: 0.0 },
  playbook:      { label: '_cM7CKz-4akBEJLQ6cE_', value: 19.0 },
  personalized:  { label: '1a0cCMjQz7kBEJLQ6cE_', value: 69.0 },
  companion:     { label: 'sJ0tCM7Y0rkBEJLQ6cE_', value: 129.0 }
};

// Universal conversion trigger
window.trackConversion = function(action, value) {
  const cfg = window.ROAMI_CONVERSIONS[action];
  if (cfg && typeof gtag === 'function') {
    gtag('event', 'conversion', {
      'send_to': 'AW-18518352623/' + cfg.label,
      'value': value || cfg.value,
      'currency': 'USD',
      'transaction_id': 'TX_' + Date.now()
    });
  }
};
