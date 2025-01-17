import { app } from './firebaseConfig.js';
import { getDatabase, ref, update, push, remove } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

const db = getDatabase(app);

function determineTable() {
    if (document.getElementById('contactsWrapper')) {
        return 'Contatos';
    } else if (document.getElementById('newsletterWrapper')) {
        return 'Notícias';
    }
    return '';
}

export async function removeEntry(button) {
    const key = button.dataset.key;
    const table = determineTable();

    if (!key || !table) {
        console.error('ID ou tabela não encontrados.');
        return;
    }

    const dataRef = ref(db, `${table}/${key}`);

    try {
        await remove(dataRef);
        button.parentElement.remove();
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
    }
}

export function editField(span) {
    const existingTextarea = span.querySelector('textarea');
    if (existingTextarea) {
        existingTextarea.focus();
        return;
    }

    const table = determineTable();
    const originalValue = span.textContent;
    const textarea = document.createElement('textarea');
    const refreshButton = document.createElement('button');
    const closeButton = document.createElement('button');
    const container = document.createElement('div');
    const containerParent = span.closest('.newsletter-entry, .contacts-entry');
    const removeButton = containerParent.querySelector('.remove-button');

    textarea.value = originalValue;
    textarea.className = 'edit-textarea';
    refreshButton.className = 'refresh bx bx-check';
    closeButton.className = 'close-t bx bx-x';
    container.className = 'edit-field-container';

    container.appendChild(textarea);
    container.appendChild(refreshButton);
    container.appendChild(closeButton);

    span.innerHTML = '';
    span.appendChild(container);
    textarea.focus();

    function adjustHeight() {
        textarea.style.height = 'auto';
        const lineHeight = 18;
        const padding = 13;
        const numberOfLines = textarea.value.split('\n').length;
        const newHeight = (lineHeight * numberOfLines) + padding;
        textarea.style.height = newHeight + 'px';
    }

    adjustHeight();

    textarea.addEventListener('input', adjustHeight);

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    textarea.addEventListener('keydown', (event) => {
        if (isMobileDevice() && event.key === 'Enter' && !event.shiftKey) {
            return; 
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            saveChanges(span, textarea.value, table);
            event.preventDefault();
        }
    });


    textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !event.shiftKey) {
            revertEdit(span, originalValue);
            removeButton.classList.remove('hidden');
            event.preventDefault();
        }
    });

    refreshButton.addEventListener('click', (event) => {
        event.stopPropagation();
        saveChanges(span, textarea.value, table);
    });

    closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        revertEdit(span, originalValue);
        removeButton.classList.remove('hidden');
    });

    removeButton.classList.add('hidden');
}

export async function saveChanges(span, newValue, table) {
    const key = span.dataset.key;
    const parts = key.split('-');
    const attribute = parts[0];
    const id = parts.slice(1).join('-');

    if (!id || !attribute) {
        console.error('ID ou atributo não encontrado.');
        return;
    }

    const dataRef = ref(db, `${table}/${id}`);

    try {
        await update(dataRef, { [attribute]: newValue });
        span.textContent = newValue;
        checkButtonVisibility(span);
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        revertEdit(span, span.textContent);
    }

    if (span.textContent.trim() === '') {
        createAddButton(span);
    }
    const containerParent = span.closest('.newsletter-entry, .contacts-entry');
    const removeButton = containerParent ? containerParent.querySelector('.remove-button') : null;
    if (removeButton) {
        removeButton.classList.remove('hidden');
    }
}

function checkButtonVisibility(span) {
    const button = span.previousElementSibling;
    if (button && button.classList.contains('add-button')) {
        button.style.display = span.textContent.trim() ? 'none' : 'block';
    }
}

export function revertEdit(span, newValue) {
    span.textContent = newValue || '';
    checkButtonVisibility(span);
}

function createAddButton(span) {
    if (span.previousElementSibling && span.previousElementSibling.classList.contains('add-button')) {
        return;
    }

    const button = document.createElement('button');
    button.className = 'bx bx-plus add-button';
    button.addEventListener('click', () => {
        editField(span);
        button.style.display = 'none';
    });
    span.insertAdjacentElement('beforebegin', button);
}

export async function addNewNewsletterComuns() {
    const newsletterWrapper = document.getElementById('newsletterWrapper');

    const newRef = ref(db, 'Notícias');
    const newEntryRef = push(newRef);
    const newEntryId = newEntryRef.key;

    const newEntryDiv = document.createElement('div');
    newEntryDiv.className = 'newsletter-entry';
    newEntryDiv.innerHTML =
        `<p class="list-color">Data: <span class="editable" data-key="data-${newEntryId}"></span></p>
        <p class="list-color">Email: <span class="editable" data-key="email-${newEntryId}"></span></p>
        <button class="remove-button bx bx-trash" data-key="${newEntryId}"></button>
        <hr>`;

    newsletterWrapper.appendChild(newEntryDiv);

    initializeNewsletterEmptyColums();

    const newDeleteButton = newEntryDiv.querySelector('.remove-button');
    if (newDeleteButton) {
        newDeleteButton.addEventListener('click', () => removeEntry(newDeleteButton));
    }
    document.querySelectorAll('.editable').forEach(span => {
        span.addEventListener('click', () => editField(span));
    });
}

