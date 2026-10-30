const {app,BrowserWindow,ipcMain,dialog,Menu}=require('electron');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {spawn}=require('node:child_process');
const BLENDER_DEFAULT='C:\\Program Files (x86)\\Steam\\steamapps\\common\\Blender\\blender.exe';
const BLENDER_SCRIPT=`import bpy, sys
def _main():
    args = sys.argv
    try:
        idx = args.index('--')
        obj_path = args[idx + 1]
    except (ValueError, IndexError):
        print('NO_OBJ_PATH'); return
    bpy.ops.wm.obj_import(filepath=obj_path)
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for region in area.regions:
                if region.type == 'WINDOW':
                    ctx = bpy.context.copy(); ctx['area'] = area; ctx['region'] = region
                    try: bpy.ops.view3d.view_all(ctx)
                    except Exception: pass
                    break
            break
_main()
`;
let win;
app.whenReady().then(()=>{
  Menu.setApplicationMenu(null);
  win=new BrowserWindow({width:1600,height:980,minWidth:1050,minHeight:700,show:!process.argv.includes('--smoke'),title:'解析曲面标架工作台',backgroundColor:'#101a27',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file:'))event.preventDefault();});
  const rendererErrors=[];
  win.webContents.on('console-message',(_event,level,message)=>{if(level>=2)rendererErrors.push(message);});
  win.loadFile(path.join(__dirname,'index.html'));
  if(process.argv.includes('--smoke')){
    win.webContents.once('did-finish-load',()=>setTimeout(async()=>{
      try{
        const result=await win.webContents.executeJavaScript(`(() => { document.querySelector('#generate').click(); document.querySelector('#project').click(); const trim=document.querySelector('#trim'); trim.click(); return {title:document.title,canvas:!!document.querySelector('#viewport canvas'),models:document.querySelectorAll('.model').length,trim:trim.checked,stats:document.querySelector('#viewStats').textContent,audit:document.querySelector('#geometryInfo').textContent}; })()`);
        result.errors=rendererErrors;
        if(result.models!==19||!result.canvas||!result.trim||rendererErrors.length)process.exitCode=1;
        await fs.writeFile(path.join(__dirname,'smoke-result.json'),JSON.stringify(result,null,2));
        console.log(JSON.stringify(result));
      }catch(error){await fs.writeFile(path.join(__dirname,'smoke-result.json'),JSON.stringify({error:String(error)},null,2));console.error(error);process.exitCode=1;}
      app.quit();
    },1800));
  }
});
ipcMain.handle('open-json',async()=>{
  const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'JSON 曲线或工程',extensions:['json']} ]});
  if(result.canceled)return null;
  return {name:path.basename(result.filePaths[0]),text:await fs.readFile(result.filePaths[0],'utf8')};
});
ipcMain.handle('save-file',async(_event,{name,content,extension})=>{
  const result=await dialog.showSaveDialog(win,{defaultPath:name,filters:[{name:extension.toUpperCase(),extensions:[extension]}]});
  if(result.canceled)return false;
  await fs.writeFile(result.filePath,content,'utf8');
  return result.filePath;
});
ipcMain.handle('open-in-blender',async(_event,{obj})=>{
  const exe=process.env.BLENDER_EXE||BLENDER_DEFAULT;
  const exists=await fs.access(exe).then(()=>true).catch(()=>false);
  if(!exists)return {ok:false,error:`未找到 Blender：${exe}`};
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'ass-view-'));
  const objPath=path.join(tmp,'surface.obj'),scriptPath=path.join(tmp,'import_view.py');
  await fs.writeFile(objPath,obj,'utf8');
  await fs.writeFile(scriptPath,BLENDER_SCRIPT,'utf8');
  const child=spawn(exe,['--python',scriptPath,'--',objPath],{detached:true,stdio:'ignore'});
  child.unref();
  return {ok:true};
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
