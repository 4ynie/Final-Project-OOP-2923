const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let itineraryWindow;
let viewWindow;

const DATA_FILE = path.join(app.getPath('userData'), 'itineraries.json');
console.log("Itinerary data file located at:", DATA_FILE);


function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
  }
}

function readItineraries() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
}

function writeItineraries(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// homepage window
function createMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Home - World Explorer',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
//create itinerary window
function createItineraryWindow() {
  if (itineraryWindow) {
    itineraryWindow.focus();
    return;
  }

  itineraryWindow = new BrowserWindow({
    width: 700,
    height: 600,
    title: 'Create Itinerary',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  itineraryWindow.loadFile(path.join(__dirname, 'renderer', 'itinerary.html'));

  itineraryWindow.on('closed', () => {
    itineraryWindow = null;
  });
}
// view itinerary window
function createViewWindow() {
  if (viewWindow) {
    viewWindow.focus();
    return;
  }

  viewWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'View Itineraries',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  viewWindow.loadFile(path.join(__dirname, 'renderer', 'viewitinerary.html'));

  viewWindow.on('closed', () => {
    viewWindow = null;
  });
}


app.whenReady().then(() => {
  ensureDataFile();
  createMainWindow();

  // navigation
  ipcMain.on('open-home-window', () => {
    createMainWindow();
  });

  ipcMain.on('open-itinerary-window', () => {
    createItineraryWindow();
  });

  ipcMain.on('open-viewitinerary-window', () => {
    createViewWindow();
  });

  //CRUD HANDLERS

  // save itinerary
  ipcMain.on('save-itinerary', (event, data) => {
    try {
      const itineraries = readItineraries();

      const newItem = {
        id: `it-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        country: data.country,
        arrivalDate: data.arrivalDate,
        departureDate: data.departureDate,
        budget: data.budget,
        plan: data.plan,
        createdAt: new Date().toISOString()
      };

      itineraries.push(newItem);
      writeItineraries(itineraries);

      console.log("Itinerary saved:", newItem);
      event.sender.send('save-result', { success: true });
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      event.sender.send('save-result', { success: false, error: err.message });
    }
  });

  // retrieving all itineraries
  ipcMain.on('get-itineraries', (event) => {
    event.sender.send('itineraries-data', readItineraries());
  });

  // delete itinerary
  ipcMain.on('delete-itinerary', (event, id) => {
    const itineraries = readItineraries().filter(i => i.id !== id);
    writeItineraries(itineraries);
    event.sender.send('itinerary-deleted', id);
  });

  // update itinerary
  ipcMain.on('update-itinerary', (event, updatedItem) => {
    const itineraries = readItineraries();
    const index = itineraries.findIndex(i => i.id === updatedItem.id);
    if (index !== -1) {
      itineraries[index] = { ...itineraries[index], ...updatedItem };
      writeItineraries(itineraries);
      console.log("Itinerary updated:", updatedItem);
      event.sender.send('itinerary-updated', updatedItem);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
