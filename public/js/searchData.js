// /js/searchData.js

import { getDatabase, ref, query, orderByChild, startAt, endAt, get } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { app } from './firebaseConfig.js';

const db = getDatabase(app);
let searchOverlay, searchContainer;

export function openSearch() {
    if (searchOverlay) {
        document.body.removeChild(searchOverlay);
        document.body.removeChild(searchContainer);
    }

    searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';

    searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    searchContainer.innerHTML = `
        <textarea class="edit-textarea" placeholder="Digite para buscar..."></textarea>
        <div id="searchResultsContainer" class="search-results-container"></div>
    `;

    document.body.appendChild(searchOverlay);
    document.body.appendChild(searchContainer);

    searchOverlay.addEventListener('click', () => {
        document.body.removeChild(searchOverlay);
        document.body.removeChild(searchContainer);
        searchOverlay = null;
        searchContainer = null;
    });

    searchContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !event.shiftKey) {
            document.body.removeChild(searchOverlay);
            document.body.removeChild(searchContainer);
            searchOverlay = null;
            searchContainer = null;
            event.preventDefault();
        }
    });

    const textarea = searchContainer.querySelector('.edit-textarea');
    textarea.addEventListener('input', debounce(searchData, 300));

    textarea.focus();
}

async function searchData() {
    const searchTerm = document.querySelector('.edit-textarea').value.trim();
    if (!searchTerm) {
        return;
    }

    const table = determineTable();
    const searchRef = ref(db, table);
    let searchQueries = [];

    if (table === 'Contatos') {
        searchQueries = [
            query(searchRef, orderByChild('data'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('email'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('primeiroNome'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('ultimoNome'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('mensagem'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('telefone'), startAt(searchTerm), endAt(searchTerm + '\uf8ff'))
        ];
    } else if (table === 'Notícias') {
        searchQueries = [
            query(searchRef, orderByChild('data'), startAt(searchTerm), endAt(searchTerm + '\uf8ff')),
            query(searchRef, orderByChild('email'), startAt(searchTerm), endAt(searchTerm + '\uf8ff'))
        ];
    }

    try {
        const resultsContainer = document.getElementById('searchResultsContainer');
        resultsContainer.innerHTML = '';

        let resultsMap = new Map();

        let foundResults = false;

        for (const searchQuery of searchQueries) {
            const snapshot = await get(searchQuery);
            if (snapshot.exists()) {
                const results = snapshot.val();
                for (const key in results) {
                    const item = results[key];
                    const normalizedItem = Object.fromEntries(
                        Object.entries(item).map(([k, v]) => [k, (v || '').toLowerCase()])
                    );
                    const normalizedSearchTerm = searchTerm.toLowerCase();

                    if (Object.values(normalizedItem).some(value => value.includes(normalizedSearchTerm))) {
                        resultsMap.set(key, item);
                    }
                }
                foundResults = true;
            }
        }

        if (foundResults) {
            displayResults(Array.from(resultsMap.values()), resultsContainer);
        } else {
            resultsContainer.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function displayResults(results, container) {
    container.innerHTML = '';

    results.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';

        const formattedResult = formatResult(result);
        
        resultElement.innerHTML = formattedResult;
        container.appendChild(resultElement);
    });
}

function formatResult(result) {
    let formattedString = '';

    for (const [key, value] of Object.entries(result)) {
        formattedString += `${key}: ${value || 'N/A'}, `;
    }

    formattedString = formattedString.replace(/, $/, '');

    return formattedString;
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function determineTable() {
    if (document.getElementById('contactsWrapper')) {
        return 'Contatos';
    } else if (document.getElementById('newsletterWrapper')) {
        return 'Notícias';
    }
    return '';
}
