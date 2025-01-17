import { app } from './firebaseConfig.js';
import { getEmailsFromResults } from './fetchData.js';
import { getDatabase, ref, set, push } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

const database = getDatabase();
let quill;

function openNewsEditor() {
    const overlay = document.createElement('div');
    overlay.className = 'news-overlay';

    const newsContainer = document.createElement('div');
    newsContainer.className = 'news-container';

    newsContainer.innerHTML = `
        <button class="close-news-button"><i class='bx bx-x'></i></button>
        <h2>Criar Notícia</h2>
        <div class="image-upload-container">
            <label for="image-upload" class="image-upload-label">Imagem do Título (Obrigatória)</label>
            <input type="file" id="image-upload" class="image-upload-button" accept="image/*">
            <span id="image-name" class="image-name">Nenhuma imagem selecionada</span>
        </div>
        <p class="news-alert"><i class='bx bxs-star'></i> Não insira imagens do copiar e colar.</p>
        <div class="image-options">
            <label class="inputs">
                <input class=radioNews type="radio" name="imageOption" value="noImages" checked>
                Não inserir imagens no corpo
            </label>
            <br>
            <label class="inputs">
                <input class=radioNews type="radio" name="imageOption" value="withImages">
                Inserir imagens no corpo
            </label>
        </div>
        <div class="image-body-upload-container" style="display: none;">
            <p><i class='bx bxs-star'></i> As imagens serão associadas aos parágrafos (duas quebras de linha) informados.</p>
            <p><i class='bx bxs-star'></i> Não insira imagens do copiar e colar.</p>
            <label for="body-image-upload" class="image-upload-label ma10">Selecione imagens para o corpo</label>
            <input type="file" id="body-image-upload" class="image-upload-button" accept="image/*" multiple>
            <span id="body-image-name" class="image-name">Nenhuma imagem selecionada</span>
        </div>
        <textarea id="title-input" class="news-textarea news-title-input" placeholder="Digite o título aqui..." rows="1"></textarea>
        <textarea id="subtitle-input" class="news-textarea news-subtitle-input" placeholder="Digite o subtítulo aqui..." rows="1"></textarea>
        <div class="author-date-container">
            <textarea id="author-input" class="news-author-input" placeholder="Nome do Autor" rows="1"></textarea>
        </div>
        <div id="editor-container" class="editor-container"></div>
        <button id="quill-button" class="news-submit"><i class='bx bx-send'></i></button>
        <div class="terminal-loader" style="display: none;">
            <div class="terminal-header">
                <div class="terminal-title">Status</div>
                <div class="terminal-controls"></div>
            </div>
            <div class="text">Salvando...</div>
        </div>
        `
    ;

    document.body.appendChild(overlay);
    document.body.appendChild(newsContainer);

    initializeQuill();

    const imageOptions = document.getElementsByName('imageOption');
    const bodyImageContainer = document.querySelector('.image-body-upload-container');
    imageOptions.forEach((option) =>
        option.addEventListener('change', () => {
            if (option.value === 'withImages') {
                bodyImageContainer.style.display = 'block';
            } else {
                bodyImageContainer.style.display = 'none';
            }
        })
    );

    document.querySelector('.close-news-button').addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(newsContainer);
    });

    document.getElementById('image-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const imageNameElement = document.getElementById('image-name');
        if (file && imageNameElement) {
            imageNameElement.textContent = file.name;
        }
    });
}

async function uploadImageToGitHub(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch('/api/githubAPI/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao fazer upload:', errorData.error);
    }

    const data = await response.json();
    return data.url;
}

async function saveNewsToFirebase(newsData) {
    const newsRef = push(ref(database, 'news'));
    const newsKey = newsRef.key;
    await set(newsRef, newsData);
    return newsKey;
}

function validateInputs() {
    const titleInput = document.getElementById('title-input');
    const subtitleInput = document.getElementById('subtitle-input');
    const authorInput = document.getElementById('author-input');
    const editorContainer = document.querySelector('.ql-container');
    const titleImage = document.getElementById('image-upload').files[0];
    const bodyImages = document.getElementById('body-image-upload').files;
    const imageOption = document.querySelector('input[name="imageOption"]:checked').value;

    let isValid = true;

    if (!titleImage) {
        markImageAsInvalid('title');
        isValid = false;
    } else {
        resetImageBorder('title');
    }

    if (imageOption === 'withImages' && bodyImages.length === 0) {
        markImageAsInvalid('body');
        isValid = false;
    }

    if (!titleInput || !titleInput.value.trim()) {
        titleInput.style.borderColor = 'red';
        isValid = false;
    } else {
        titleInput.style.borderColor = '';
    }

    if (!subtitleInput || !subtitleInput.value.trim()) {
        subtitleInput.style.borderColor = 'red';
        isValid = false;
    } else {
        subtitleInput.style.borderColor = '';
    }

    if (!authorInput || !authorInput.value.trim()) {
        authorInput.style.borderColor = 'red';
        isValid = false;
    } else {
        authorInput.style.borderColor = '';
    }

    if (!editorContainer || !quill.getText().trim()) {
        editorContainer.style.borderColor = 'red';
        isValid = false;
    } else {
        editorContainer.style.borderColor = '';
    }

    setTimeout(() => {
        if (titleInput) titleInput.style.borderColor = '';
        if (subtitleInput) subtitleInput.style.borderColor = '';
        if (authorInput) authorInput.style.borderColor = '';
        if (editorContainer) editorContainer.style.borderColor = '';
    }, 2000);
    return isValid;
}

