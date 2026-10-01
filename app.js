/* =============================================================
   IT 327 - Web Systems and Technologies 2
   Activity 3 : CONSUME A REAL WEB SERVICE
   -------------------------------------------------------------
   Part B: Server-Side Proxy
   ============================================================= */

const API_BASE = 'proxy.php';

const input = document.getElementById('q');
const button = document.getElementById('go');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

/* ---------- Four UI states ---------- */

function setState(state, message) {
  statusEl.className = state === 'error' ? 'error' : '';
  button.disabled = state === 'loading';

  if (state === 'loading') {
    statusEl.textContent = 'Searching...';
    resultsEl.innerHTML = '';
  }

  if (state === 'ready') {
    statusEl.textContent = '';
  }

  if (state === 'empty') {
    statusEl.textContent = 'No places matched that name.';
    resultsEl.innerHTML = '';
  }

  if (state === 'error') {
    statusEl.textContent = message;
    resultsEl.innerHTML = '';
  }
}

/* ---------- Display the results ---------- */

function render(places) {
  resultsEl.innerHTML = '';

  places.forEach(function (place) {
    const li = document.createElement('li');

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = place.name || 'Unknown place';

    const meta = document.createElement('div');
    meta.className = 'meta';

    let locationText = place.country || '';

    if (place.admin1) {
      locationText = locationText + ' - ' + place.admin1;
    }

    meta.textContent =
      locationText +
      ' | Coordinates: ' +
      place.latitude +
      ', ' +
      place.longitude;

    li.appendChild(name);
    li.appendChild(meta);

    resultsEl.appendChild(li);
  });
}

/* ---------- Search the API through proxy.php ---------- */

async function searchPlaces(term) {
  setState('loading');

  const url =
    API_BASE +
    '?name=' +
    encodeURIComponent(term) +
    '&count=5&language=en&format=json';

  try {
    const res = await fetch(url);

    /* Handle HTTP 429 */
    if (res.status === 429) {
      setState(
        'error',
        'Too many requests. Please slow down and try again.'
      );
      return;
    }

    /* Check for HTTP errors */
    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();

    /* No results = EMPTY state */
    const places = data.results || [];

    if (places.length === 0) {
      setState('empty');
      return;
    }

    /* Results found = READY state */
    render(places);
    setState('ready');

  } catch (err) {
    console.error(err);

    setState(
      'error',
      'Could not reach the place service. Check your connection.'
    );
  }
}

/* ---------- Search button ---------- */

button.addEventListener('click', function () {
  const term = input.value.trim();

  if (term) {
    searchPlaces(term);
  }
});

/* ---------- 400 ms debounce ---------- */

let debounceTimer;

input.addEventListener('input', function () {
  clearTimeout(debounceTimer);

  const term = input.value.trim();

  if (term.length >= 2) {
    debounceTimer = setTimeout(function () {
      searchPlaces(term);
    }, 400);
  }
});