/**
 * Hebrew-English-Malayalam OT Dictionary
 * Main Application Script
 *
 * Depends on: DICTIONARY_DATA (global array defined in js/data.js)
 * Requires: Font Awesome (for icons), app CSS
 *
 * Features:
 *  - Card rendering with virtual/infinite scroll
 *  - Full-text search with debounce
 *  - Book, part-of-speech, tag, and sort filters
 *  - Modal detail view with focus trap
 *  - Dark mode with localStorage persistence
 *  - Back-to-top button
 *  - Mobile nav menu
 *  - Scroll-triggered card animations
 *  - Keyboard shortcuts
 *  - URL hash routing (#word/ID, #book/Genesis)
 */

'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OT_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
  'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi'
];

/** Map from data-book attribute values to firstBook values */
const BOOK_ATTR_MAP = {
  'genesis': 'Genesis',
  'exodus': 'Exodus',
  'leviticus': 'Leviticus',
  'numbers': 'Numbers',
  'deuteronomy': 'Deuteronomy',
  'joshua': 'Joshua',
  'judges': 'Judges',
  'ruth': 'Ruth',
  '1samuel': '1 Samuel',
  '2samuel': '2 Samuel',
  '1kings': '1 Kings',
  '2kings': '2 Kings',
  '1chronicles': '1 Chronicles',
  '2chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'nehemiah': 'Nehemiah',
  'esther': 'Esther',
  'job': 'Job',
  'psalms': 'Psalms',
  'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes',
  'songofsolomon': 'Song of Solomon',
  'isaiah': 'Isaiah',
  'jeremiah': 'Jeremiah',
  'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel',
  'daniel': 'Daniel',
  'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'micah': 'Micah',
  'nahum': 'Nahum',
  'habakkuk': 'Habakkuk',
  'zephaniah': 'Zephaniah',
  'haggai': 'Haggai',
  'zechariah': 'Zechariah',
  'malachi': 'Malachi'
};

const HEBREW_LETTERS = [
  { letter: 'א',  name: 'Aleph',  translit: "'",   pronunciation: '(silent)' },
  { letter: 'בּ', name: 'Bet',    translit: 'b',   pronunciation: 'as in "boy"' },
  { letter: 'ב',  name: 'Vet',    translit: 'v',   pronunciation: 'as in "vine"' },
  { letter: 'גּ', name: 'Gimel',  translit: 'g',   pronunciation: 'as in "go"' },
  { letter: 'דּ', name: 'Dalet',  translit: 'd',   pronunciation: 'as in "door"' },
  { letter: 'ה',  name: 'He',     translit: 'h',   pronunciation: 'as in "hat"' },
  { letter: 'ו',  name: 'Vav',    translit: 'v/w', pronunciation: 'as in "vine" / w' },
  { letter: 'ז',  name: 'Zayin',  translit: 'z',   pronunciation: 'as in "zoo"' },
  { letter: 'ח',  name: 'Chet',   translit: 'ch',  pronunciation: 'as in Scottish "loch"' },
  { letter: 'ט',  name: 'Tet',    translit: 't',   pronunciation: 'emphatic t' },
  { letter: 'י',  name: 'Yod',    translit: 'y',   pronunciation: 'as in "yes"' },
  { letter: 'כּ', name: 'Kaf',    translit: 'k',   pronunciation: 'as in "kite"' },
  { letter: 'כ',  name: 'Khaf',   translit: 'kh',  pronunciation: 'as in Scottish "loch"' },
  { letter: 'ל',  name: 'Lamed',  translit: 'l',   pronunciation: 'as in "love"' },
  { letter: 'מ',  name: 'Mem',    translit: 'm',   pronunciation: 'as in "mother"' },
  { letter: 'נ',  name: 'Nun',    translit: 'n',   pronunciation: 'as in "no"' },
  { letter: 'ס',  name: 'Samekh', translit: 's',   pronunciation: 'as in "sun"' },
  { letter: 'ע',  name: 'Ayin',   translit: "'",   pronunciation: 'guttural stop' },
  { letter: 'פּ', name: 'Pe',     translit: 'p',   pronunciation: 'as in "pray"' },
  { letter: 'פ',  name: 'Fe',     translit: 'f',   pronunciation: 'as in "faith"' },
  { letter: 'צ',  name: 'Tsade',  translit: 'ts',  pronunciation: 'as in "bits"' },
  { letter: 'ק',  name: 'Qof',    translit: 'q',   pronunciation: 'deep k' },
  { letter: 'ר',  name: 'Resh',   translit: 'r',   pronunciation: 'as in "run"' },
  { letter: 'שׁ', name: 'Shin',   translit: 'sh',  pronunciation: 'as in "shalom"' },
  { letter: 'שׂ', name: 'Sin',    translit: 's',   pronunciation: 'as in "sun"' },
  { letter: 'תּ', name: 'Tav',    translit: 't',   pronunciation: 'as in "truth"' },
];

