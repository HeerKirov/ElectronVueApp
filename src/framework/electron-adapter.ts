import {ipcRenderer, remote, BrowserWindow} from 'electron';
import {Delegate} from "./util";

const window: BrowserWindow = remote.getCurrentWindow();

export const platformInfo: PlatformInfo = ipcRenderer.sendSync('get-platform-info');

export const eventFullScreen: Delegate<boolean> = new Delegate();

export interface PlatformInfo {
    platform: string,
    debug: boolean,
    appDataPath: string
}

export function pullRoutePage(): string {
    return ipcRenderer.sendSync('pull-target-page')
}

(function registerWindowEvents() {
    window.on('enter-full-screen', () => eventFullScreen.trigger(true));
    window.on('leave-full-screen', () => eventFullScreen.trigger(false));
})();
