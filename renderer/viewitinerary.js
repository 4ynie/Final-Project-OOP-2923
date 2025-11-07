const { ipcRenderer } = require('electron');

const listContainer = document.getElementById('itinerary-list');

// request itineraries from main.js
ipcRenderer.send('get-itineraries');

// receive and render itineraries 
ipcRenderer.on('itineraries-data', (event, itineraries) => {
  renderItineraries(itineraries);
});

// render itinerary
function renderItineraries(itineraries) {
  listContainer.innerHTML = '';

  if (!itineraries || itineraries.length === 0) {
    listContainer.innerHTML = `<p class="empty">No itineraries saved yet.</p>`;
    return;
  }

  itineraries.forEach(item => {
    const div = document.createElement('div');
    div.className = 'itinerary-card';
    div.dataset.id = item.id;

    div.innerHTML = `
      <h3>${item.country}</h3>
      <p><strong>Arrival:</strong> ${item.arrivalDate || '—'}</p>
      <p><strong>Departure:</strong> ${item.departureDate || '—'}</p>
      <p><strong>Budget Estimation (RM):</strong> ${item.budget || '—'}</p>
      <p><strong>Plan:</strong> ${item.plan}</p>
      <button class="update-btn" data-id="${item.id}">Update</button>
      <button class="delete-btn" data-id="${item.id}">Delete</button>
    `;

    listContainer.appendChild(div);
  });

  attachEventHandlers();
}

// connect both update and delete handlers
function attachEventHandlers() {
  
  // delete handler
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this itinerary?')) {
        ipcRenderer.send('delete-itinerary', id);
      }
    });
  });

  // update
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      const card = e.target.closest('.itinerary-card');
      const country = card.querySelector('h3').textContent.trim();
      const oldDeparture = card.querySelector('p:nth-of-type(2)').textContent.split(': ')[1];
      const oldArrival = card.querySelector('p:nth-of-type(1)').textContent.split(': ')[1];
      const oldBudget = card.querySelector('p:nth-of-type(3)').textContent.split(': ')[1];
      const oldPlan = card.querySelector('p:nth-of-type(4)').textContent.split(': ')[1];

      // update form
      card.innerHTML = `
        <div class="form-container">
          <h3>Update Itinerary for ${country}</h3>

          <label>Arrival Date:</label><br>
          <input type="date" id="updateArrival" value="${oldArrival !== '—' ? oldArrival : ''}"><br><br>

          <label>Departure Date:</label><br>
          <input type="date" id="updateDeparture" value="${oldDeparture !== '—' ? oldDeparture : ''}"><br><br>

          <label>Budget (RM):</label><br>
          <input type="text" id="updateBudget" value="${oldBudget !== '—' ? oldBudget : ''}"><br><br>

          <label>Your Plan:</label><br>
          <textarea id="updatePlan" rows="5">${oldPlan !== '—' ? oldPlan : ''}</textarea><br><br>

          <button class="save-update-btn" data-id="${id}">Save</button>
          <button class="cancel-update-btn">Cancel</button>
        </div>
      `;

      // save updated itinerary
      card.querySelector('.save-update-btn').addEventListener('click', () => {
        const newArrival = card.querySelector('#updateArrival').value;
        const newDeparture = card.querySelector('#updateDeparture').value;
        const newBudget = card.querySelector('#updateBudget').value.trim();
        const newPlan = card.querySelector('#updatePlan').value.trim();

        if (!newArrival || !newDeparture || !newPlan) {
          alert('Please fill in all required fields.');
          return;
        }

        ipcRenderer.send('update-itinerary', {
          id,
          arrivalDate: newArrival,
          departureDate: newDeparture,
          budget: newBudget,
          plan: newPlan
        });
      });

      // to cancel update
      card.querySelector('.cancel-update-btn').addEventListener('click', () => {
        ipcRenderer.send('get-itineraries');
      });
    });
  });
}

// new refresh list after update and delete
ipcRenderer.on('itinerary-updated', () => ipcRenderer.send('get-itineraries'));
ipcRenderer.on('itinerary-deleted', () => ipcRenderer.send('get-itineraries'));

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
