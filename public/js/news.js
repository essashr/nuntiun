import { fetchNews } from './fetchData.js';

function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function removeEmptyTags(content) {
    return content.replace(/<([a-z][a-z0-9]*)\b[^>]*>\s*<\/\1>/gi, '');
}

function formatLists(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const orderedListItems = tempDiv.querySelectorAll('li[data-list="ordered"]');
    orderedListItems.forEach(item => {
        const span = item.querySelector('.ql-ui');
        if (span) {
            item.removeChild(span);
        }
        item.style.listStyleType = 'decimal';
    });
    const bulletListItems = tempDiv.querySelectorAll('li[data-list="bullet"]');
    bulletListItems.forEach(item => {
        const span = item.querySelector('.ql-ui');
        if (span) {
            item.removeChild(span);
        }
        item.style.listStyleType = 'disc';
    });
    return tempDiv.innerHTML;
}

function loadImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = url;
    });
}

async function insertImagesInContent(content, bodyImages) {
    const sections = content
        .split('<br>')
        .filter(s => s.trim() !== '')
        .map(s => `${s}<br>`);

    let layoutIndex = 0;

    for (const image of bodyImages) {
        const position = parseInt(image.position) - 1;
        if (position >= 0 && position < sections.length) {
            const sectionContent = sections[position].replace(/<br>$/, '');
            const { url } = image;
            const { width, height } = await loadImageDimensions(url);
            let textClass, imageClass;
            if (Math.abs(width - height) <= 100) {
                textClass = 'col-xl-6';
                imageClass = 'col-xl-6';
            }
            else if (height > width * 1.2) {
                textClass = layoutIndex % 2 === 0 ? 'col-xl-8' : 'col-xl-4';
                imageClass = layoutIndex % 2 === 0 ? 'col-xl-4' : 'col-xl-8';
            }
            else if (width > height * 1.2) {
                textClass = layoutIndex % 2 === 0 ? 'col-xl-6' : 'col-xl-6';
                imageClass = layoutIndex % 2 === 0 ? 'col-xl-6' : 'col-xl-6';
            }
            sections[position] = `
                <div class="row">
                    <div class="${layoutIndex % 2 === 0 ? textClass : imageClass} align-content-center">
                        ${layoutIndex % 2 === 0 ? sectionContent : `
                            <img src="${url}" class="img-rounded responsive-img news-content-image_" alt="Imagem do parágrafo">
                        `}
                    </div>
                    <div class="${layoutIndex % 2 === 0 ? imageClass : textClass} align-content-center">
                        ${layoutIndex % 2 === 0 ? `
                            <img src="${url}" class="img-rounded responsive-img news-content-image_" alt="Imagem do parágrafo">
                        ` : sectionContent}
                    </div>
                </div><br>`;
            
            layoutIndex = (layoutIndex + 1) % 2;
        }
    }
    return sections.join('');
}

async function displayNewsDetails() {
    const newsContainer = document.querySelector('.news-details-container');
    const newsKey = getUrlParameter('id');
    const newsData = await fetchNews();

    const selectedKey = newsKey || Object.keys(newsData).pop();
    const selectedNews = newsData[selectedKey];

    if (!selectedNews) {
        newsContainer.innerHTML = '<p>Erro ao carregar a notícia.</p>';
        return;
    }

    const sanitizedContent = removeEmptyTags(selectedNews.content);
    const formattedContent = formatLists(sanitizedContent);
    const contentWithImages = await insertImagesInContent(formattedContent, selectedNews.images.bodyImages || []);

    newsContainer.innerHTML = `
        <div class="news-container_">
            <div class="row">
                <div class="col-12">
                    <h1 class="news-title_">${selectedNews.title}</h1>
                    <h3 class="news-subtitle_">${selectedNews.subtitle}</h3>
                    <p class="news-author_"><i class='bx bxs-megaphone'></i> ${selectedNews.author}</p>
                    <p class="news-date_">
                        <i class='bx bx-calendar'></i> ${selectedNews.date}
                    </p>
                    <img src="${selectedNews.images.titleImage}" alt="Imagem da matéria" class="img-rounded responsive-img news-image_">
                </div>
                <div class="col-12">
                    <div class="news-content_">${contentWithImages}</div>
                </div>
            </div>
        </div>
    `;
}

displayNewsDetails();