const HEBREW_VOWELS = [
  { mark: 'ָ',  name: 'Qamats', translit: 'a', pronunciation: 'as in "father"' },
  { mark: 'ַ',  name: 'Patach', translit: 'a', pronunciation: 'as in "bat"' },
  { mark: 'ֵ',  name: 'Tsere',  translit: 'e', pronunciation: 'as in "they"' },
  { mark: 'ֶ',  name: 'Segol',  translit: 'e', pronunciation: 'as in "bed"' },
  { mark: 'ִ',  name: 'Hiriq',  translit: 'i', pronunciation: 'as in "machine"' },
  { mark: 'ֹ',  name: 'Holam',  translit: 'o', pronunciation: 'as in "go"' },
  { mark: 'ֻ',  name: 'Qubuts', translit: 'u', pronunciation: 'as in "flute"' },
  { mark: 'ְ',  name: 'Sheva',  translit: '',  pronunciation: 'quick neutral, or silent' },
];

/** Number of cards to render in the first batch and each subsequent batch. */
const BATCH_SIZE = 50;

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------

const state = {
  /** Full dataset after sorting. */
  allData: [],
  /** Currently visible (filtered) entries. */
  filtered: [],
  /** How many cards have been rendered so far (for infinite scroll). */
  rendered: 0,
  /** Active search query string. */
  searchQuery: '',
  /** Active book filters (Set of strings). */
  activeBooks: new Set(),
  /** Active part-of-speech filter. */
  activePOS: '',
  /** Active tag filter. */
  activeTag: '',
  /** Active sort mode. */
  sortMode: 'appearance',
  /** Whether a modal is open. */
  modalOpen: false,
  /** Currently displayed entry in modal. */
  modalEntry: null,
  /** Last rendered book name (for section headers). */
  lastRenderedBook: '',
};

// ---------------------------------------------------------------------------
// Helper Utilities
// ---------------------------------------------------------------------------

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getUniqueValues(arr, key) {
  const set = new Set();
  arr.forEach(item => {
    const val = item[key];
    if (Array.isArray(val)) {
      val.forEach(v => v && set.add(v));
    } else if (val != null && val !== '') {
      set.add(val);
    }
  });
  return Array.from(set).sort();
}

