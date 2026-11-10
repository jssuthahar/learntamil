/* Learn Tamil — core: anonymous usage events.
   Queued until services/firebase.js loads, and dropped if a parent said no. */
'use strict';

// Anonymous usage events for Firebase Analytics (services/firebase.js). Queued until it loads.
function logEv(name, params = {}){
  if (window.ltLog) return window.ltLog(name, params);
  if (window.ltConsent && window.ltConsent.choice() === 'no') return;
  const q = window.ltQ = window.ltQ || []; if (q.length < 30) q.push([name, params]);
}
