import { app } from './firebaseConfig.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

const db = getDatabase(app);

export async function fetchContacts() {
    try {
        const contactsRef = ref(db, 'Contatos');
        const snapshot = await get(contactsRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.log('Error fetching contacts:', error);
        return null;
    }
}

export async function fetchNewsletter() {
    try {
        const newsletterRef = ref(db, 'Notícias');
        const snapshot = await get(newsletterRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.log('Error fetching newsletter:', error);
        return null;
    }
}

export async function fetchNews() {
    try {
        const newsRef = ref(db, 'news');
        const snapshot = await get(newsRef);
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.log('Error fetching news:', error);
        return null;
    }
}

export async function getEmailsFromResults() {
    try {
        const newsletterData = await fetchNewsletter();
        if (newsletterData) {
            return Object.values(newsletterData).map(item => item.email);
        }
        return [];
    } catch (error) {
        console.log('Error fetching emails:', error);
        return [];
    }
}
