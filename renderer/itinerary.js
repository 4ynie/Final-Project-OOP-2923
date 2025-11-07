const { ipcRenderer } = require('electron');

//to input elements
const countryInput = document.getElementById('countryInput');
const arrivalDateInput = document.getElementById('arrivalDate');
const departureDateInput = document.getElementById('departureDate');
const budgetInput = document.getElementById('budgetInput');
const planInput = document.getElementById('planInput');
const saveBtn = document.getElementById('saveBtn');

// to save itinerary
saveBtn.addEventListener('click', () => {
  const country = (countryInput.value || '').trim();
  const arrivalDate = arrivalDateInput.value;
  const departureDate = departureDateInput.value;
  const budget = (budgetInput.value || '').trim();
  const plan = (planInput.value || '').trim();

  // to validate country after searching
  if (!country) {
    alert('Please enter a country name.');
    return;
  }
  if (!arrivalDate || !departureDate) {
    alert('Please select both arrival and departure dates.');
    return;
  }
  if (!plan) {
    alert('Please write your itinerary plan.');
    return;
  }

  // send data to main.js
  ipcRenderer.send('save-itinerary', {
    country: country,
    arrivalDate: arrivalDate,
    departureDate: departureDate,
    budget: budget,
    plan: plan
  });

  // for confirmation on saved itinerary
  ipcRenderer.once('save-result', (event, res) => {
    if (res && res.success) {
      alert('Itinerary saved successfully!');
      countryInput.value = '';
      arrivalDateInput.value = '';
      departureDateInput.value = '';
      budgetInput.value = '';
      planInput.value = '';
    } else {
      alert('Failed to save itinerary.');
    }
  });
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