export function initializeNewsletterEmptyColums() {
    const entries = document.querySelectorAll('.newsletter-entry');

    entries.forEach(entry => {
        const dataSpan = entry.querySelector('span[data-key^="data-"]');
        const emailSpan = entry.querySelector('span[data-key^="email-"]');

        if (dataSpan && (dataSpan.textContent.trim() === "" || dataSpan.textContent === "undefined")) {
            createAddButton(dataSpan);
            dataSpan.textContent = '';
        }
        if (emailSpan && (emailSpan.textContent.trim() === "" || emailSpan.textContent === "undefined")) {
            createAddButton(emailSpan);
            emailSpan.textContent = '';
        }
    });
}


export async function addNewFormsComuns() {
    const contactsWrapper = document.getElementById('contactsWrapper');

    const newRef = ref(db, 'Contatos');
    const newEntryRef = push(newRef);
    const newEntryId = newEntryRef.key;

    const newEntryDiv = document.createElement('div');
    newEntryDiv.className = 'contacts-entry';
    newEntryDiv.innerHTML =
        `<p class="list-color">Primeiro Nome: <span class="editable" data-key="primeiroNome-${newEntryId}"></span></p>
        <p class="list-color">Último nome: <span class="editable" data-key="ultimoNome-${newEntryId}"></span></p>
        <p class="list-color">Email: <span class="editable" data-key="email-${newEntryId}"></span></p>
        <p class="list-color">Telefone: <span class="editable" data-key="telefone-${newEntryId}"></span></p>
        <p class="list-color">Mensagem: <span class="editable" data-key="mensagem-${newEntryId}"></span></p>
        <p class="list-color">Data: <span class="editable" data-key="data-${newEntryId}"></span></p>
        <button class="remove-button bx bx-trash" data-key="${newEntryId}"></button>
        <hr>`;

    contactsWrapper.appendChild(newEntryDiv);

    initializeFormsEmptyColums();

    const newDeleteButton = newEntryDiv.querySelector('.remove-button');
    if (newDeleteButton) {
        newDeleteButton.addEventListener('click', () => removeEntry(newDeleteButton));
    }
    document.querySelectorAll('.editable').forEach(span => {
        span.addEventListener('click', () => editField(span));
    });
}

export function initializeFormsEmptyColums() {
    const entries = document.querySelectorAll('.contacts-entry');

    entries.forEach(entry => {
        const dataSpan = entry.querySelector('span[data-key^="data-"]');
        const emailSpan = entry.querySelector('span[data-key^="email-"]');
        const messageSpan = entry.querySelector('span[data-key^="mensagem-"]');
        const firstNameSpan = entry.querySelector('span[data-key^="primeiroNome-"]');
        const telSpan = entry.querySelector('span[data-key^="telefone-"]');
        const lastNameSpan = entry.querySelector('span[data-key^="ultimoNome-"]');

        if (dataSpan && (dataSpan.textContent.trim() === "" || dataSpan.textContent === "undefined")) {
            createAddButton(dataSpan);
            dataSpan.textContent = '';
        }
        if (emailSpan && (emailSpan.textContent.trim() === "" || emailSpan.textContent === "undefined")) {
            createAddButton(emailSpan);
            emailSpan.textContent = '';
        }
        if (messageSpan && (messageSpan.textContent.trim() === "" || messageSpan.textContent === "undefined")) {
            createAddButton(messageSpan);
            messageSpan.textContent = '';
        }
        if (firstNameSpan && (firstNameSpan.textContent.trim() === "" || firstNameSpan.textContent === "undefined")) {
            createAddButton(firstNameSpan);
            firstNameSpan.textContent = '';
        }
        if (telSpan && (telSpan.textContent.trim() === "" || telSpan.textContent === "undefined")) {
            createAddButton(telSpan);
            telSpan.textContent = '';
        }
        if (lastNameSpan && (lastNameSpan.textContent.trim() === "" || lastNameSpan.textContent === "undefined")) {
            createAddButton(lastNameSpan);
            lastNameSpan.textContent = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeNewsletterEmptyColums();
    initializeFormsEmptyColums();
    document.querySelectorAll('.editable').forEach(span => {
        span.addEventListener('click', () => editField(span));
    });
});
