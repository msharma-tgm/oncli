const WebSocket = require('ws');
const robot = require('robotjs');
const { exec } = require('child_process');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => console.log('Receiver connected'));

ws.on('message', (message) => {
  try {
    const data = JSON.parse(message);
    if (data.cmd === 'lock') {
      console.log('Locking screen...');
      if (process.platform === 'win32') exec('rundll32.exe user32.dll,LockWorkStation');
      else if (process.platform === 'darwin') exec('/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend');
      else if (process.platform === 'linux') exec('gnome-screensaver-command -l');
      return;
    }
  } catch(e){}

  if (message.byteLength === 4) {
    const view = new DataView(message);
    const dx = view.getInt16(0);
    const dy = view.getInt16(2);
    const mouse = robot.getMousePos();
    robot.moveMouse(mouse.x + dx, mouse.y + dy);
  } else if (message.byteLength === 2) {
    const view = new DataView(message);
    const keyCode = view.getUint8(0);
    const type = view.getUint8(1);
    const key = String.fromCharCode(keyCode).toLowerCase();
    if (type===1) robot.keyToggle(key,'down');
    else robot.keyToggle(key,'up');
  }
});