function markImageAsInvalid(type) {
    const imageNameElement = type === 'title' ? document.getElementById('image-name') : document.getElementById('body-image-name');
    imageNameElement.style.color = 'red';

    if (type === 'title') {
        imageNameElement.textContent = 'Nenhuma imagem selecionada';

        setTimeout(() => {
            imageNameElement.style.color = '';
            imageNameElement.textContent = 'Nenhuma imagem selecionada';
        }, 2000);
    } else {
        setTimeout(() => {
            imageNameElement.style.color = '';
            imageNameElement.textContent = 'Nenhuma imagem selecionada';
        }, 2000);
    }
}

function resetImageBorder(type) {
    const imageNameElement = type === 'title' ? document.getElementById('image-name') : document.getElementById('body-image-name');
    if (type === 'body') {
        imageNameElement.style.color = '';
        imageNameElement.textContent = 'Nenhuma imagem selecionada';
    }
}

function initializeQuill() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: 'Escreva sua notícia aqui...',
        modules: {
            toolbar: [
                [{ header: '1' }, { header: '2' }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
            ]
        }
    });

    document.getElementById('body-image-upload').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        const imageNameElement = document.getElementById('body-image-name');
    
        if (files.length > 0 && imageNameElement) {
            imageNameElement.textContent = '';
    
            files.forEach(file => {
                const imageDiv = document.createElement('div');
                const imageLabel = document.createElement('span');
                imageLabel.classList.add('label-image-position');
                imageLabel.textContent = file.name;
    
                const positionInput = document.createElement('input');
                positionInput.type = 'number';
                positionInput.placeholder = 'Posição do parágrafo';
                positionInput.classList.add('image-position-input');
    
                imageDiv.appendChild(imageLabel);
                imageDiv.appendChild(positionInput);
                imageNameElement.appendChild(imageDiv);
            });
        }
    });    
    
    document.getElementById('quill-button').addEventListener('click', async () => {
        if (!validateInputs()) {
            return;
        }
    
        const title = document.getElementById('title-input').value.trim();
        const subtitle = document.getElementById('subtitle-input').value.trim();
        const author = document.getElementById('author-input').value.trim();
        const now = new Date();
        const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const content = quill.root.innerHTML;
        const titleImage = document.getElementById('image-upload').files[0];
        const bodyImages = document.getElementById('body-image-upload').files;
        const imageOption = document.querySelector('input[name="imageOption"]:checked').value;
    
        const loader = document.querySelector('.terminal-loader');
        loader.style.display = 'block';
        loader.querySelector('.text').textContent = 'Salvando...';
    
        try {
            const titleImageUrl = titleImage ? await uploadImageToGitHub(titleImage) : null;
            const bodyImageUrls = [];
            const bodyImagePositions = [];
            if (imageOption === 'withImages') {
                for (let i = 0; i < bodyImages.length; i++) {
                    const file = bodyImages[i];
                    const positionInput = document.querySelectorAll('.image-position-input')[i];
                    const position = positionInput ? positionInput.value.trim() : '';
                    const url = await uploadImageToGitHub(file);
                    bodyImageUrls.push(url);
                    bodyImagePositions.push(position);
                }                
            }
    
            const newsData = {
                title,
                subtitle,
                author,
                date,
                content,
                images: {
                    titleImage: titleImageUrl,
                    bodyImages: bodyImageUrls.map((url, index) => ({
                        url,
                        position: bodyImagePositions[index] || ''
                    }))
                }
            };

            const newsKey = await saveNewsToFirebase(newsData);
            await sendEmails(newsKey);
    
            loader.querySelector('.text').textContent = 'Notícia salva!';
            setTimeout(() => {
                loader.style.display = 'none';
                document.getElementById('image-upload').value = '';
                document.getElementById('image-name').textContent = 'Nenhuma imagem selecionada';
                document.getElementById('title-input').value = '';
                document.getElementById('subtitle-input').value = '';
                document.getElementById('author-input').value = '';
                quill.setContents([]);
                document.querySelector('input[name="imageOption"][value="noImages"]').checked = true;
                document.getElementById('body-image-upload').value = '';
                document.getElementById('body-image-name').textContent = 'Nenhuma imagem selecionada';
                document.querySelector('.image-body-upload-container').style.display = 'none';
            }, 2000);
        } catch (error) {
            loader.querySelector('.text').textContent = 'Erro ao salvar notícia.';
            console.error('Erro:', error);
        }
    });    
}

async function sendEmails(newsKey) {
    try {
        const recipients = await getEmailsFromResults();
        if (recipients.length === 0) {
            console.error('Nenhum destinatário encontrado.');
            return;
        }

        const title = document.getElementById('title-input').value.trim();
        const subtitle = document.getElementById('subtitle-input').value.trim();
        const author = document.getElementById('author-input').value.trim();

        const newsLink = `https://nuntiun.vercel.app/news.html?id=${newsKey}`;
        const emailContent = `
            <h1>${title}</h1>
            <h2>${subtitle}</h2>
            <p><strong>Autor:</strong> ${author}</p>
            <p><strong>Disponível em:</strong> <a href="${newsLink}">${newsLink}</a></p>
        `;

        const emailSubject = `Nova Notícia: ${title}`;
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

window.openNewsEditor = openNewsEditor;