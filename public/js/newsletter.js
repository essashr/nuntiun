import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { fetchNewsletter } from './fetchData.js';
import { editField, initializeNewsletterEmptyColums, addNewNewsletterComuns, removeEntry } from './editData.js';
import { openSearch } from './searchData.js';
import { openMail } from './mailSubmit.js';
import { openCheckboxSearch } from './getMailsFromSearch.js';

const auth = getAuth();

function displayNewsletterEntries(newsletterData) {
    const newsletterWrapper = document.getElementById('newsletterWrapper');
    if (newsletterData) {
        newsletterWrapper.innerHTML = '';
        Object.keys(newsletterData).forEach(key => {
            const newsletter = newsletterData[key];
            const newsletterDiv = document.createElement('div');
            newsletterDiv.className = 'newsletter-entry';
            newsletterDiv.innerHTML = 
                `<p class="list-color">Data: <span class="editable" data-key="data-${key}">${newsletter.data}</span></p>
                <p class="list-color">Email: <span class="editable" data-key="email-${key}">${newsletter.email}</span></p>
                <button class="remove-button bx bx-trash" data-key="${key}"></button>
                <hr>`;
            newsletterWrapper.appendChild(newsletterDiv);
        });

        document.querySelectorAll('.editable').forEach(span => {
            span.addEventListener('click', () => editField(span));
            span.addEventListener('blur', () => checkButtonVisibility(span));
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', () => removeEntry(button));
        });

        initializeNewsletterEmptyColums();
    } else {
        newsletterWrapper.innerHTML = '<p>Nenhum inscrito encontrado.</p>';
    }
}

async function loadNewsletterEntries() {
    const newsletterData = await fetchNewsletter();
    displayNewsletterEntries(newsletterData);
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadNewsletterEntries();
    }
});

async function logOut() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Erro ao deslogar:', error);
    }
}

window.logOut = logOut;

window.addNewColumn = function() {
    addNewNewsletterComuns();
};

window.openSearch = openSearch;

window.openMail = openMail;

window.openCheckboxSearch = openCheckboxSearch;