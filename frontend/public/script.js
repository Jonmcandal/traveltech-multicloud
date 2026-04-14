// ===== CONFIGURATION =====
// Change these URLs after deploying each service to cloud
const CONFIG = {
  FAVORITES_API: 'https://service-favorites.onrender.com',
  WISHLIST_API:  'https://traveltech-multicloud-mq85.vercel.app',
  HISTORY_API:   'https://traveltech-multicloud-yydf.vercel.app',
  COUNTRIES_API: 'https://restcountries.com/v3.1'
};

// For local development, uncomment:
// const CONFIG = {
//   FAVORITES_API: 'http://localhost:3001',
//   WISHLIST_API:  'http://localhost:3002',
//   HISTORY_API:   'http://localhost:3003',
//   COUNTRIES_API: 'https://restcountries.com/v3.1'
// };

// ===== STATE =====
let currentCountry = null;
let favorites = [];
let wishlist  = [];

// ===== DOM ELEMENTS =====
const searchInput     = document.getElementById('searchInput');
const searchBtn       = document.getElementById('searchBtn');
const searchResult    = document.getElementById('searchResult');
const favoritesList   = document.getElementById('favoritesList');
const wishlistItems   = document.getElementById('wishlistItems');
const historyList     = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
  loadWishlist();
  loadHistory();

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleSearch();
  });
  clearHistoryBtn.addEventListener('click', clearHistory);
});

// ===== SEARCH =====
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  searchResult.innerHTML = '<p class="msg-loading">Cercant...</p>';
  currentCountry = null;

  try {
    const res = await fetch(`${CONFIG.COUNTRIES_API}/name/${encodeURIComponent(query)}?fullText=false`);
    if (!res.ok) throw new Error('País no trobat');
    const data = await res.json();
    const country = data[0];

    currentCountry = {
      code: country.cca3,
      name: country.name.common,
      flag: country.flag || ''
    };

    // Save to history
    await addToHistory(query, country);

    renderCountryCard(country);
  } catch (err) {
    searchResult.innerHTML = `<p class="msg-error">No s'ha trobat cap país amb "${query}".</p>`;
  }
}

function renderCountryCard(country) {
  const code    = country.cca3;
  const name    = country.name.common;
  const capital = country.capital ? country.capital[0] : 'N/A';
  const region  = country.region || 'N/A';
  const subregion = country.subregion || 'N/A';
  const pop     = country.population ? country.population.toLocaleString('ca') : 'N/A';
  const flag    = country.flag || '';
  const langs   = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
  const area    = country.area ? country.area.toLocaleString('ca') + ' km²' : 'N/A';

  const isFav  = favorites.some(f => f.code === code);
  const isWish = wishlist.some(w => w.code === code);

  searchResult.innerHTML = `
    <div class="country-card">
      <div class="flag">${flag}</div>
      <h3>${name}</h3>
      <div class="info-grid">
        <div>Capital:</div>       <div><span>${capital}</span></div>
        <div>Regió:</div>         <div><span>${region} — ${subregion}</span></div>
        <div>Població:</div>      <div><span>${pop}</span></div>
        <div>Àrea:</div>          <div><span>${area}</span></div>
        <div>Idiomes:</div>       <div><span>${langs}</span></div>
      </div>
      <div class="action-buttons">
        ${isFav
          ? `<button class="btn-unfav" onclick="removeFromFavorites('${code}')">⭐ Treure de favorits</button>`
          : `<button class="btn-fav"   onclick="addToFavorites('${code}','${escapeSingleQuotes(name)}','${flag}')">⭐ Afegir a favorits</button>`
        }
        ${isWish
          ? `<button class="btn-unwish" onclick="removeFromWishlist('${code}')">🗺️ Treure de wishlist</button>`
          : `<button class="btn-wish"   onclick="addToWishlist('${code}','${escapeSingleQuotes(name)}','${flag}')">🗺️ Afegir a wishlist</button>`
        }
      </div>
    </div>
  `;
}

function escapeSingleQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// ===== FAVORITES =====
async function loadFavorites() {
  try {
    const res  = await fetch(`${CONFIG.FAVORITES_API}/favorites`);
    favorites  = await res.json();
    renderFavorites();
  } catch {
    favoritesList.innerHTML = '<p class="msg-error">Error carregant favorits.</p>';
  }
}

function renderFavorites() {
  if (!favorites.length) {
    favoritesList.innerHTML = '<p class="empty">No hi ha favorits encara.</p>';
    return;
  }
  favoritesList.innerHTML = favorites.map(f => `
    <div class="list-item">
      <span class="item-flag">${f.flag}</span>
      <span class="item-name">${f.name}</span>
      <button onclick="removeFromFavorites('${f.code}')">Eliminar</button>
    </div>
  `).join('');
}

