const { app, BrowserWindow } = require('electron');
const path = require('path');

// 只在开发环境中加载 electron-reload
if (process.env.NODE_ENV === 'development') {
	require('electron-reload')(__dirname);
}

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

	// 根据是否是开发环境加载不同的路径
	if (process.env.NODE_ENV === 'development') {
		win.loadFile(path.join(__dirname, 'index.html'));
		win.webContents.openDevTools();
	} else {
		win.loadFile(path.join(__dirname, 'index.html'));
	}

	win.on('resize', () => {
		const [width, height] = win.getSize();
		if (width < 990) {
			win.setSize(990, height);
		}
	});
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
