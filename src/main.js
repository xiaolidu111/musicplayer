const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 858,
		minHeight: 588,
		resizable: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.setMinimumSize(858, 588);

	mainWindow.loadURL(
		isDev
			? 'http://localhost:3000'
			: `file://${path.join(__dirname, '../build/index.html')}`
	);

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.on('resize', () => {
		const [width, height] = mainWindow.getSize();
		if (width < 858) {
			mainWindow.setSize(858, height);
		}
		if (height < 588) {
			mainWindow.setSize(width, 588);
		}
	});
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
