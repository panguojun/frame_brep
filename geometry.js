import {ShapeUtils,Vector2} from './vendor/three.core.js';
const P=(key,label,initial,min,max,step=.01)=>({key,label,initial,min,max,step});
export const CATALOG=[
  {id:'plane',group:'基础',name:'平面',p:[P('width','宽度',8,1,20),P('depth','深度',8,1,20)],fn:(u,v,p)=>[p.width*u,p.depth*v,0]},
  {id:'paraboloid',group:'二次曲面',name:'椭圆抛物面',p:[P('a','X 曲率',.18,-1,1),P('b','Y 曲率',.12,-1,1),P('span','范围',4,1,10)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v;return[x,y,p.a*x*x+p.b*y*y]}},
  {id:'saddle',group:'二次曲面',name:'双曲抛物面',p:[P('a','X 曲率',.18,-1,1),P('b','Y 曲率',.16,-1,1),P('span','范围',4,1,10)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v;return[x,y,p.a*x*x-p.b*y*y]}},
  {id:'ellipsoid',group:'闭合曲面',name:'椭球面',p:[P('a','X 半轴',4,.3,10),P('b','Y 半轴',3,.3,10),P('c','Z 半轴',2,.3,10)],fn:(u,v,p)=>{let t=Math.PI*u, f=Math.PI*v/2;return[p.a*Math.cos(f)*Math.cos(t),p.b*Math.cos(f)*Math.sin(t),p.c*Math.sin(f)]}},
  {id:'torus',group:'闭合曲面',name:'环面',p:[P('major','主半径',3,1,9),P('minor','管半径',1,.1,3)],fn:(u,v,p)=>{let a=Math.PI*u,b=Math.PI*v,r=p.major+p.minor*Math.cos(b);return[r*Math.cos(a),r*Math.sin(a),p.minor*Math.sin(b)]}},
  {id:'cylinder',group:'旋转曲面',name:'圆柱面',p:[P('radius','半径',2,.2,8),P('height','高度',6,.5,16)],fn:(u,v,p)=>[p.radius*Math.cos(Math.PI*u),p.radius*Math.sin(Math.PI*u),p.height*v]},
  {id:'cone',group:'旋转曲面',name:'圆锥台',p:[P('bottom','底半径',3,.2,8),P('top','顶半径',.8,.05,8),P('height','高度',6,.5,16)],fn:(u,v,p)=>{let r=p.bottom+(p.top-p.bottom)*(v+1)/2;return[r*Math.cos(Math.PI*u),r*Math.sin(Math.PI*u),p.height*v/2]}},
  {id:'sphere',group:'闭合曲面',name:'球面',p:[P('radius','半径',3,.2,10)],fn:(u,v,p)=>{let a=Math.PI*u,b=Math.PI*v/2;return[p.radius*Math.cos(b)*Math.cos(a),p.radius*Math.cos(b)*Math.sin(a),p.radius*Math.sin(b)]}},
  {id:'hyperboloid1',group:'二次曲面',name:'单叶双曲面',p:[P('a','水平半径',2,.2,8),P('c','腰高',2,.2,8),P('extent','延伸',1.2,.2,2)],fn:(u,v,p)=>{let t=p.extent*v,r=p.a*Math.cosh(t),a=Math.PI*u;return[r*Math.cos(a),r*Math.sin(a),p.c*Math.sinh(t)]}},
  {id:'hyperboloid2',group:'二次曲面',name:'双叶双曲面',p:[P('a','水平半径',2,.2,8),P('c','轴向尺度',2,.2,8),P('extent','延伸',1,.1,2)],fn:(u,v,p)=>{let t=.15+p.extent*(v+1)/2,r=p.a*Math.sinh(t),a=Math.PI*u;return[r*Math.cos(a),r*Math.sin(a),p.c*Math.cosh(t)]}},
  {id:'helicoid',group:'极小曲面',name:'螺旋面',p:[P('radius','半径',4,.5,10),P('pitch','螺距',1.3,.1,4),P('turns','转数',1,.25,3,.05)],fn:(u,v,p)=>{let a=Math.PI*p.turns*u,r=p.radius*v;return[r*Math.cos(a),r*Math.sin(a),p.pitch*a]}},
  {id:'catenoid',group:'极小曲面',name:'悬链面',p:[P('neck','颈半径',1,.2,5),P('height','高度',4,.5,10)],fn:(u,v,p)=>{let z=p.height*v/2,r=p.neck*Math.cosh(z/p.neck),a=Math.PI*u;return[r*Math.cos(a),r*Math.sin(a),z]}},
  {id:'sine',group:'函数图形',name:'正弦波面',p:[P('span','范围',4,1,10),P('amp','振幅',1,0,4),P('freq','频率',1,.1,4)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v;return[x,y,p.amp*Math.sin(p.freq*x)*Math.cos(p.freq*y)]}},
  {id:'gaussian',group:'函数图形',name:'高斯钟面',p:[P('span','范围',4,1,10),P('amp','高度',3,-5,5),P('sigma','宽度',1.8,.2,6)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v;return[x,y,p.amp*Math.exp(-(x*x+y*y)/(2*p.sigma*p.sigma))]}},
  {id:'monkey',group:'函数图形',name:'猴鞍面',p:[P('span','范围',2,.5,5),P('scale','高度尺度',.12,-1,1)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v;return[x,y,p.scale*(x*x*x-3*x*y*y)]}},
  {id:'ripple',group:'函数图形',name:'径向波纹',p:[P('span','范围',4,1,10),P('amp','振幅',1,0,4),P('freq','频率',3,.5,8)],fn:(u,v,p)=>{let x=p.span*u,y=p.span*v,r=Math.hypot(x,y);return[x,y,p.amp*Math.sin(p.freq*r)/(1+.3*r)]}},
  {id:'mobius',group:'参数曲面',name:'莫比乌斯带',p:[P('radius','半径',3,1,8),P('width','带宽',1,.1,3)],fn:(u,v,p)=>{let a=Math.PI*u,w=p.width*v;return[(p.radius+w*Math.cos(a/2))*Math.cos(a),(p.radius+w*Math.cos(a/2))*Math.sin(a),w*Math.sin(a/2)]}},
  {id:'enneper',group:'极小曲面',name:'Enneper 曲面',p:[P('span','参数范围',1.4,.2,2.3),P('scale','尺度',1,.2,4)],fn:(u,v,p)=>{let a=p.span*u,b=p.span*v,s=p.scale;return[s*(a-a*a*a/3+a*b*b),s*(b-b*b*b/3+b*a*a),s*(a*a-b*b)]}},
  {id:'ruled',group:'参数曲面',name:'直纹扭转面',p:[P('span','范围',4,1,10),P('twist','扭转',1,-3,3),P('height','高度',3,.1,8)],fn:(u,v,p)=>{let a=p.twist*u;return[p.span*u,p.span*v*Math.cos(a),p.height*v*Math.sin(a)]}}
];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>mul(a,1/(Math.hypot(...a)||1));
export function frameAt(model,p,u,v){
  const h=1e-4, o=model.fn(u,v,p),du=mul(sub(model.fn(clamp(u+h,-1,1),v,p),model.fn(clamp(u-h,-1,1),v,p)),1/(clamp(u+h,-1,1)-clamp(u-h,-1,1))),dv=mul(sub(model.fn(u,clamp(v+h,-1,1),p),model.fn(u,clamp(v-h,-1,1),p)),1/(clamp(v+h,-1,1)-clamp(v-h,-1,1)));
  const e1=norm(du),n=norm(cross(du,dv)),e2=norm(cross(n,e1));
  return {o,e1,e2,n,s:[Math.hypot(...du),Math.abs(dot(dv,e2)),1],metric:[dot(du,du),dot(du,dv),dot(dv,dv)]};
}
export function sampleCurve(frames,closed=false,n=32){
  if(frames.length<2)return [];
  const out=[],count=closed?frames.length:frames.length-1;
  for(let i=0;i<count;i++){
    const a=frames[i],b=frames[(i+1)%frames.length],prev=frames[(i-1+frames.length)%frames.length],next=frames[(i+2)%frames.length];
    const la=Math.hypot(b.u-a.u,b.v-a.v),lb=Math.hypot(b.u-a.u,b.v-a.v);
    const ma=[Math.cos(a.angle)*a.t*la,Math.sin(a.angle)*a.t*la],mb=[Math.cos(b.angle)*b.t*lb,Math.sin(b.angle)*b.t*lb];
    for(let j=0;j<n;j++){let t=j/n,t2=t*t,t3=t2*t;out.push({u:(2*t3-3*t2+1)*a.u+(t3-2*t2+t)*ma[0]+(-2*t3+3*t2)*b.u+(t3-t2)*mb[0],v:(2*t3-3*t2+1)*a.v+(t3-2*t2+t)*ma[1]+(-2*t3+3*t2)*b.v+(t3-t2)*mb[1]});}
  }
  out.push(closed?{u:frames[0].u,v:frames[0].v}:{u:frames.at(-1).u,v:frames.at(-1).v});
  return out;
}
export function surfacePoint(model,p,u,v,frames=[],strength=1,width=.32){
  u=clamp(u,-1,1);v=clamp(v,-1,1);
  const base=model.fn(u,v,p),n=frameAt(model,p,u,v).n;
  let displacement=0;
  for(const f of frames){
    const du=f.u-(f.anchorU??f.u),dv=f.v-(f.anchorV??f.v),da=f.angle-(f.anchorAngle??f.angle);
    const amp=(f.lift||0)+.8*(du+dv)+.18*Math.sin(da);
    const r2=(u-f.u)**2+(v-f.v)**2;
    displacement+=amp*Math.exp(-r2/(2*width*width));
  }
  return add(base,mul(n,strength*displacement));
}
export function deformedFrameAt(model,p,u,v,frames=[],strength=1,width=.32){
  const h=1e-4,point=surfacePoint(model,p,u,v,frames,strength,width),u0=clamp(u-h,-1,1),u1=clamp(u+h,-1,1),v0=clamp(v-h,-1,1),v1=clamp(v+h,-1,1);
  const du=mul(sub(surfacePoint(model,p,u1,v,frames,strength,width),surfacePoint(model,p,u0,v,frames,strength,width)),1/(u1-u0||1));
  const dv=mul(sub(surfacePoint(model,p,u,v1,frames,strength,width),surfacePoint(model,p,u,v0,frames,strength,width)),1/(v1-v0||1));
  const e1=norm(du),n=norm(cross(du,dv)),e2=norm(cross(n,e1));
  return {o:point,e1,e2,n,s:[Math.hypot(...du),Math.abs(dot(dv,e2)),1]};
}
export function pointInPolygon(u,v,poly){
  let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const a=poly[i],b=poly[j];if((a.v>v)!==(b.v>v)&&u<(b.u-a.u)*(v-a.v)/(b.v-a.v)+a.u)inside=!inside;
  }return inside;
}
const orient2=(a,b,c)=>(b.u-a.u)*(c.v-a.v)-(b.v-a.v)*(c.u-a.u);
const edgeKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`;
function segmentCrosses(a,b,c,d){
  const ab1=orient2(a,b,c),ab2=orient2(a,b,d),cd1=orient2(c,d,a),cd2=orient2(c,d,b);
  const on=(p,x,y)=>p.u>=Math.min(x.u,y.u)-1e-12&&p.u<=Math.max(x.u,y.u)+1e-12&&p.v>=Math.min(x.v,y.v)-1e-12&&p.v<=Math.max(x.v,y.v)+1e-12;
  if(Math.abs(ab1)<1e-12&&on(c,a,b)||Math.abs(ab2)<1e-12&&on(d,a,b)||Math.abs(cd1)<1e-12&&on(a,c,d)||Math.abs(cd2)<1e-12&&on(b,c,d))return true;
  return ((ab1>1e-12&&ab2< -1e-12)||(ab1< -1e-12&&ab2>1e-12))&&((cd1>1e-12&&cd2< -1e-12)||(cd1< -1e-12&&cd2>1e-12));
}
export function validateTrimLoop(input){
  if(!Array.isArray(input))throw Error('闭合裁剪需要一条有效的参数曲线');
  const raw=input.map(p=>({u:p.u,v:p.v}));
  for(const p of raw)if(!Number.isFinite(p.u)||!Number.isFinite(p.v)||Math.abs(p.u)>1+1e-9||Math.abs(p.v)>1+1e-9)throw Error('裁剪边界必须位于曲面的 UV 参数域内');
  let loop=[];for(const p of raw)if(!loop.length||Math.hypot(p.u-loop.at(-1).u,p.v-loop.at(-1).v)>1e-8)loop.push(p);
  if(loop.length>2&&Math.hypot(loop[0].u-loop.at(-1).u,loop[0].v-loop.at(-1).v)<1e-8)loop.pop();
  for(let changed=true;changed&&loop.length>3;){changed=false;for(let i=0;i<loop.length;i++){
    const a=loop[(i-1+loop.length)%loop.length],b=loop[i],c=loop[(i+1)%loop.length];
    if(Math.abs(orient2(a,b,c))<1e-10&&(b.u-a.u)*(b.u-c.u)+(b.v-a.v)*(b.v-c.v)<=0){loop.splice(i,1);changed=true;break;}
  }}
  if(loop.length<3)throw Error('闭合裁剪至少需要三个不同的点');
  for(let i=0;i<loop.length;i++){
    const a=loop[i],b=loop[(i+1)%loop.length];
    if(Math.hypot(a.u-b.u,a.v-b.v)<1e-9)throw Error('裁剪边界包含重复点或零长度边');
  }
  let area=0;for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length];area+=a.u*b.v-a.v*b.u;}area/=2;
  if(Math.abs(area)<1e-8)throw Error('裁剪边界面积过小');
  for(let i=0;i<loop.length;i++)for(let j=i+2;j<loop.length;j++){
    if(i===0&&j===loop.length-1)continue;
    if(segmentCrosses(loop[i],loop[(i+1)%loop.length],loop[j],loop[(j+1)%loop.length]))throw Error('裁剪边界自相交');
  }
  if(area<0)loop.reverse();
  return {loop,area:Math.abs(area)};
}
function auditTrimMesh(uv,indices,expectedArea){
  const edges=new Map(),used=new Set();let area=0;
  for(let k=0;k<indices.length;k+=3){const ids=indices.slice(k,k+3),a=uv[ids[0]],b=uv[ids[1]],c=uv[ids[2]],signed=orient2(a,b,c)/2;
    if(!(signed>1e-12))throw Error('裁剪网格包含退化或反向三角形');area+=signed;
    for(const id of ids)used.add(id);
    for(let m=0;m<3;m++){const x=ids[m],y=ids[(m+1)%3],key=edgeKey(x,y),record=edges.get(key)||{a:Math.min(x,y),b:Math.max(x,y),count:0};record.count++;if(record.count>2)throw Error('裁剪网格存在非流形边');edges.set(key,record);}
  }
  if(Math.abs(area-expectedArea)>Math.max(1e-7,expectedArea*1e-6))throw Error('裁剪网格与边界面积不一致');
  const boundary=[...edges.values()].filter(e=>e.count===1),adj=new Map();for(const e of boundary){if(!adj.has(e.a))adj.set(e.a,[]);if(!adj.has(e.b))adj.set(e.b,[]);adj.get(e.a).push(e.b);adj.get(e.b).push(e.a);}
  if(!boundary.length||[...adj.values()].some(a=>a.length!==2))throw Error('裁剪边界不是闭合环');
  const start=boundary[0].a,cycle=[start],visited=new Set();let prev=-1,current=start;
  for(let guard=0;guard<=boundary.length;guard++){const next=adj.get(current).find(x=>x!==prev);const key=edgeKey(current,next);if(visited.has(key))break;visited.add(key);if(next===start)break;cycle.push(next);prev=current;current=next;}
  if(visited.size!==boundary.length||cycle.length!==boundary.length)throw Error('裁剪结果存在额外边界分量');
  const euler=used.size-edges.size+indices.length/3;if(euler!==1)throw Error(`裁剪结果 Euler 特征数异常：${euler}`);
  return {vertices:used.size,edges:edges.size,faces:indices.length/3,boundaryEdges:boundary.length,boundaryComponents:1,euler,uvArea:area,boundaryIndices:cycle};
}
function inCircle(a,b,c,d){
  const ax=a.u-d.u,ay=a.v-d.v,bx=b.u-d.u,by=b.v-d.v,cx=c.u-d.u,cy=c.v-d.v;
  return (ax*ax+ay*ay)*(bx*cy-by*cx)-(bx*bx+by*by)*(ax*cy-ay*cx)+(cx*cx+cy*cy)*(ax*by-ay*bx);
}
export function improveConstrainedDelaunay(uv,flatIndices){
  const tris=[];for(let i=0;i<flatIndices.length;i+=3)tris.push(flatIndices.slice(i,i+3));
  const edges=new Map(),queue=[],queued=new Set();
  const add=(key,id)=>{let set=edges.get(key);if(!set){set=new Set();edges.set(key,set);}set.add(id);};
  const remove=(key,id)=>{const set=edges.get(key);set.delete(id);if(!set.size)edges.delete(key);};
  const keys=t=>[edgeKey(t[0],t[1]),edgeKey(t[1],t[2]),edgeKey(t[2],t[0])];
  const enqueue=key=>{if(!queued.has(key)){queued.add(key);queue.push(key);}};
  tris.forEach((t,i)=>keys(t).forEach(key=>add(key,i)));
  for(const key of edges.keys())enqueue(key);
  let flips=0,head=0,limit=Math.max(100,tris.length*10);
  while(head<queue.length&&flips<limit){
    const key=queue[head++];queued.delete(key);const shared=edges.get(key);if(!shared||shared.size!==2)continue;
    const [i,j]=shared,[a,b]=key.split(':').map(Number),c=tris[i].find(x=>x!==a&&x!==b),d=tris[j].find(x=>x!==a&&x!==b);
    if(c===undefined||d===undefined||c===d)continue;
    let u=a,v=b;if(orient2(uv[u],uv[v],uv[c])<0)[u,v]=[v,u];
    if(orient2(uv[c],uv[d],uv[v])<=1e-12||orient2(uv[d],uv[c],uv[u])<=1e-12)continue;
    const magnitude=Math.max(1,Math.abs(uv[u].u)+Math.abs(uv[u].v)+Math.abs(uv[v].u)+Math.abs(uv[v].v));
    if(inCircle(uv[u],uv[v],uv[c],uv[d])<=1e-13*magnitude)continue;
    const oldKeys=[...keys(tris[i]),...keys(tris[j])];for(const old of keys(tris[i]))remove(old,i);for(const old of keys(tris[j]))remove(old,j);
    tris[i]=[c,d,v];tris[j]=[d,c,u];for(const now of keys(tris[i]))add(now,i);for(const now of keys(tris[j]))add(now,j);
    for(const affected of new Set([...oldKeys,...keys(tris[i]),...keys(tris[j])]))enqueue(affected);
    flips++;
  }
  flatIndices.length=0;for(const tri of tris)flatIndices.push(tri[0],tri[1],tri[2]);
  return flips;
}
function buildTrimmedSurface(model,p,frames,options,rawLoop){
  const {loop,area}=validateTrimLoop(rawLoop),uv=loop.map(q=>({...q}));
  const contour=loop.map(q=>new Vector2(q.u,q.v)),triangles=ShapeUtils.triangulateShape(contour,[]);let indices=[];
  for(const tri of triangles){const [a,b,c]=tri,sgn=orient2(uv[a],uv[b],uv[c]);if(Math.abs(sgn)>1e-12)indices.push(...(sgn>0?[a,b,c]:[a,c,b]));}
  if(indices.length===0)throw Error('无法对裁剪边界三角化');
  let delaunayFlips=0;
  const target=2/(options.resolution||80),maxPasses=7;
  for(let pass=0;pass<maxPasses;pass++){
    const split=new Set();for(let k=0;k<indices.length;k+=3){const a=indices[k],b=indices[k+1],c=indices[k+2];for(const [x,y] of [[a,b],[b,c],[c,a]])if(Math.hypot(uv[x].u-uv[y].u,uv[x].v-uv[y].v)>target*3.5)split.add(edgeKey(x,y));}
    if(!split.size)break;
    const mids=new Map(),next=[];const midpoint=(a,b)=>{const key=edgeKey(a,b);if(!mids.has(key)){mids.set(key,uv.length);uv.push({u:(uv[a].u+uv[b].u)/2,v:(uv[a].v+uv[b].v)/2});}return mids.get(key);};
    for(let k=0;k<indices.length;k+=3){const a=indices[k],b=indices[k+1],c=indices[k+2],ring=[a];if(split.has(edgeKey(a,b)))ring.push(midpoint(a,b));ring.push(b);if(split.has(edgeKey(b,c)))ring.push(midpoint(b,c));ring.push(c);if(split.has(edgeKey(c,a)))ring.push(midpoint(c,a));if(ring.length===3){next.push(a,b,c);continue;}
      const center=uv.length;uv.push({u:(uv[a].u+uv[b].u+uv[c].u)/3,v:(uv[a].v+uv[b].v+uv[c].v)/3});for(let i=0;i<ring.length;i++)next.push(center,ring[i],ring[(i+1)%ring.length]);
    }
    indices=next;
    if(indices.length>900000)throw Error('裁剪网格过密，请减少边界采样点');
  }
  delaunayFlips+=improveConstrainedDelaunay(uv,indices);
  const audit=auditTrimMesh(uv,indices,area),positions=[],uvs=[];
  for(const q of uv){positions.push(...surfacePoint(model,p,q.u,q.v,frames,options.strength??1,options.width??.32));uvs.push(q.u,q.v);}
  for(let k=0;k<indices.length;k+=3){const a=indices[k],b=indices[k+1],c=indices[k+2],pa=positions.slice(3*a,3*a+3),pb=positions.slice(3*b,3*b+3),pc=positions.slice(3*c,3*c+3),normal=cross(sub(pb,pa),sub(pc,pa));if(!(Math.hypot(...normal)>1e-12))throw Error('裁剪曲面包含退化三角形');}
  return {positions,uvs,indices,boundaryIndices:audit.boundaryIndices,audit:{...audit,delaunayFlips,sourceSurface:model.id,loopUV:loop}};
}
// ---- 度量感知均匀重网格：在参数域内按曲面面积密度采样，Delaunay 三角化 + Lloyd 松弛，使空间三角形尺寸近似均匀 ----
const vdc=(n,base)=>{let f=1,r=0;while(n>0){f/=base;r+=f*(n%base);n=Math.floor(n/base);}return r;};
function localScale(model,p,u,v,frames,strength,width){
  const h=1e-4,u0=clamp(u-h,-1,1),u1=clamp(u+h,-1,1),v0=clamp(v-h,-1,1),v1=clamp(v+h,-1,1);
  const du=mul(sub(surfacePoint(model,p,u1,v,frames,strength,width),surfacePoint(model,p,u0,v,frames,strength,width)),1/(u1-u0||1));
  const dv=mul(sub(surfacePoint(model,p,u,v1,frames,strength,width),surfacePoint(model,p,u,v0,frames,strength,width)),1/(v1-v0||1));
  return Math.hypot(...cross(du,dv));
}
function bowyerWatson(pts){
  const n=pts.length;if(n<4)return [];
  const all=pts.map(p=>[p[0],p[1]]),S=8;
  all.push([-S,-S],[S,-S],[0,S]);
  const ai=n,bi=n+1,ci=n+2;
  let tris=[[ai,bi,ci]];
  const circ=t=>{const[x1,y1]=all[t[0]],[x2,y2]=all[t[1]],[x3,y3]=all[t[2]];
    const d=2*(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2));
    if(Math.abs(d)<1e-15)return[0,0,Infinity];
    const ux=((x1*x1+y1*y1)*(y2-y3)+(x2*x2+y2*y2)*(y3-y1)+(x3*x3+y3*y3)*(y1-y2))/d;
    const uy=((x1*x1+y1*y1)*(x3-x2)+(x2*x2+y2*y2)*(x1-x3)+(x3*x3+y3*y3)*(x2-x1))/d;
    return[ux,uy,(ux-x1)*(ux-x1)+(uy-y1)*(uy-y1)];};
  const contains=(c,p)=>{const dx=p[0]-c[0],dy=p[1]-c[1];return dx*dx+dy*dy<=c[2]+1e-12;};
  for(let i=0;i<n;i++){
    const p=all[i],bad=[];
    for(let k=0;k<tris.length;k++)if(contains(circ(tris[k]),p))bad.push(tris[k]);
    if(!bad.length)continue;
    const edgeCount=new Map();
    for(const t of bad)for(const e of [[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]]){
      const key=e[0]<e[1]?`${e[0]}:${e[1]}`:`${e[1]}:${e[0]}`;edgeCount.set(key,(edgeCount.get(key)||0)+1);}
    const poly=[];for(const[key,c]of edgeCount)if(c===1){const[a,b]=key.split(':').map(Number);poly.push([a,b]);}
    tris=tris.filter(t=>!bad.includes(t));
    for(const[a,b]of poly)tris.push([a,b,i]);
  }
  return tris.filter(t=>!(t.includes(ai)||t.includes(bi)||t.includes(ci)));
}
export function uniformMesh(model,p,frames=[],options={}){
  const N=options.resolution||80,strength=options.strength??1,width=options.width??.32;
  const res=clamp(Math.round(options.areaRes||Math.max(96,Math.min(150,Math.round(N*1.5)))),64,200);
  const cellA=2/res,cellB=2/res;
  const scale=new Float64Array(res*res);let total=0;
  for(let j=0;j<res;j++){const v=-1+(j+.5)*cellB;for(let i=0;i<res;i++){const u=-1+(i+.5)*cellA,s=localScale(model,p,u,v,frames,strength,width);scale[j*res+i]=s;total+=s*cellA*cellB;}}
  const T=2*N*N,aPer=total/Math.max(1,T),h=Math.sqrt(4*aPer/Math.sqrt(3));
  const avgScale=Math.sqrt(total/4),suv=clamp(h/avgScale,.02,.25),perEdge=clamp(Math.round(2/suv),4,140);
  const boundary=[];
  const addEdge=(uOf,vOf)=>{for(let k=0;k<perEdge;k++){const t=(k+.5)/perEdge,u=uOf(t),v=vOf(t);boundary.push([u,v]);}};
  addEdge(t=>-1+2*t,()=>-1);addEdge(t=>-1+2*t,()=>1);addEdge(()=>-1,t=>-1+2*t);addEdge(()=>1,t=>-1+2*t);
  for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1]])boundary.push([u,v]);
  const cum=new Float64Array(res*res);let acc=0;for(let k=0;k<res*res;k++){acc+=scale[k]*cellA*cellB;cum[k]=acc;}
  const P_int=Math.max(0,Math.round(T/2)-boundary.length),interior=[];
  for(let s=0;s<P_int;s++){
    const x=(s+.5)/P_int*total,lo2=(()=>{let a=0,b=res*res;while(a<b){const m=(a+b)>>1;if(cum[m]<x)a=m+1;else b=m;}return Math.min(res*res-1,a);})();
    const j=Math.floor(lo2/res),i=lo2%res;
    interior.push([clamp(-1+(i+vdc(s,2))*cellA,-1,1),clamp(-1+(j+vdc(s,3))*cellB,-1,1)]);
  }
  const bCount=boundary.length,final=[];for(const q of boundary)final.push(q);
  for(let k=0;k<interior.length;k++){
    const q=interior[k];let dup=false;
    for(let m=0;m<final.length;m++)if(Math.hypot(q[0]-final[m][0],q[1]-final[m][1])<1e-5){dup=true;break;}
    if(!dup)final.push(q);
  }
  const F=final.length;
  let tris=bowyerWatson(final);
  const iters=clamp(options.lloyd??6,0,20);
  for(let it=0;it<iters;it++){
    const ax=new Float64Array(F),ay=new Float64Array(F),aw=new Float64Array(F);
    const px=new Float64Array(F),py=new Float64Array(F),pz=new Float64Array(F);
    for(let k=0;k<F;k++){const q=surfacePoint(model,p,final[k][0],final[k][1],frames,strength,width);px[k]=q[0];py[k]=q[1];pz[k]=q[2];}
    for(const t of tris){const[a,b,c]=t;
      const area=.5*Math.hypot((py[b]-py[a])*(pz[c]-pz[a])-(pz[b]-pz[a])*(py[c]-py[a]),(pz[b]-pz[a])*(px[c]-px[a])-(px[b]-px[a])*(pz[c]-pz[a]),(px[b]-px[a])*(py[c]-py[a])-(py[b]-py[a])*(px[c]-px[a]));
      const u=(final[a][0]+final[b][0]+final[c][0])/3,v=(final[a][1]+final[b][1]+final[c][1])/3;
      for(const vv of[a,b,c])if(vv>=bCount){ax[vv]+=u*area;ay[vv]+=v*area;aw[vv]+=area;}}
    let moved=0;
    for(let k=bCount;k<F;k++){if(aw[k]<=0)continue;const nu=clamp(final[k][0]+.5*(ax[k]/aw[k]-final[k][0]),-1,1),nv=clamp(final[k][1]+.5*(ay[k]/aw[k]-final[k][1]),-1,1);if(Math.hypot(nu-final[k][0],nv-final[k][1])>1e-9){final[k]=[nu,nv];moved++;}}
    if(!moved)break;
  }
  const P3=[],positions=[],uvs=[];
  for(let k=0;k<F;k++){const q=surfacePoint(model,p,final[k][0],final[k][1],frames,strength,width);P3.push(q);positions.push(...q);uvs.push(final[k][0],final[k][1]);}
  let indices=[];for(const t of tris)indices.push(t[0],t[1],t[2]);
  const collapsePole=edgeMask=>{
    const members=[];for(let k=0;k<F;k++){const[u,v]=final[k];const m=(Math.abs(v+1)<1e-6?1:0)|(Math.abs(v-1)<1e-6?2:0)|(Math.abs(u+1)<1e-6?4:0)|(Math.abs(u-1)<1e-6?8:0);if(m===edgeMask)members.push(k);}
    if(members.length<3)return;
    const isV=edgeMask===1||edgeMask===2;members.sort((a,b)=>isV?final[a][0]-final[b][0]:final[a][1]-final[b][1]);
    let maxGap=0;for(let i=0;i<members.length-1;i++){const d=Math.hypot(...P3[members[i]].map((x,k)=>x-P3[members[i+1]][k]));if(d>maxGap)maxGap=d;}
    if(maxGap>h*.02)return;
    const pole=[0,0,0],puv=[0,0];for(const k of members){for(let d=0;d<3;d++)pole[d]+=P3[k][d];puv[0]+=final[k][0];puv[1]+=final[k][1];}
    const n=members.length;pole[0]/=n;pole[1]/=n;pole[2]/=n;puv[0]/=n;puv[1]/=n;
    const poleIdx=positions.length/3;positions.push(...pole);uvs.push(puv[0],puv[1]);
    const map=new Array(F);for(let k=0;k<F;k++)map[k]=k;for(const k of members)map[k]=poleIdx;
    indices=indices.map(i=>map[i]);
    const keep=[];for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2];if(a!==b&&b!==c&&a!==c)keep.push(a,b,c);}indices=keep;
  };
  collapsePole(2);collapsePole(1);
  let eMin=Infinity,eMax=0,sum=0,cnt=0;
  for(let i=0;i<indices.length;i+=3){const[a,b,c]=indices.slice(i,i+3);for(const[x,y]of[[a,b],[b,c],[c,a]]){const d=Math.hypot(...positions.slice(3*x,3*x+3).map((v,k)=>v-positions[3*y+k]));eMin=Math.min(eMin,d);eMax=Math.max(eMax,d);sum+=d;cnt++;}}
  return {positions,uvs,indices,audit:{uniform:true,triangles:indices.length/3,vertices:positions.length/3,edgeMin:eMin,edgeMax:eMax,edgeMean:sum/cnt,ratio:eMin>0?eMax/eMin:Infinity,sourceSurface:model.id}};
}
export function buildSurface(model,p,frames=[],options={}){
  const N=options.resolution||80,poly=options.trim&&options.closed?(options.importedPolyline||sampleCurve(frames,true,Math.max(8,Math.min(32,Math.round(800/frames.length))))):null,positions=[],uvs=[],indices=[];
  if(poly)return buildTrimmedSurface(model,p,frames,options,poly);
  if(options.uniform!==false){try{return uniformMesh(model,p,frames,options);}catch(error){/* 均匀重网格异常时回退规则网格 */}}
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){let u=-1+2*i/N,v=-1+2*j/N;positions.push(...surfacePoint(model,p,u,v,frames,options.strength??1,options.width??.32));uvs.push(u,v);}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){
    const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;indices.push(a,b,d,a,d,c);
  }
  return {positions,uvs,indices};
}
export function projectCurve(model,p,frames,closed,options={}){
  return (options.importedPolyline||sampleCurve(frames,closed,Math.max(8,Math.min(40,Math.round(800/frames.length))))).map(({u,v})=>({uv:[u,v],position:surfacePoint(model,p,u,v,frames,options.strength??1,options.width??.32)}));
}
