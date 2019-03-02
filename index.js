const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu } = require('electron')
const path = require("path");

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow() {
    // 创建浏览器窗口。
    win = new BrowserWindow({
        width: 324,
        height: 270,
        frame: false,
        resizable: false,
        show: false,
        hasShadow: true,
        webPreferences: { nodeIntegration: true },
        title: "FlowerPasswordElectron",
        icon: "./res/icons/icon.png",
        backgroundColor: "#fefefe"
    });// 为跨平台优化

    // 然后加载应用的 index.html。
    win.loadFile('index.html')

    //在加载页面时，渲染进程第一次完成绘制时，会发出 ready-to-show 事件。在此事件后显示窗口将没有视觉闪烁
    win.once('ready-to-show', () => {
        win.show()
        //win.webContents.openDevTools()
    });

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', () => {
    createWindow();

    globalShortcut.register('CommandOrControl+Shift+Alt+F', () => {
        win.isVisible() ? win.hide() : win.show();
    })

    if (process.platform == "win32") tray = new Tray(path.join(__dirname, '\\res\\icons\\iconWin.ico'));
    else if (process.platform != "darwin") tray = new Tray(path.join(__dirname, '\\res\\icons\\wnrIcon.png'));
    contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show / Hide', click: () => {
                win.isVisible() ? win.hide() : win.show();
            }
        }, {
            label: 'Exit', click: () => { app.quit() }
        }
    ]);
    if (tray != null) {
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            win.isVisible() ? win.hide() : win.show();
        });//托盘菜单
    }

    if (process.platform === 'darwin') {
        var template = [{
            label: 'FlowerPasswordElectron',
            submenu: [{
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click: function () {
                    app.quit();
                }
            }]
        }, {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        }];
        var osxMenu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(osxMenu)
    }// 应付macOS的顶栏空缺
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('winhider', function () {
    win.hide()
})