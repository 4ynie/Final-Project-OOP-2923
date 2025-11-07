const { ipcRenderer } = require('electron');

const searchBtn = document.getElementById('searchBtn');
const countryInput = document.getElementById('countryInput');
const resultDiv = document.getElementById('result');

let currentCountryName = '';

// handle empty or array values 
function formatValue(val) {
  if (!val) return '—';
  if (Array.isArray(val)) return val.join(', ');
  return val;
}

// render all country details
function renderCountryDetails(country) {
  resultDiv.style.display = "block";  // show result box

  currentCountryName = country.name.common;

  const latlng = country.latlng ? `${country.latlng[0]}, ${country.latlng[1]}` : '—';
  const languages = country.languages ? Object.values(country.languages).join(', ') : '—';
  const timezones = country.timezones ? country.timezones.join(', ') : '—';
  const continents = country.continents ? country.continents.join(', ') : '—';

  resultDiv.innerHTML = `
    <div class="country-grid">
      <div>
        <img class="flag" src="${country.flags?.png || country.flags?.svg || ''}" alt="flag" />
        ${country.coatOfArms?.png ? `<div style="margin-top:10px"><img class="coat" src="${country.coatOfArms.png}" alt="coat of arms"></div>` : ''}
      </div>
      <div>
        <h2>${country.name.common}</h2>
        <div class="info"><span class="label">Official Name:</span> ${formatValue(country.name.official)}</div>
        <div class="info"><span class="label">Capital City:</span> ${formatValue(country.capital)}</div>
        <div class="info"><span class="label">Region:</span> ${formatValue(country.region)}</div>
        <div class="info"><span class="label">Subregion:</span> ${formatValue(country.subregion)}</div>
        <div class="info"><span class="label">Continent:</span> ${continents}</div>
        <div class="info"><span class="label">Area:</span> ${country.area ? country.area.toLocaleString() + ' km²' : '—'}</div>
        <div class="info"><span class="label">Population:</span> ${country.population ? country.population.toLocaleString() : '—'}</div>
        <div class="info"><span class="label">Spoken Language(s):</span> ${languages}</div>
        <div class="info"><span class="label">Time Zone(s):</span> ${timezones}</div>
        <div class="info"><span class="label">Location (Lat, Lng):</span> ${latlng}</div>
      </div>
    </div>
  `;
}

// fetch country details from REST Countries API
async function searchCountry(name) {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`);
    if (!res.ok) throw new Error('Country not found.');

    const data = await res.json();
    if (!data || data.length === 0) {
      resultDiv.innerHTML = '<p>No results found.</p>';
      return;
    }

    renderCountryDetails(data[0]);
  } catch (err) {
    console.error(err);
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// search countries 
searchBtn.addEventListener('click', () => {
  const q = (countryInput.value || '').trim();
  if (!q) {
    alert('Please enter a country name.');
    return;
  }
  searchCountry(q);
});

countryInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

//menubar navigation
document.getElementById('homeBtn').addEventListener('click', () => {
  ipcRenderer.send('open-home-window');
});

document.getElementById('menuCreateBtn').addEventListener('click', () => {
  ipcRenderer.send('open-itinerary-window');
});

document.getElementById('menuViewBtn').addEventListener('click', () => {
  ipcRenderer.send('open-viewitinerary-window');
});
