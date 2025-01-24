const { app, BrowserWindow } = require('electron');
const path = require('path');
require('electron-reload')(__dirname);

function createWindow() {
	const win = new BrowserWindow({
		width: 1000,
		height: 753,
		minWidth: 990,
		minHeight: 753,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	win.on('resize', () => {
		const [width, height] = win.getSize();
		if (width < 990) {
			win.setSize(990, height);
		}
	});

	win.loadFile(path.join(__dirname, 'index.html'));

	// 在开发环境下打开开发者工具
	if (process.env.NODE_ENV === 'development') {
		win.webContents.openDevTools();
	}
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
