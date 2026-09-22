import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app-check.js';

async function fetchFirebaseConfig() {
    const response = await fetch('/api/firebaseAPI');
    const config = await response.json();
    return config;
}

async function initializeFirebase() {
    const firebaseConfig = await fetchFirebaseConfig();
    const app = initializeApp(firebaseConfig);

    if (firebaseConfig.recaptchaSiteKey) {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaSiteKey),
            // Renova o token de App Check sozinho, sem precisar recarregar a página.
            isTokenAutoRefreshEnabled: true
        });
    }

    if (firebaseConfig.measurementId) {
        getAnalytics(app);
    }
    return app;
}

export const app = await initializeFirebase();