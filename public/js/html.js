import { fetchNews } from './fetchData.js';

async function listNews() {
    const newsContainer = document.querySelector('.news-wrapper');
    const newsData = await fetchNews();

    if (!newsData) {
        newsContainer.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
        return;
    }

    const newsList = Object.keys(newsData)
        .reverse()
        .map((key, index) => {
            const news = newsData[key];
            const hasDateTime = /\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}/.test(news.date);
            let datePart = '';
            let timePart = '';

            if (hasDateTime) {
                [datePart, timePart] = news.date.split(' ');
            } else {
                datePart = 'Data inválida';
                timePart = '';
            }

            const timeDisplay = timePart ? `<i class='bx bx-time-five'></i> ${timePart}` : '';

            // Alternar ordem das colunas
            const layout = index % 2 === 0 
                ? `
                    <div class="col-xl-4 img-container news-image-container align-content-center">
                        <img src="${news.images.titleImage}" alt="Imagem da matéria" class="img-rounded responsive-img news-image-">
                    </div>
                    <div class="col-xl-8 align-content-center">
                        <h3 class="news-title-">${news.title}</h3>
                        <h4 class="news-subtitle-">${news.subtitle}</h4>
                        <p class="news-author-"><i class='bx bxs-megaphone'></i> ${news.author}</p>
                        <p class="news-date-">
                            <i class='bx bx-calendar'></i> ${datePart} 
                            ${timeDisplay}
                        </p>
                    </div>
                `
                : `
                    <div class="col-xl-8 align-content-center">
                        <h3 class="news-title-">${news.title}</h3>
                        <h4 class="news-subtitle-">${news.subtitle}</h4>
                        <p class="news-author-"><i class='bx bxs-megaphone'></i> ${news.author}</p>
                        <p class="news-date-">
                            <i class='bx bx-calendar'></i> ${datePart} 
                            ${timeDisplay}
                        </p>
                    </div>
                    <div class="col-xl-4 img-container news-image-container align-content-center">
                        <img src="${news.images.titleImage}" alt="Imagem da matéria" class="img-rounded responsive-img news-image-">
                    </div>
                `;

            return `
                <a href="news.html?id=${key}" class="news-style" data-key="${key}">
                    <div class="row">
                        ${layout}
                    </div>
                </a>
            `;
        })
        .join('');

    newsContainer.innerHTML = newsList;
}

listNews();
