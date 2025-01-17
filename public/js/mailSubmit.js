import { getEmailsFromResults } from './fetchData.js';
import { openCheckboxSearch, getSelectedEmails } from './getMailsFromSearch.js';

let isMailOpen = false;

export async function openMail() {
    const overlay = document.createElement('div');
    overlay.className = 'mail-overlay';

    const mailContainer = document.createElement('div');
    mailContainer.className = 'mail-container';

    mailContainer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !event.shiftKey) {
        isMailOpen = false;
        const overlay = document.querySelector('.mail-overlay');
        const mailContainer = document.querySelector('.mail-container');
        const loader = document.querySelector('.terminal-loader');

        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
        if (mailContainer && document.body.contains(mailContainer)) {
            document.body.removeChild(mailContainer);
        }
        if (loader && document.body.contains(loader)) {
            document.body.removeChild(loader);
        }
        event.preventDefault();
    }
});

    mailContainer.innerHTML = `
        <button class="close-mail-button"><i class='bx bx-x'></i></button>
        <h2>Enviar E-mail</h2>
        <div class="inputMails">
            <label class="inputs">
                <input class="radioMail" id="sendToAllOption" type="radio" name="sendOption" value="sendToAll" checked>
                Enviar para Todos
            </label>
            <br>
            <label class="inputs">
                <input class="radioMail" id="searchAndSelectOption" type="radio" name="sendOption" value="searchAndSelect" onclick="openCheckboxSearch();">
                Buscar e Selecionar
            </label>
            <br>
            <button class="mailSubmit" id="sendButton"><i class='bx bx-paper-plane'></i></button>
        </div>
        <textarea class="mailTitle" id="emailSubject" placeholder="Digite o assunto do e-mail aqui..." rows="1"></textarea>
        <div class="terminal-loader">
            <div class="terminal-header">
                <div class="terminal-title">Status</div>
                <div class="terminal-controls">
                    <div class="control"></div>
                    <div class="control"></div>
                    <div class="control"></div>
                </div>
            </div>
            <div class="text">Enviando...</div>
        </div>
        <div class="editor-container">
            <div id="editorContainer"></div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(mailContainer);
    const loader = document.querySelector('.terminal-loader');

    const quill = new Quill('#editorContainer', {
        theme: 'snow',
        placeholder: 'Digite o conteúdo do e-mail aqui...',
        modules: {
            toolbar: [
                [{ 'header': '1' }, { 'header': '2' }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link']
            ]
        }
    });

    document.querySelector('.close-mail-button').addEventListener('click', () => {
        isMailOpen = false;
        const overlay = document.querySelector('.mail-overlay');
        const mailContainer = document.querySelector('.mail-container');
        const loader = document.querySelector('.terminal-loader');

        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
        if (mailContainer && document.body.contains(mailContainer)) {
            document.body.removeChild(mailContainer);
        }
        if (loader && document.body.contains(loader)) {
            document.body.removeChild(loader);
        }
    });

    document.getElementById('sendButton').addEventListener('click', async () => {
        const emailContent = quill.root.innerHTML;
        const emailSubjectElement = document.getElementById('emailSubject');
        const editorContainer = document.getElementById('editorContainer');
        const sendToAllOption = document.getElementById('sendToAllOption');
        const searchAndSelectOption = document.getElementById('searchAndSelectOption');
    
        if (!emailSubjectElement || !editorContainer || !sendToAllOption || !searchAndSelectOption) {
            console.error('Um ou mais elementos necessários não estão disponíveis.');
            return;
        }
    
        const emailSubject = emailSubjectElement.value.trim();
        const selectedOption = document.querySelector('input[name="sendOption"]:checked').value;
    
        emailSubjectElement.style.borderColor = '';
        editorContainer.style.borderColor = '';
    
        if (!emailSubject) {
            emailSubjectElement.style.borderColor = 'red';
            setTimeout(() => {
                emailSubjectElement.style.borderColor = '';
                editorContainer.style.borderColor = '';
            }, 2000);
            return;
        }
    
        let recipients = [];
    
        if (selectedOption === 'sendToAll') {
            recipients = await getEmailsFromResults();
        } else if (selectedOption === 'searchAndSelect') {
            recipients = getSelectedEmails();
        } else {
            console.error('Opção de envio desconhecida.');
            return;
        }
    
        if (recipients.length > 0) {
            const loader = document.querySelector('.terminal-loader');
            if (loader) {
                loader.querySelector('.text').textContent = 'Enviando...';
                loader.style.display = 'block';
    
                try {
                    await sendEmails(recipients, emailContent, emailSubject);
                    loader.querySelector('.text').textContent = 'E-mail enviado!';
    
                    setTimeout(() => {
                        if (emailSubjectElement) emailSubjectElement.value = '';
                        quill.setContents([]);
                    }, 3200);
                } catch (error) {
                    loader.querySelector('.text').textContent = 'Erro ao enviar e-mail!';
                }
    
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 2500);
            }
        } else {
            if (selectedOption === 'sendToAll') {
                sendToAllOption.parentElement.classList.add('highlight-red');
            } else if (selectedOption === 'searchAndSelect') {
                searchAndSelectOption.parentElement.classList.add('highlight-red');
            }
    
            setTimeout(() => {
                if (sendToAllOption.parentElement) sendToAllOption.parentElement.classList.remove('highlight-red');
                if (searchAndSelectOption.parentElement) searchAndSelectOption.parentElement.classList.remove('highlight-red');
            }, 2000);
    
            return;
        }
    });    
}

async function sendEmails(recipients, emailContent, emailSubject) {
    try {
        const response = await fetch('/api/emailAPI', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emailContent, recipients, emailSubject })
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result.message);
        } else {
            console.error(result.error);
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
    }
}