async function addToFavorites(code, name, flag) {
  try {
    const res = await fetch(`${CONFIG.FAVORITES_API}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, flag })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Error afegint a favorits');
      return;
    }
    await loadFavorites();
    if (currentCountry && currentCountry.code === code) {
      refreshCountryActions();
    }
  } catch {
    alert('Error connectant amb el servei de favorits');
  }
}

async function removeFromFavorites(code) {
  try {
    await fetch(`${CONFIG.FAVORITES_API}/favorites/${code}`, { method: 'DELETE' });
    await loadFavorites();
    if (currentCountry && currentCountry.code === code) {
      refreshCountryActions();
    }
  } catch {
    alert('Error eliminant de favorits');
  }
}

// ===== WISHLIST =====
async function loadWishlist() {
  try {
    const res = await fetch(`${CONFIG.WISHLIST_API}/wishlist`);
    wishlist  = await res.json();
    renderWishlist();
  } catch {
    wishlistItems.innerHTML = '<p class="msg-error">Error carregant la wishlist.</p>';
  }
}

function renderWishlist() {
  if (!wishlist.length) {
    wishlistItems.innerHTML = '<p class="empty">La wishlist és buida.</p>';
    return;
  }
  wishlistItems.innerHTML = wishlist.map(w => `
    <div class="list-item">
      <span class="item-flag">${w.flag}</span>
      <div style="flex:1">
        <div class="item-name">${w.name}</div>
        ${w.reason ? `<div class="wishlist-reason">${w.reason}</div>` : ''}
      </div>
      <button onclick="removeFromWishlist('${w.code}')">Eliminar</button>
    </div>
  `).join('');
}

async function addToWishlist(code, name, flag) {
  const reason = prompt(`Per qué vols visitar ${name}? (opcional)`);
  try {
    const res = await fetch(`${CONFIG.WISHLIST_API}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, flag, reason: reason || '' })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Error afegint a wishlist');
      return;
    }
    await loadWishlist();
    if (currentCountry && currentCountry.code === code) {
      refreshCountryActions();
    }
  } catch {
    alert('Error connectant amb el servei de wishlist');
  }
}

async function removeFromWishlist(code) {
  try {
    await fetch(`${CONFIG.WISHLIST_API}/wishlist/${code}`, { method: 'DELETE' });
    await loadWishlist();
    if (currentCountry && currentCountry.code === code) {
      refreshCountryActions();
    }
  } catch {
    alert('Error eliminant de la wishlist');
  }
}

// ===== HISTORY =====
async function loadHistory() {
  try {
    const res = await fetch(`${CONFIG.HISTORY_API}/history`);
    const history = await res.json();
    renderHistory(history);
  } catch {
    historyList.innerHTML = '<p class="msg-error">Error carregant l\'historial.</p>';
  }
}

function renderHistory(history) {
  if (!history.length) {
    historyList.innerHTML = '<p class="empty">No hi ha cerques recents.</p>';
    return;
  }
  historyList.innerHTML = history.slice(0, 10).map(h => {
    const time = new Date(h.searchedAt).toLocaleString('ca');
    return `
      <div class="history-item">
        <span class="item-flag">${h.flag || '🌍'}</span>
        <span class="history-query" onclick="searchFromHistory('${escapeSingleQuotes(h.query)}')">${h.query}</span>
        <span class="history-time">${time}</span>
        <button onclick="removeHistoryEntry(${h.id})" title="Eliminar">✕</button>
      </div>
    `;
  }).join('');
}

async function addToHistory(query, country) {
  try {
    await fetch(`${CONFIG.HISTORY_API}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        code: country.cca3,
        name: country.name.common,
        flag: country.flag || ''
      })
    });
    await loadHistory();
  } catch {
    // History failures are non-critical
  }
}

async function clearHistory() {
  if (!confirm('Vols esborrar tot l\'historial?')) return;
  try {
    await fetch(`${CONFIG.HISTORY_API}/history`, { method: 'DELETE' });
    await loadHistory();
  } catch {
    alert('Error esborrant l\'historial');
  }
}

async function removeHistoryEntry(id) {
  try {
    await fetch(`${CONFIG.HISTORY_API}/history/${id}`, { method: 'DELETE' });
    await loadHistory();
  } catch {
    alert('Error eliminant l\'entrada');
  }
}

function searchFromHistory(query) {
  searchInput.value = query;
  handleSearch();
}

// ===== HELPERS =====
function refreshCountryActions() {
  if (!currentCountry) return;
  // Re-render the action buttons in the current country card
  const actionBtns = document.querySelector('.action-buttons');
  if (!actionBtns) return;
  const code = currentCountry.code;
  const name = currentCountry.name;
  const flag = currentCountry.flag;
  const isFav  = favorites.some(f => f.code === code);
  const isWish = wishlist.some(w => w.code === code);

  actionBtns.innerHTML = `
    ${isFav
      ? `<button class="btn-unfav" onclick="removeFromFavorites('${code}')">⭐ Treure de favorits</button>`
      : `<button class="btn-fav"   onclick="addToFavorites('${code}','${escapeSingleQuotes(name)}','${flag}')">⭐ Afegir a favorits</button>`
    }
    ${isWish
      ? `<button class="btn-unwish" onclick="removeFromWishlist('${code}')">🗺️ Treure de wishlist</button>`
      : `<button class="btn-wish"   onclick="addToWishlist('${code}','${escapeSingleQuotes(name)}','${flag}')">🗺️ Afegir a wishlist</button>`
    }
  `;
}
