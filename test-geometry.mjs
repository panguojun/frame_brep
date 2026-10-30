import assert from 'node:assert/strict';
import {CATALOG,frameAt,buildSurface,projectCurve,surfacePoint,pointInPolygon,validateTrimLoop,improveConstrainedDelaunay,uniformMesh} from './geometry.js';
const frames=[{u:-.5,v:-.5,angle:0,t:1,anchorU:-.5,anchorV:-.5,anchorAngle:0},{u:.5,v:-.5,angle:Math.PI/2,t:1,anchorU:.5,anchorV:-.5,anchorAngle:Math.PI/2},{u:.5,v:.5,angle:Math.PI,t:1,anchorU:.5,anchorV:.5,anchorAngle:Math.PI},{u:-.5,v:.5,angle:-Math.PI/2,t:1,anchorU:-.5,anchorV:.5,anchorAngle:-Math.PI/2}];
for(const model of CATALOG){
  const params=Object.fromEntries(model.p.map(x=>[x.key,x.initial]));
  const mesh=buildSurface(model,params,frames,{resolution:16,closed:true,uniform:false});
  assert.equal(mesh.positions.length,17*17*3,model.id);
  assert.equal(mesh.indices.length,16*16*6,model.id);
  assert.ok(mesh.positions.every(Number.isFinite),model.id);
  const uniform=buildSurface(model,params,frames,{resolution:16,closed:true});
  assert.ok(uniform.audit&&uniform.audit.uniform,model.id);
  assert.ok(uniform.positions.every(Number.isFinite),model.id);
  assert.ok(uniform.indices.length>0,model.id);
  assert.ok(uniform.audit.ratio<50,model.id+` edge ratio ${uniform.audit.ratio}`);
  const projected=projectCurve(model,params,frames,true);
  assert.ok(projected.length>100,model.id);
  for(const item of projected){const exact=surfacePoint(model,params,...item.uv,frames);assert.ok(Math.hypot(...item.position.map((x,i)=>x-exact[i]))<1e-9,model.id);}
  const frame=frameAt(model,params,.1,.1);assert.ok(Math.abs(Math.hypot(...frame.n)-1)<1e-8,model.id);
  const face=buildSurface(model,params,frames,{resolution:16,closed:true,trim:true});
  assert.equal(face.audit.euler,1,model.id);
  assert.equal(face.audit.boundaryComponents,1,model.id);
  assert.ok(face.indices.length>0&&face.positions.every(Number.isFinite),model.id);
}
const sphere=CATALOG.find(m=>m.id==='sphere'),sphParams={radius:3};
const sphMesh=buildSurface(sphere,sphParams,[],{resolution:40});
assert.ok(sphMesh.positions.every(Number.isFinite),'sphere uniform finite');
assert.ok(sphMesh.indices.length>0,'sphere uniform tris');
assert.ok(sphMesh.audit.ratio<50,`sphere edge ratio ${sphMesh.audit.ratio}`);
const plane=CATALOG[0],params={width:8,depth:8},before=surfacePoint(plane,params,-.5,-.5,frames);
frames[0].lift=1;
const after=surfacePoint(plane,params,-.5,-.5,frames);
assert.ok(Math.hypot(...after.map((x,i)=>x-before[i]))>.9);
const trimmed=buildSurface(plane,params,frames,{resolution:40,closed:true,trim:true});
assert.ok(trimmed.indices.length>0);
assert.equal(trimmed.audit.euler,1);
assert.equal(trimmed.audit.boundaryComponents,1);
assert.equal(trimmed.audit.boundaryEdges,trimmed.boundaryIndices.length);
assert.ok(Math.abs(trimmed.audit.uvArea-validateTrimLoop(trimmed.audit.loopUV).area)<1e-7);
for(const q of trimmed.audit.loopUV){assert.ok(trimmed.boundaryIndices.some(i=>Math.hypot(trimmed.uvs[2*i]-q.u,trimmed.uvs[2*i+1]-q.v)<1e-10));}
for(let i=0;i<trimmed.uvs.length;i+=2){const exact=surfacePoint(plane,params,trimmed.uvs[i],trimmed.uvs[i+1],frames);assert.ok(Math.hypot(...exact.map((x,k)=>x-trimmed.positions[3*i/2+k]))<1e-9);}
assert.throws(()=>validateTrimLoop([{u:-.5,v:-.5},{u:.5,v:.5},{u:-.5,v:.5},{u:.5,v:-.5}]),/自相交|面积过小/);
const quad=[{u:0,v:0},{u:2,v:0},{u:1.6,v:1.8},{u:0,v:1}],diagonal=[0,1,2,0,2,3];
assert.equal(improveConstrainedDelaunay(quad,diagonal),1);
const edges=new Set();for(let k=0;k<diagonal.length;k+=3)for(const [a,b] of [[diagonal[k],diagonal[k+1]],[diagonal[k+1],diagonal[k+2]],[diagonal[k+2],diagonal[k]]])edges.add([a,b].sort().join(':'));
assert.ok(edges.has('1:3')&&!edges.has('0:2'));
const clean=validateTrimLoop([{u:-.5,v:-.5},{u:0,v:-.5},{u:0,v:-.5},{u:.5,v:-.5},{u:.5,v:.5},{u:-.5,v:.5},{u:-.5,v:-.5}]);
assert.equal(clean.loop.length,4);
const dense=Array.from({length:400},(_,i)=>({u:.75*Math.cos(i*2*Math.PI/400),v:.75*Math.sin(i*2*Math.PI/400)}));
const denseFace=buildSurface(plane,params,[],{resolution:180,closed:true,trim:true,importedPolyline:dense});
assert.ok(denseFace.audit.faces>30000&&denseFace.audit.delaunayFlips>0);
assert.equal(denseFace.audit.boundaryComponents,1);
const original=[{u:-.8,v:-.2},{u:0,v:.7},{u:.8,v:-.2}];
const direct=projectCurve(plane,params,frames,false,{importedPolyline:original});
assert.deepEqual(direct.map(p=>p.uv),original.map(p=>[p.u,p.v]));
assert.equal(pointInPolygon(0,0,[{u:-1,v:-1},{u:1,v:-1},{u:1,v:1},{u:-1,v:1}]),true);
console.log(`${CATALOG.length} analytic surfaces, projection, deformation and trim checks passed`);
