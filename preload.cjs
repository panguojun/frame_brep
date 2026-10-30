const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{
  openJSON:()=>ipcRenderer.invoke('open-json'),
  saveFile:(payload)=>ipcRenderer.invoke('save-file',payload),
  openInBlender:(obj)=>ipcRenderer.invoke('open-in-blender',{obj})
});