function smoothScrollTo(element) {
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ---------------------------------------------------------------------------
// Malayalam Transliteration (English → Malayalam script)
// ---------------------------------------------------------------------------

function getMalayalamTranslit(entry) {
  if (!entry) return '';
  if (entry.mlTranslit) return entry.mlTranslit;
  return pronunciationToMalayalam(entry.pronunciation);
}

/** Hebrew consonant → Malayalam mapping (longest patterns first) */
const ML_CONSONANTS = [
  ['sh', 'ശ'], ['ch', 'ഖ'], ['ts', 'ത്സ'], ['tz', 'ത്സ'],
  ['kh', 'ഖ'], ['th', 'ത'], ['ph', 'ഫ'],
  ['b', 'ബ'], ['d', 'ദ'], ['f', 'ഫ'], ['g', 'ഗ'], ['h', 'ഹ'],
  ['j', 'ജ'], ['k', 'ക'], ['l', 'ല'], ['m', 'മ'], ['n', 'ന'],
  ['p', 'പ'], ['q', 'ക'], ['r', 'ര'], ['s', 'സ'], ['t', 'ത'],
  ['v', 'വ'], ['w', 'വ'], ['y', 'യ'], ['z', 'സ']
];

/** Vowel sounds → Malayalam combining signs (after a consonant) */
const ML_VOWEL_SIGNS = [
  ['ah', '\u0D3E'],  // ാ
  ['aw', '\u0D4B'],  // ോ
  ['ay', '\u0D47'],  // േ
  ['eh', '\u0D46'],  // െ
  ['ee', '\u0D40'],  // ീ
  ['ei', '\u0D47'],  // േ
  ['oo', '\u0D42'],  // ൂ
  ['oh', '\u0D4B'],  // ോ
  ['ai', '\u0D48'],  // ൈ
  ['au', '\u0D57'],  // ൗ
  ['a', '\u0D3E'],   // ാ
  ['e', '\u0D46'],   // െ
  ['i', '\u0D3F'],   // ി
  ['o', '\u0D4A'],   // ൊ
  ['u', '\u0D41']    // ു
];

/** Vowel sounds → Malayalam standalone vowels (start of syllable) */
const ML_VOWELS = [
  ['ah', 'ആ'], ['aw', 'ഓ'], ['ay', 'ഏ'],
  ['eh', 'എ'], ['ee', 'ഈ'], ['ei', 'ഏ'],
  ['oo', 'ഊ'], ['oh', 'ഓ'],
  ['ai', 'ഐ'], ['au', 'ഔ'],
  ['a', 'ആ'], ['e', 'എ'], ['i', 'ഇ'], ['o', 'ഒ'], ['u', 'ഉ']
];

const VIRAMA = '\u0D4D'; // ്

function pronunciationToMalayalam(pronunciation) {
  if (!pronunciation) return '';
  const syllables = pronunciation.toLowerCase().split(/[-\s]+/).filter(Boolean);
  return syllables.map(mapSyllableToMalayalam).join('');
}

function mapSyllableToMalayalam(syl) {
  if (!syl) return '';
  let result = '';
  let i = 0;
  let afterCons = false;

  while (i < syl.length) {
    if (!/[a-z]/.test(syl[i])) {
      if (afterCons) { result += VIRAMA; afterCons = false; }
      i++;
      continue;
    }

    let matched = false;

    for (const [pat, mal] of ML_CONSONANTS) {
      if (syl.startsWith(pat, i)) {
        if (afterCons) result += VIRAMA;
        result += mal;
        afterCons = true;
        i += pat.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const vmap = afterCons ? ML_VOWEL_SIGNS : ML_VOWELS;
      for (const [pat, mal] of vmap) {
        if (syl.startsWith(pat, i)) {
          result += mal;
          afterCons = false;
          i += pat.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) { i++; afterCons = false; }
  }

  if (afterCons) result += VIRAMA;
  return result;
}

// ---------------------------------------------------------------------------
// Hebrew Audio Pronunciation (Web Speech API)
// ---------------------------------------------------------------------------

function speakHebrew(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'he-IL';
  utter.rate = 0.7;
  window.speechSynthesis.speak(utter);
}

// ---------------------------------------------------------------------------
// DOM References (populated after DOMContentLoaded)
// ---------------------------------------------------------------------------

let dom = {};

function cacheDOMRefs() {
  dom = {
    grid:           document.getElementById('dictionary-grid'),
    searchInput:    document.getElementById('search-input'),
    searchClear:    document.getElementById('search-clear'),
    posFilter:      document.getElementById('pos-filter'),
    tagFilter:      document.getElementById('tag-filter'),
    sortSelect:     document.getElementById('sort-select'),
    clearBtn:       document.getElementById('clear-filters'),
    resetSearch:    document.getElementById('reset-search'),
    wordCount:      document.getElementById('word-count'),
    visibleCount:   document.getElementById('visible-count'),
    noResultsMsg:   document.getElementById('no-results-msg'),
    bookFilter:     document.getElementById('book-filter'),
    modalOverlay:   document.getElementById('modal-overlay'),
    modalContent:   document.getElementById('modal-content'),
    modalClose:     document.getElementById('modal-close'),
    modalPrev:      document.getElementById('modal-prev'),
    modalNext:      document.getElementById('modal-next'),
    modalNavCount:  document.getElementById('modal-nav-count'),
    darkToggle:     document.getElementById('theme-toggle'),
    backToTop:      document.getElementById('back-to-top'),
    navToggle:      document.getElementById('hamburger'),
    mobileMenu:     document.getElementById('mobile-menu'),
    loadingMore:    document.getElementById('scroll-sentinel'),
    pronounceTable: document.getElementById('pronunciation-table'),
    vowelTable:     document.getElementById('vowel-table'),
  };
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

function renderStatistics() {
  if (!DICTIONARY_DATA || !DICTIONARY_DATA.length) return;

  const total      = DICTIONARY_DATA.length;
  const books      = getUniqueValues(DICTIONARY_DATA, 'firstBook').length;
  const allTags    = [];
  DICTIONARY_DATA.forEach(e => { if (Array.isArray(e.tags)) allTags.push(...e.tags); });
  const categories = new Set(allTags).size;

  if (dom.statTotal)      dom.statTotal.textContent      = total.toLocaleString();
  if (dom.statBooks)      dom.statBooks.textContent      = books.toLocaleString();
  if (dom.statCategories) dom.statCategories.textContent = categories.toLocaleString();
}

// ---------------------------------------------------------------------------
// Book Filter Pills
// ---------------------------------------------------------------------------

function setupBookFilter() {
  if (!dom.bookFilter) return;

  dom.bookFilter.addEventListener('change', () => {
    const bookVal = dom.bookFilter.value;
    state.activeBooks.clear();
    if (bookVal !== 'all') {
      const bookName = BOOK_ATTR_MAP[bookVal] || bookVal;
      state.activeBooks.add(bookName);
    }
    applyFilters();
    updateURLHash();
  });
}

// ---------------------------------------------------------------------------
// Tag Filter Dropdown
// ---------------------------------------------------------------------------

function populateTagFilter() {
  if (!dom.tagFilter || !DICTIONARY_DATA) return;

  const tags = getUniqueValues(DICTIONARY_DATA, 'tags');
  const fragment = document.createDocumentFragment();

  tags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    fragment.appendChild(option);
  });
  dom.tagFilter.appendChild(fragment);
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

function sortData(arr) {
  const copy = arr.slice();
  switch (state.sortMode) {
    case 'hebrew':
      copy.sort((a, b) => (a.hebrew || '').localeCompare(b.hebrew || '', 'he'));
      break;
    case 'english':
      copy.sort((a, b) => {
        const ea = (a.meanings && a.meanings[0] && a.meanings[0].en) ? a.meanings[0].en : '';
        const eb = (b.meanings && b.meanings[0] && b.meanings[0].en) ? b.meanings[0].en : '';
        return ea.localeCompare(eb, 'en', { sensitivity: 'base' });
      });
      break;
    case 'appearance':
    default:
      copy.sort((a, b) => (a.id || 0) - (b.id || 0));
      break;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Search & Filter Logic
// ---------------------------------------------------------------------------

function matchesSearch(entry, query) {
  if (!query) return true;
  const q = query.toLowerCase();

  if (entry.hebrew && entry.hebrew.includes(query)) return true;
  if (entry.transliteration && entry.transliteration.toLowerCase().includes(q)) return true;

  if (Array.isArray(entry.meanings)) {
    for (const m of entry.meanings) {
      if (m.en && m.en.toLowerCase().includes(q)) return true;
      if (m.ml && m.ml.includes(query)) return true;
    }
  }

  if (Array.isArray(entry.tags)) {
    for (const t of entry.tags) {
      if (t.toLowerCase().includes(q)) return true;
    }
  }

  return false;
}

function applyFilters() {
  let result = state.allData.slice();

  if (state.searchQuery) {
    result = result.filter(e => matchesSearch(e, state.searchQuery));
  }

  if (state.activeBooks.size > 0) {
    result = result.filter(e => state.activeBooks.has(e.firstBook));
  }

  if (state.activePOS) {
    const pos = state.activePOS.toLowerCase();
    result = result.filter(e => e.partOfSpeech && e.partOfSpeech.toLowerCase() === pos);
  }

  if (state.activeTag) {
    result = result.filter(e => Array.isArray(e.tags) && e.tags.includes(state.activeTag));
  }

  result = sortData(result);

  state.filtered = result;
  state.rendered  = 0;
  renderCards();
}

// ---------------------------------------------------------------------------
// Card DOM Builder
// ---------------------------------------------------------------------------

function buildCardElement(entry, index) {
  const card = document.createElement('div');
  card.className = 'word-card';
  card.dataset.id = entry.id;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${escapeHtml(entry.transliteration || entry.hebrew)}`);
  card.style.setProperty('--card-index', index % BATCH_SIZE);

  const firstMeaning = (entry.meanings && entry.meanings[0]) || {};
  const enText = firstMeaning.en  || '';
  const mlText = firstMeaning.ml  || '';

  const mlTranslit = getMalayalamTranslit(entry);

  card.innerHTML = `
    <div class="card-header">
      <span class="card-pos">${escapeHtml(entry.partOfSpeech || '')}</span>
      <span class="card-book"><i class="fas fa-bookmark" aria-hidden="true"></i> ${escapeHtml(entry.firstBook || '')}</span>
    </div>
    <div class="card-hebrew-row">
      <span class="card-hebrew" lang="he" dir="rtl">${escapeHtml(entry.hebrew || '')}</span>
      <button class="card-audio-btn" type="button" aria-label="Hear pronunciation" title="Listen to pronunciation">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </div>
    <div class="card-translit-row">
      <span class="card-transliteration">${escapeHtml(entry.transliteration || '')}</span>
      <span class="card-translit-sep">·</span>
      <span class="card-ml-translit" lang="ml">${mlTranslit}</span>
    </div>
    <div class="card-meanings">
      <div class="meaning-en">${escapeHtml(enText)}</div>
      <div class="card-malayalam" lang="ml">${escapeHtml(mlText)}</div>
    </div>
  `;

  const audioBtn = card.querySelector('.card-audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', e => {
      e.stopPropagation();
      speakHebrew(entry.hebrew);
    });
  }

  card.addEventListener('click', () => openModal(entry));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(entry);
    }
  });

  return card;
}

// ---------------------------------------------------------------------------
// Render Cards (with infinite scroll batching)
// ---------------------------------------------------------------------------

function renderCards(append = false) {
  if (!dom.grid) return;

  if (!append) {
    dom.grid.innerHTML = '';
    state.rendered = 0;
    state.lastRenderedBook = '';
  }

  const batch = state.filtered.slice(state.rendered, state.rendered + BATCH_SIZE);
  const fragment = document.createDocumentFragment();

  batch.forEach((entry, i) => {
    if (state.sortMode === 'appearance' && entry.firstBook && entry.firstBook !== state.lastRenderedBook) {
      const header = document.createElement('div');
      header.className = 'book-section-header';
      header.innerHTML = `<i class="fa-solid fa-book-bible" aria-hidden="true"></i> <span>${escapeHtml(entry.firstBook)}</span>`;
      fragment.appendChild(header);
      state.lastRenderedBook = entry.firstBook;
    }
    const card = buildCardElement(entry, state.rendered + i);
    fragment.appendChild(card);
  });

  dom.grid.appendChild(fragment);
  state.rendered += batch.length;

  observeCards();
  updateWordCount();

  if (dom.loadingMore) {
    dom.loadingMore.style.display = state.rendered < state.filtered.length ? 'block' : 'none';
  }
}

function updateWordCount() {
  const total = (DICTIONARY_DATA && DICTIONARY_DATA.length) || 0;
  const count = state.filtered.length;

  if (dom.visibleCount) {
    dom.visibleCount.textContent = count.toLocaleString();
  }
  if (dom.wordCount) {
    dom.wordCount.hidden = (count === 0);
  }
  if (dom.noResultsMsg) {
    dom.noResultsMsg.hidden = (count > 0);
  }
}

// ---------------------------------------------------------------------------
// Infinite Scroll
// ---------------------------------------------------------------------------

let scrollObserver = null;

function setupInfiniteScroll() {
  if (scrollObserver) scrollObserver.disconnect();

  const sentinel = document.getElementById('scroll-sentinel');
  if (!sentinel) return;

  scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && state.rendered < state.filtered.length) {
        renderCards(true);
      }
    });
  }, { rootMargin: '200px' });

  scrollObserver.observe(sentinel);
}

// ---------------------------------------------------------------------------
// Scroll Animations (IntersectionObserver)
// ---------------------------------------------------------------------------

let animationObserver = null;

function setupAnimationObserver() {
  animationObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animationObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
}

function observeCards() {
  if (!animationObserver || !dom.grid) return;
  dom.grid.querySelectorAll('.word-card:not(.animate-in)').forEach(card => {
    animationObserver.observe(card);
  });
}

// ---------------------------------------------------------------------------
// Skeleton Loading
// ---------------------------------------------------------------------------

function showSkeletons(count = 12) {
  if (!dom.grid) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'word-card skeleton-card';
    sk.setAttribute('aria-hidden', 'true');
    sk.innerHTML = `
      <div class="skeleton-line skeleton-line--short"></div>
      <div class="skeleton-line skeleton-line--hebrew"></div>
      <div class="skeleton-line skeleton-line--medium"></div>
      <div class="skeleton-line skeleton-line--long"></div>
      <div class="skeleton-line skeleton-line--long"></div>
    `;
    fragment.appendChild(sk);
  }
  dom.grid.innerHTML = '';
  dom.grid.appendChild(fragment);
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

let modalPreviousFocus = null;

function getFocusableModalElements() {
  if (!dom.modalContent) return [];
  return Array.from(
    dom.modalContent.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

function openModal(entry) {
  if (!dom.modalOverlay || !dom.modalContent) return;

  modalPreviousFocus = document.activeElement;
  state.modalOpen = true;
  state.modalEntry = entry;

  updateModalNav(entry);

  const meaningsHTML = Array.isArray(entry.meanings)
    ? entry.meanings.map(m => `
        <div class="modal-meaning-row">
          <div class="modal-meaning-en">${escapeHtml(m.en || '')}</div>
          <div class="modal-meaning-ml" lang="ml">${escapeHtml(m.ml || '')}</div>
        </div>
      `).join('')
    : '';

  const tagsHTML = Array.isArray(entry.tags)
    ? entry.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')
    : '';

  const mlTranslit = getMalayalamTranslit(entry);

  dom.modalContent.innerHTML = `
    <div class="modal-header">
      <div class="modal-hebrew-row">
        <span class="modal-hebrew" lang="he" dir="rtl">${escapeHtml(entry.hebrew || '')}</span>
        <button class="modal-audio-btn" type="button" aria-label="Hear pronunciation" title="Listen to pronunciation">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
      <div class="modal-translit-row">
        <span class="modal-translit">${escapeHtml(entry.transliteration || '')}</span>
        <span class="modal-translit-sep">·</span>
        <span class="modal-ml-translit" lang="ml">${mlTranslit}</span>
      </div>
      <div class="modal-pronunciation">/${escapeHtml(entry.pronunciation || '')}/</div>
      <span class="modal-pos-badge card-pos">${escapeHtml(entry.partOfSpeech || '')}</span>
    </div>

    <hr class="modal-divider" />

    <section class="modal-section">
      <h3 class="modal-section-title"><i class="fa-solid fa-spell-check" aria-hidden="true"></i> Meanings</h3>
      ${meaningsHTML}
    </section>

    <section class="modal-section">
      <h3 class="modal-section-title"><i class="fa-solid fa-book-open" aria-hidden="true"></i> First Occurrence</h3>
      <p class="modal-ref">
        <strong>${escapeHtml(entry.firstBook || '')}</strong> &mdash; ${escapeHtml(entry.firstRef || '')}
      </p>
    </section>

    ${tagsHTML ? `
    <section class="modal-section">
      <h3 class="modal-section-title"><i class="fa-solid fa-tags" aria-hidden="true"></i> Thematic Tags</h3>
      <div class="modal-tags">${tagsHTML}</div>
    </section>` : ''}
  `;

  const modalAudioBtn = dom.modalContent.querySelector('.modal-audio-btn');
  if (modalAudioBtn) {
    modalAudioBtn.addEventListener('click', () => speakHebrew(entry.hebrew));
  }

  dom.modalOverlay.classList.add('active');
  document.body.classList.add('modal-open');
  dom.modalOverlay.setAttribute('aria-hidden', 'false');

  dom.modalClose.focus();

  history.replaceState(null, '', `#word/${entry.id}`);
}

function closeModal() {
  if (!dom.modalOverlay) return;
  state.modalOpen = false;
  dom.modalOverlay.classList.remove('active');
  document.body.classList.remove('modal-open');
  dom.modalOverlay.setAttribute('aria-hidden', 'true');

  if (modalPreviousFocus) {
    modalPreviousFocus.focus();
    modalPreviousFocus = null;
  }

  if (window.location.hash.startsWith('#word/')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

// ---------------------------------------------------------------------------
// Modal Navigation (Prev/Next)
// ---------------------------------------------------------------------------

function updateModalNav(entry) {
  const idx = state.filtered.findIndex(e => e.id === entry.id);
  if (dom.modalNavCount) {
    dom.modalNavCount.textContent = `${idx + 1} of ${state.filtered.length}`;
  }
  if (dom.modalPrev) dom.modalPrev.disabled = (idx <= 0);
  if (dom.modalNext) dom.modalNext.disabled = (idx >= state.filtered.length - 1);
}

function navigateModal(direction) {
  if (!state.modalEntry) return;
  const idx = state.filtered.findIndex(e => e.id === state.modalEntry.id);
  const nextIdx = idx + direction;
  if (nextIdx >= 0 && nextIdx < state.filtered.length) {
    openModal(state.filtered[nextIdx]);
  }
}

function handleModalKeyboard(e) {
  if (!state.modalOpen) return;

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  if (e.key === 'ArrowLeft') {
    navigateModal(-1);
    return;
  }
  if (e.key === 'ArrowRight') {
    navigateModal(1);
    return;
  }

  if (e.key === 'Tab') {
    const focusable = getFocusableModalElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Dark Mode
// ---------------------------------------------------------------------------

function loadDarkModePreference() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    updateDarkToggleIcon(true);
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('darkMode', isDark);
  updateDarkToggleIcon(isDark);
}

function updateDarkToggleIcon(isDark) {
  if (!dom.darkToggle) return;
  dom.darkToggle.setAttribute('aria-pressed', isDark);
  dom.darkToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

// ---------------------------------------------------------------------------
// Back to Top Button
// ---------------------------------------------------------------------------

function setupBackToTop() {
  if (!dom.backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      dom.backToTop.classList.add('visible');
    } else {
      dom.backToTop.classList.remove('visible');
    }
  }, { passive: true });

  dom.backToTop.addEventListener('click', () => smoothScrollTo());
}

// ---------------------------------------------------------------------------
// Mobile Menu
// ---------------------------------------------------------------------------

function setupMobileMenu() {
  if (!dom.navToggle || !dom.mobileMenu) return;

  dom.navToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dom.mobileMenu.classList.toggle('active');
    dom.navToggle.setAttribute('aria-expanded', isOpen);
    dom.mobileMenu.setAttribute('aria-hidden', !isOpen);
    dom.mobileMenu.querySelectorAll('a').forEach(a => {
      a.tabIndex = isOpen ? 0 : -1;
    });
  });

  document.addEventListener('click', e => {
    if (dom.mobileMenu.classList.contains('active') &&
        !dom.mobileMenu.contains(e.target) &&
        !dom.navToggle.contains(e.target)) {
      dom.mobileMenu.classList.remove('active');
      dom.navToggle.setAttribute('aria-expanded', 'false');
      dom.mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });

  dom.mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dom.mobileMenu.classList.remove('active');
      dom.navToggle.setAttribute('aria-expanded', 'false');
      dom.mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
}

// ---------------------------------------------------------------------------
// Keyboard Shortcuts
// ---------------------------------------------------------------------------

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (dom.searchInput) dom.searchInput.focus();
      return;
    }

    if (e.key === 'Escape' && state.modalOpen) {
      closeModal();
      return;
    }

    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' ||
         e.key === 'ArrowDown'  || e.key === 'ArrowUp') &&
        document.activeElement.classList.contains('word-card')) {
      e.preventDefault();
      navigateCards(e.key);
    }
  });

  document.addEventListener('keydown', handleModalKeyboard);
}

function navigateCards(key) {
  const cards = Array.from(dom.grid.querySelectorAll('.word-card'));
  const current = cards.indexOf(document.activeElement);
  if (current === -1) return;

  let next = current;
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    next = Math.min(current + 1, cards.length - 1);
  } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
    next = Math.max(current - 1, 0);
  }

  if (next !== current) cards[next].focus();
}

