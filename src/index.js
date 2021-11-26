import { fetchImages } from './js/fetchGallery';
import { trackScroll, backToTop, scrollGallery } from './js/scroll';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

const form = document.querySelector('#form-search');
const galleryEl = document.querySelector('.gallery');
const loadMore = document.querySelector('.button-load-more');
let gallery;
let isFirstPage;
let currentPage;
const pageSize = 40;

form.addEventListener('submit', oonSubmitClick);
loadMore.addEventListener('click', clickLoadMore);

loadMore.classList.add('is-hidden');

trackScroll();
backToTop();

function oonSubmitClick(e) {
  e.preventDefault();
  initStartData();
  createGallery();
}

function clickLoadMore() {
  gallery.destroy();
  createGallery();
}

function createGallery() {
  loadMore.classList.add('is-hidden');
  getImages();
}

function getImages() {
  const query = form.elements.searchQuery.value.trim();

  if (query === '') {
    Notify.info(`The search string cannot be empty. Please specify your search query.`);
    return;
  }

  fetchImages(query, currentPage, pageSize)
    .then(({ data }) => {
      if (data.hits.length === 0) {
        Notify.failure(`Sorry, there are no images matching your search query. Please try again.`);
      } else {
        const restOfImages = data.totalHits - currentPage * pageSize;

        if (isFirstPage) Notify.success(`Hooray! We found ${data.totalHits} images.`);

        renderGallery(data.hits);

        if (!isFirstPage) scrollGallery(galleryEl);
        isFirstPage = false;

        restOfImages < 1 ? stopLoadMore() : loadMore.classList.remove('is-hidden');

        currentPage += 1;
      }
    })
    .catch(error => console.log(error));
}

function renderGallery(images) {
  const markup = images
    .map(image => {
      const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;
      return `<a class="gallery__link" href="${largeImageURL}">
      <div class="photo-card">
          <div class="photo-thumb">
            <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy"/>
          </div>
          <div class="info">
            <p class="info-item">
              <b>Likes</b> ${likes}
            </p>
            <p class="info-item">
              <b>Views</b> ${views}
            </p>
            <p class="info-item">
              <b>Comments</b> ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b> ${downloads}
            </p>
          </div>
      </div>
      </a>`;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
  gallery = new SimpleLightbox('.gallery a');
}

function stopLoadMore() {
  loadMore.classList.add('is-hidden');
  galleryEl.insertAdjacentHTML(
    'afterend',
    `<p class="limit-reached"><span class="material-icons">info</span> We're sorry, but you've reached the end of search results!</p>`,
  );
  form.reset();
}

function initStartData() {
  currentPage = 1;
  isFirstPage = true;
  document.querySelector('.limit-reached')?.remove();
  galleryEl.innerHTML = '';
}