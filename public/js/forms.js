import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { fetchContacts } from './fetchData.js';
import { editField, initializeFormsEmptyColums, addNewFormsComuns, removeEntry } from './editData.js';
import { openSearch } from './searchData.js';

const auth = getAuth();

function displayContacts(contactsData) {
    const contactsWrapper = document.getElementById('contactsWrapper');
    if (contactsData) {
        contactsWrapper.innerHTML = '';
        Object.keys(contactsData).forEach(key => {
            const contact = contactsData[key];
            const contactDiv = document.createElement('div');
            contactDiv.className = 'contacts-entry';
            contactDiv.innerHTML = 
                `<p class="list-color">Primeiro Nome: <span class="editable" data-key="primeiroNome-${key}">${contact.primeiroNome}</span></p>
                <p class="list-color">Último Nome: <span class="editable" data-key="ultimoNome-${key}">${contact.ultimoNome}</span></p>
                <p class="list-color">Email: <span class="editable" data-key="email-${key}">${contact.email}</span></p>
                <p class="list-color">Telefone: <span class="editable" data-key="telefone-${key}">${contact.telefone}</span></p>
                <p class="list-color">Mensagem: <span class="editable" data-key="mensagem-${key}">${contact.mensagem}</span></p>
                <p class="list-color">Data: <span class="editable" data-key="data-${key}">${contact.data}</span></p>
                <button class="remove-button bx bx-trash" data-key="${key}"></button>
                <hr>`;
            contactsWrapper.appendChild(contactDiv);
        });
        document.querySelectorAll('.editable').forEach(span => {
            span.addEventListener('click', () => editField(span));
            span.addEventListener('blur', () => checkButtonVisibility(span));
        });
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', () => removeEntry(button));
        });

        initializeFormsEmptyColums();
    } else {
        contactsWrapper.innerHTML = '<p>Nenhum formulário encontrado.</p>';
    }
}

async function loadContactsEntries() {
    const contactsData = await fetchContacts();
    displayContacts(contactsData);
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadContactsEntries();
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
    addNewFormsComuns();
};

window.openSearch = openSearch;