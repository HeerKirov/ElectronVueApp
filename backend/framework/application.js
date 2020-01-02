const fs = require('fs');
const {app, ipcMain, BrowserWindow, Menu, shell} = require('electron');

const {bundleName, homepage} = require('./util').getBuildInfo();

class Application {
    #appDataPath;
    #platform;
    #debug;
    #windowInfo;

    #window;

    #quitFlag = false;      //在macOS上用于阻断关闭窗口退出行为。仅在用户主动退出时，此标记记为true，窗口被真正关闭。
    #targetPage = null;     //用于记录激活窗口后指定要进入的页符号。

    constructor(props) {
        this.#debug = props['debug'];
        this.#platform = props['platform'];
        this.#appDataPath = this.#debug ? props['debugAppDataPath'] || './debug_data' : app.getPath('userData');
        this.#windowInfo = props['window'] || {};
    }

    registerAppEvents() {
        app.on('window-all-closed', () => {
            if(this.#platform !== 'darwin') {
                app.quit()
            }
        });
        app.on('ready', () => this.initializeApp());
        app.on('activate', () => this.activeMainWindow());
        app.on('before-quit', () => this.#quitFlag = true)
    }

    registerRendererEvents() {
        ipcMain.on('get-platform-info', (e) => {
            //获得平台与设备等的基本信息。
            e.returnValue = {
                platform: this.#platform,
                debug: this.#debug,
                appDataPath: this.#appDataPath
            }
        });
        ipcMain.on('pull-target-page', (e) => {
            //获取主进程是否指定了一个初始页面。获取完成后清除这个初始页面的标记。
            if(this.#targetPage) {
                e.returnValue = this.#targetPage;
                this.#targetPage = null
            }else{
                e.returnValue = null
            }
        });
    }

    initializeApp() {
        if(this.#platform === 'darwin') {
            Menu.setApplicationMenu(Menu.buildFromTemplate([
                {
                    label: bundleName,
                    submenu: [
                        {role: 'about', label: `关于${bundleName}`},
                        {type: 'separator'},
                        {
                            label: '偏好设置',
                            accelerator: 'Command+,',
                            click() {this.activeMainWindow('setting')}
                        },
                        {type: 'separator'},
                        {role: 'hide', label: `隐藏${bundleName}`},
                        {role: 'hideOthers', label: '隐藏其他'},
                        {role: 'unhide', label: '取消隐藏'},
                        {type: 'separator'},
                        {role: 'quit', label: `退出${bundleName}`},
                    ]
                },
                {
                    label: '编辑',
                    role: 'editMenu',
                    submenu: [
                        {role: 'undo', label: '撤销'},
                        {role: 'redo', label: '重做'},
                        {type: 'separator'},
                        {role: 'cut', label: '剪切'},
                        {role: 'copy', label: '复制'},
                        {role: 'paste', label: '粘贴'},
                        {type: 'separator'},
                        {role: 'delete', label: '删除'},
                        {role: 'selectall', label: '全选'}
                    ]
                },
                {
                    label: '显示',
                    submenu: (() => {
                        let ret = [
                            {role: 'reload', label: '重新加载'},
                            {type: 'separator'},
                            {role: 'togglefullscreen', label: '全屏'},
                            {type: 'separator'},
                        ];
                        if(this.#debug) {
                            ret.push({role: 'toggledevtools', label: '开发者工具'});
                        }
                        return ret;
                    })()
                },
                {
                    label: '窗口',
                    role: 'windowMenu',
                    submenu: [
                        {role: 'minimize', label: '最小化'},
                        {role: 'close', label: '关闭窗口'}
                    ]
                },
                {
                    label: '帮助',
                    role: 'help',
                    submenu: [
                        {
                            label: '帮助向导',
                            click() {this.activeMainWindow('help')}
                        },
                        {type: 'separator'},
                        {
                            label: '关于本项目',
                            click() {
                                if(homepage) {
                                    shell.openExternal(homepage).finally(() => {})
                                }
                            }
                        }
                    ]
                }
            ]))
        }
        if(!fs.existsSync(this.#appDataPath)) {
            try {
                fs.mkdirSync(this.#appDataPath)
            }catch (e) { }  //resume
        }
        this.activeMainWindow()
    }

    activeMainWindow(targetPage) {
        if(this.#window == null) {
            if(targetPage) {
                this.#targetPage = targetPage;
            }
            this.#window = new BrowserWindow({
                minWidth: this.#windowInfo['minWidth'] || 640, minHeight: this.#windowInfo['minHeight'] || 480,
                titleBarStyle: "hidden",
                title: this.#windowInfo['title'] || 'ElectronVueApp',
                webPreferences: {
                    nodeIntegration: true
                }
            });

            if(this.#platform !== 'darwin') {
                this.#window.setMenuBarVisibility(false)
            }

            this.#window.on('close', (e) => {
                if(!this.#quitFlag && this.#platform === 'darwin') {
                    e.preventDefault();
                    this.#window.hide()
                }
            });
            this.#window.on('closed', () => {
                this.#window = null
            });

            this.#window.loadFile('public/index.html').finally(() => {});
        }else{
            if(!this.#window.isVisible()) {
                this.#window.show()
            }
            if(targetPage) {
                this.#window.webContents.send('route', targetPage)
            }
        }
    }
}

let application;

module.exports = function (props) {
    if(application == null) {
        application = new Application(props);
        application.registerRendererEvents();
        application.registerAppEvents();
    }
    return application;
};