// ---------------------------------------------------------------------------
// URL Hash Routing
// ---------------------------------------------------------------------------

function updateURLHash() {
  const books = Array.from(state.activeBooks);
  if (books.length === 1) {
    history.replaceState(null, '', `#book/${encodeURIComponent(books[0])}`);
  } else if (!state.modalOpen) {
    if (window.location.hash.startsWith('#book/') ||
        window.location.hash.startsWith('#word/')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
}

function handleInitialHash() {
  const hash = window.location.hash;
  if (!hash) return;

  if (hash.startsWith('#word/')) {
    const id = parseInt(hash.slice(6), 10);
    if (!isNaN(id)) {
      const entry = DICTIONARY_DATA.find(e => e.id === id);
      if (entry) {
        requestAnimationFrame(() => openModal(entry));
      }
    }
  } else if (hash.startsWith('#book/')) {
    const book = decodeURIComponent(hash.slice(6));
    if (OT_BOOKS.includes(book)) {
      state.activeBooks.add(book);
      if (dom.bookFilter) {
        // Find the option value that maps to this book name
        const optVal = Object.entries(BOOK_ATTR_MAP).find(([k, v]) => v === book);
        if (optVal) dom.bookFilter.value = optVal[0];
      }
      applyFilters();
    }
  }
}

// ---------------------------------------------------------------------------
// Clear Filters
// ---------------------------------------------------------------------------

function clearAllFilters() {
  state.searchQuery = '';
  state.activeBooks.clear();
  state.activePOS   = '';
  state.activeTag   = '';
  state.sortMode    = 'appearance';

  if (dom.searchInput) dom.searchInput.value = '';
  if (dom.searchClear) dom.searchClear.hidden = true;
  if (dom.posFilter)   dom.posFilter.value   = 'all';
  if (dom.tagFilter)   dom.tagFilter.value   = 'all';
  if (dom.sortSelect)  dom.sortSelect.value  = 'appearance';

  if (dom.bookFilter) dom.bookFilter.value = 'all';

  history.replaceState(null, '', window.location.pathname);
  applyFilters();
}

// ---------------------------------------------------------------------------
// Event Listeners Setup
// ---------------------------------------------------------------------------

function setupEventListeners() {
  if (dom.searchInput) {
    dom.searchInput.addEventListener('input', debounce(e => {
      state.searchQuery = e.target.value.trim();
      if (dom.searchClear) {
        dom.searchClear.hidden = !state.searchQuery;
      }
      applyFilters();
    }, 300));
  }

  if (dom.searchClear) {
    dom.searchClear.addEventListener('click', () => {
      if (dom.searchInput) dom.searchInput.value = '';
      state.searchQuery = '';
      dom.searchClear.hidden = true;
      applyFilters();
      if (dom.searchInput) dom.searchInput.focus();
    });
  }

  if (dom.resetSearch) {
    dom.resetSearch.addEventListener('click', clearAllFilters);
  }

  if (dom.posFilter) {
    dom.posFilter.addEventListener('change', e => {
      state.activePOS = e.target.value === 'all' ? '' : e.target.value;
      applyFilters();
    });
  }

  if (dom.tagFilter) {
    dom.tagFilter.addEventListener('change', e => {
      state.activeTag = e.target.value === 'all' ? '' : e.target.value;
      applyFilters();
    });
  }

  if (dom.sortSelect) {
    dom.sortSelect.addEventListener('change', e => {
      state.sortMode = e.target.value;
      applyFilters();
    });
  }

  if (dom.clearBtn) {
    dom.clearBtn.addEventListener('click', clearAllFilters);
  }

  if (dom.modalOverlay) {
    dom.modalOverlay.addEventListener('click', e => {
      if (e.target === dom.modalOverlay) closeModal();
    });
    dom.modalOverlay.setAttribute('aria-hidden', 'true');
  }

  if (dom.modalClose) {
    dom.modalClose.addEventListener('click', closeModal);
  }

  if (dom.modalPrev) {
    dom.modalPrev.addEventListener('click', () => navigateModal(-1));
  }
  if (dom.modalNext) {
    dom.modalNext.addEventListener('click', () => navigateModal(1));
  }

  if (dom.darkToggle) {
    dom.darkToggle.addEventListener('click', toggleDarkMode);
  }
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  if (typeof DICTIONARY_DATA === 'undefined' || !Array.isArray(DICTIONARY_DATA)) {
    console.error('[app.js] DICTIONARY_DATA is not defined. Make sure js/data.js is loaded before app.js.');
    return;
  }

  cacheDOMRefs();
  loadDarkModePreference();
  showSkeletons(12);

  state.allData = sortData(DICTIONARY_DATA.slice());
  state.filtered = state.allData.slice();

  setupBookFilter();
  populateTagFilter();

  setupAnimationObserver();

  setupEventListeners();
  setupBackToTop();
  setupMobileMenu();
  setupKeyboardShortcuts();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      renderCards();
      setupInfiniteScroll();
      handleInitialHash();
    });
  });

  // Feedback modal
  setupFeedbackModal();
});

