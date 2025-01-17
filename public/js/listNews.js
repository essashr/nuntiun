import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { fetchNews } from './fetchData.js';
import { getDatabase, ref, remove } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';

const auth = getAuth();
const db = getDatabase();

function displayNewsEntries(newsData) {
    const newsWrapper = document.getElementById('newsWrapper');

    if (newsData) {
        newsWrapper.innerHTML = '';
        const sortedKeys = Object.keys(newsData)
            .filter(key => newsData[key].date)
            .sort((a, b) => {
                const dateA = parseDate(newsData[a].date);
                const dateB = parseDate(newsData[b].date);
                return dateB - dateA;
            });
        sortedKeys.forEach(key => {
            const news = newsData[key];
            const newsDiv = document.createElement('div');
            newsDiv.className = 'news-entry';
            newsDiv.innerHTML = 
                `<div class="wrapper">
                    <div class="row">
                        <div class="col-xl-4 img-container">
                            <img src="${news.images.titleImage}" alt="Imagem da matéria" class="img-rounded responsive-img news-image">
                        </div>
                        <div class="col-xl-8">
                            <h3 class="news-title">${news.title}</h3>
                            <h4 class="news-subtitle">${news.subtitle}</h4>
                            <p class="news-author">Por: ${news.author}</p>
                            <p class="news-date">Publicado em: ${news.date}</p>
                            <button class="remove-button bx bx-trash" data-key="${key}" data-title-image="${news.images.titleImage}" data-body-images='${news.images.bodyImages ? JSON.stringify(news.images.bodyImages) : "[]"}'></button>
                        </div>
                    </div>
                </div>`;
            newsWrapper.appendChild(newsDiv);
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', () => removeEntry(button));
        });
    } else {
        newsWrapper.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
    }
}

function parseDate(dateString) {
    const [day, month, yearAndTime] = dateString.split('/');
    const [year, time] = yearAndTime.split(' ');
    return new Date(`${year}-${month}-${day}T${time}:00`);
}

async function loadNewsEntries() {
    try {
        const newsData = await fetchNews();
        displayNewsEntries(newsData);
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
    }
}

async function removeImage(imageUrl) {
    try {
        const response = await fetch('/api/githubAPI/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl })
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Erro ao excluir imagem no GitHub:', data.error, data.details);
        }
    } catch (error) {
        console.error('Erro ao fazer requisição para excluir imagem:', error);
    }
}

async function removeEntry(button) {
    const key = button.getAttribute('data-key');
    const titleImage = button.getAttribute('data-title-image');
    const bodyImages = button.getAttribute('data-body-images') ? JSON.parse(button.getAttribute('data-body-images')) : [];
    try {
        if (titleImage) await removeImage(titleImage);
        if (bodyImages.length > 0) {
            for (const imageObj of bodyImages) {
                if (imageObj && imageObj.url) await removeImage(imageObj.url);
            }
        }
        await remove(ref(db, 'news/' + key));
        const newsEntry = button.closest('.news-entry');
        if (newsEntry) newsEntry.remove();
    } catch (error) {
        console.error('Erro ao excluir a notícia:', error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadNewsEntries();
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