// ---------------------------------------------------------------------------
// Feedback Modal
// ---------------------------------------------------------------------------

function setupFeedbackModal() {
  const overlay = document.getElementById('feedback-overlay');
  const fab = document.getElementById('feedback-fab');
  const closeBtn = document.getElementById('feedback-close');
  const submitBtn = document.getElementById('feedback-submit');
  const footerBtn = document.getElementById('footer-feedback-btn');
  const typeBtns = document.querySelectorAll('.feedback-type-btn');
  const textarea = document.getElementById('feedback-message');

  if (!overlay) return;

  let selectedType = 'Bug';

  function openFeedback() {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    if (textarea) textarea.focus();
  }

  function closeFeedback() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
  }

  if (fab) fab.addEventListener('click', openFeedback);
  if (footerBtn) footerBtn.addEventListener('click', openFeedback);
  if (closeBtn) closeBtn.addEventListener('click', closeFeedback);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeFeedback();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeFeedback();
    }
  });

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    });
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const message = textarea ? textarea.value.trim() : '';
      const subject = encodeURIComponent(`[Hebrew OT Dictionary] ${selectedType}`);
      const body = encodeURIComponent(
        `Type: ${selectedType}\n\nMessage:\n${message}\n\n---\nPage: ${window.location.href}\nUser Agent: ${navigator.userAgent}`
      );
      window.location.href = `mailto:your-email@example.com?subject=${subject}&body=${body}`;
      closeFeedback();
      if (textarea) textarea.value = '';
    });
  }
}
