/* Реалистичные 3D-птицы из перьев. Использование: var A = makeBird(0..5) */
(function(){
var T=THREE;
var seed=1;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
function C(h){return new T.Color(h);}
function sm(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
function mixc(a,b,t){return a.clone().lerp(b,t);}
function blob(rx,ry,rz,fn,ws,hs){
 var g=new T.SphereGeometry(1,ws||32,hs||22),p=g.attributes.position,col=new Float32Array(p.count*3),c,i;
 for(i=0;i<p.count;i++){c=fn(p.getX(i),p.getY(i),p.getZ(i));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.scale(rx,ry,rz);return g;}
var vcMat=new T.MeshStandardMaterial({vertexColors:true,roughness:0.5,metalness:0.08});
var glossMat=new T.MeshStandardMaterial({vertexColors:true,roughness:0.32,metalness:0.1});
function feather(L,w,c1,c2,th){
 var m=new T.Mesh(blob(L/2,th||0.045,w,function(x){return mixc(c1,c2,Math.pow((1-x)/2,1.3));},14,9),vcMat);
 m.position.x=-L/2;return m;}
var fGeo=new T.SphereGeometry(1,8,6);
function scatter(parent,cx,cy,cz,rx,ry,rz,n,sz,fn){
 var mesh=new T.InstancedMesh(fGeo,new T.MeshStandardMaterial({roughness:0.5,metalness:0.08}),n);
 var m=new T.Matrix4(),nv=new T.Vector3(),tv=new T.Vector3(),bv=new T.Vector3(),q=new T.Quaternion(),pv=new T.Vector3(),sv=new T.Vector3(),k=0;
 var ca=Math.cos(0.22),sa=Math.sin(0.22);
 for(;k<n;k++){
  var th=rnd()*6.2832,ph=Math.acos(2*rnd()-1),x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th);
  nv.set(x/rx,y/ry,z/rz).normalize();
  tv.set(-1,0,0).addScaledVector(nv,nv.x).normalize();
  var t2=tv.clone().multiplyScalar(ca).addScaledVector(nv,sa),n2=nv.clone().multiplyScalar(ca).addScaledVector(tv,-sa);
  bv.crossVectors(t2,n2).normalize();
  m.makeBasis(t2,n2,bv);q.setFromRotationMatrix(m);
  var a=sz*(0.85+rnd()*0.4);
  sv.set(a,sz*0.1,sz*0.5);
  pv.set(cx+x*rx,cy+y*ry,cz+z*rz).addScaledVector(nv,sz*0.08).addScaledVector(t2,a*0.8);
  m.compose(pv,q,sv);mesh.setMatrixAt(k,m);
  mesh.setColorAt(k,fn(nv.x,nv.y,nv.z).clone().multiplyScalar(0.88+rnd()*0.24));}
 mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;parent.add(mesh);return mesh;}
function beak(len,rad,curve,c0,c1,flat){
 var g=new T.ConeGeometry(rad,len,20,12);g.rotateZ(-Math.PI/2);g.translate(len/2,0,0);
 var p=g.attributes.position,col=new Float32Array(p.count*3),i,t,c;
 for(i=0;i<p.count;i++){t=p.getX(i)/len;p.setY(i,p.getY(i)-curve*len*t*t*0.5);p.setZ(i,p.getZ(i)*(flat||0.8));
  c=mixc(c0,c1,Math.pow(Math.max(0,Math.min(1,t)),1.4));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return new T.Mesh(g,glossMat);}
function eye(ring,er){
 var g=new T.Group(),rg=new T.Mesh(new T.SphereGeometry(er*1.4,16,12),new T.MeshStandardMaterial({color:ring,roughness:0.6}));rg.scale.z=0.4;g.add(rg);
 var ball=new T.Mesh(new T.SphereGeometry(er,16,12),new T.MeshStandardMaterial({color:0x0a0a0c,roughness:0.1,metalness:0.2}));ball.position.z=er*0.3;g.add(ball);
 var hl=new T.Mesh(new T.SphereGeometry(er*0.28,8,6),new T.MeshBasicMaterial({color:0xffffff}));hl.position.set(er*0.3,er*0.35,er*1.05);g.add(hl);return g;}
function wingMesh(w,sd){
 var g=new T.Group(),i,t,pv;
 for(i=0;i<w.n;i++){t=i/(w.n-1);pv=new T.Group();pv.rotation.z=(t-0.45)*0.5+0.08;pv.position.z=sd*0.035*i;
  pv.add(feather(w.len*(0.72+0.28*t),w.w,C(w.c1),C(w.c2),0.04));g.add(pv);}
 for(i=0;i<7;i++){t=i/6;pv=new T.Group();pv.rotation.z=(t-0.5)*0.5+0.1;pv.position.set(0.1,0.08,sd*(0.32+0.02*i));
  pv.add(feather(w.len*0.5,w.w*0.8,C(w.c1),mixc(C(w.c1),C(w.c2),0.35),0.05));g.add(pv);}
 return g;}
var SP=[
{n:'Солнцеперый ара',ext:9.5,tilt:0.5,rx:2.3,ry:1.7,rz:1.35,top:0xD42027,mid:0xE0352B,belly:0xE8452C,
 head:{r:1.15,top:0xD42027,mid:0xE0352B},beak:{len:1.5,r:0.85,curve:0.7,c0:0xF4EFE4,c1:0xE2DCCB,l0:0x2b2b2b,l1:0x1a1a1a,flat:0.78},eye:{ring:0xF6F2E8,er:0.2},
 wing:{len:3.6,c1:0xF4C21F,c2:0x2D6BD0,n:9,w:0.34},tail:{len:6,n:7,spread:0.16,c1:0xD42027,c2:0x2D6BD0,w:0.3},legs:{h:1.5,col:0x66625d},
 patches:[{col:0xF7F3EA,sx:0.66,sy:0.52,sz:0.12,dir:[0.45,0,0.9]}]},
{n:'Лунный тукан',ext:9.5,tilt:0.3,rx:2.3,ry:1.7,rz:1.3,top:0x2A2E6B,mid:0x23275C,belly:0x23275C,chest:0xFFF1C9,
 head:{r:1.05,top:0x2A2E6B,mid:0x23275C},beak:{len:4.2,r:1.05,curve:0.25,c0:0xF29A1F,c1:0xE23A1F,l0:0xF5B342,l1:0xD83A1F,flat:0.8},eye:{ring:0x3FA7E0,er:0.2},
 wing:{len:3.4,c1:0x23275C,c2:0x1F6FB8,n:9,w:0.34},tail:{len:3,n:5,spread:0.12,c1:0x23275C,c2:0x1F6FB8,w:0.3},legs:{h:1.4,col:0x7aa6c9},
 patches:[{col:0x3FA7E0,sx:0.7,sy:0.6,sz:0.1,dir:[0.4,0.1,0.9]}]},
{n:'Огненный какаду',ext:8.5,tilt:0.45,rx:2.2,ry:1.65,rz:1.3,top:0xFFFFFF,mid:0xF6F3EC,belly:0xFFE3E3,
 head:{r:1.1,top:0xFFFFFF,mid:0xF6F3EC},crest:{n:7,len:2.2,c1:0xFFB347,c2:0xFF5A1F},
 beak:{len:1.15,r:0.72,curve:0.8,c0:0xB9B9B9,c1:0x8a8a8a,l0:0x6a6a6a,l1:0x4a4a4a,flat:0.8},eye:{ring:0xEFE9DA,er:0.19},
 wing:{len:3.3,c1:0xFFFFFF,c2:0xFFD24D,n:9,w:0.34},tail:{len:3.8,n:6,spread:0.14,c1:0xFFFFFF,c2:0xFFC247,w:0.3},legs:{h:1.4,col:0x8a8a8a},
 patches:[{col:0xFF9A3C,sx:0.5,sy:0.4,sz:0.1,dir:[0.3,-0.15,0.95]}]},
{n:'Нефритовый колибри',ext:6,tilt:0.55,hover:true,rx:1.5,ry:0.95,rz:0.8,top:0x1FBF7A,mid:0x0F9D63,belly:0xDDEFE3,
 head:{r:0.68,top:0x1FBF7A,mid:0x0F9D63},beak:{len:3.1,r:0.13,curve:0.06,c0:0x222222,c1:0x111111,flat:1},eye:{ring:0x1a1a1a,er:0.13},
 wing:{len:2.6,c1:0x2D8A64,c2:0x16402F,n:8,w:0.22},tail:{len:1.9,n:5,spread:0.1,c1:0x0F9D63,c2:0x16402F,w:0.2},legs:{h:0.7,col:0x333333},
 patches:[{col:0xE0245E,sx:0.5,sy:0.35,sz:0.08,dir:[0.55,-0.5,0]}]},
{n:'Радужный попугай',ext:8.5,tilt:0.45,rx:2.2,ry:1.6,rz:1.3,top:0x38A83F,mid:0x38A83F,belly:0xA4C93A,chest:0xF05A1F,
 head:{r:1.1,top:0x2F5FD0,mid:0x3A6FE0},beak:{len:1.0,r:0.6,curve:0.8,c0:0xF05A1F,c1:0xE04A10,l0:0xE04A10,l1:0xBA3A0A,flat:0.8},eye:{ring:0xF7D21F,er:0.19},
 wing:{len:3.3,c1:0x2FA03A,c2:0x1B6E2A,n:9,w:0.32},tail:{len:4,n:6,spread:0.12,c1:0x38A83F,c2:0xF7D21F,w:0.28},legs:{h:1.4,col:0x8a7f78},patches:[]},
{n:'Кристальный фламинго',ext:12.5,tilt:0.1,rx:2.1,ry:1.5,rz:1.1,top:0xF59DB8,mid:0xF07FA3,belly:0xF9B9CC,
 head:{x:2.45,y:5.75,r:0.62,top:0xF59DB8,mid:0xF07FA3},neck:[[1.4,0.6],[2.5,1.4],[2.7,2.8],[2.0,4.1],[2.3,5.2]],neckR:0.36,
 beak:{len:1.5,r:0.34,curve:2.4,c0:0xF7C6D4,c1:0x222222,l0:0xF7C6D4,l1:0x222222,flat:0.9},eye:{ring:0xF6E7A0,er:0.14},
 wing:{len:3.3,c1:0xF07FA3,c2:0x2b2b2b,n:9,w:0.34},tail:{len:2,n:4,spread:0.1,c1:0xF07FA3,c2:0xE0668C,w:0.28},legs:{h:4.6,col:0xE8789A},patches:[]}
];
window.BIRD_NAMES=SP.map(function(s){return s.n;});
window.makeBird=function(k){
 seed=777+k;
 var s=SP[k],B=new T.Group(),tg=new T.Group();tg.rotation.z=s.tilt;B.add(tg);
 var rx=s.rx,ry=s.ry,rz=s.rz;
 function bodyFn(x,y,z){
  var c=C(s.mid).lerp(C(s.top),sm(0.25,0.9,y)).lerp(C(s.belly),sm(-0.05,-0.7,y)*(x>-0.7?1:0.5));
  if(s.chest)c.lerp(C(s.chest),sm(0.1,0.6,x)*sm(0.6,-0.2,y));return c;}
 var body=new T.Mesh(blob(rx,ry,rz,bodyFn,40,28),vcMat);tg.add(body);
 scatter(tg,0,0,0,rx*1.01,ry*1.01,rz*1.01,720,0.5*rx/2.3,bodyFn);
 var h=s.head,hx=h.x!==undefined?h.x:rx*0.9,hy=h.y!==undefined?h.y:ry*0.75+h.r*0.55;
 var P=s.neck?new T.Vector3(hx,hy,0):new T.Vector3(rx*0.75,ry*0.5,0);
 var hg=new T.Group();hg.position.copy(P);tg.add(hg);
 var off=new T.Vector3(hx-P.x,hy-P.y,0);
 function hf(x,y){return C(h.mid).lerp(C(h.top),sm(0.2,0.9,y));}
 var head=new T.Mesh(blob(h.r,h.r*0.95,h.r*0.9,hf,32,22),vcMat);head.position.copy(off);hg.add(head);
 scatter(hg,off.x,off.y,off.z,h.r,h.r*0.95,h.r*0.9,150,0.3*h.r,hf);
 if(s.crest){var cr=s.crest,i,tt,pv,mid;for(i=0;i<cr.n;i++){tt=i/(cr.n-1);mid=1-Math.abs(tt-0.5)*2;pv=new T.Group();
  pv.position.set(off.x-h.r*0.25,off.y+h.r*0.75,(tt-0.5)*h.r*0.5);pv.rotation.z=-(0.8+mid*0.5);pv.rotation.y=(tt-0.5)*0.5;
  pv.add(feather(cr.len*(0.7+0.3*mid),0.22,C(cr.c1),C(cr.c2),0.05));hg.add(pv);}}
 var eyes=[];
 (s.patches||[]).forEach(function(pt){(pt.dir[2]===0?[1]:[-1,1]).forEach(function(sd){
  var col=C(pt.col),m=new T.Mesh(blob(pt.sx,pt.sy,pt.sz,function(){return col;},20,14),glossMat),d=new T.Vector3(pt.dir[0],pt.dir[1],pt.dir[2]*sd).normalize();
  m.position.copy(off).addScaledVector(d,h.r*0.92);m.lookAt(m.position.clone().add(d));hg.add(m);});});
 var bk=s.beak,bx=off.x+h.r*0.78,by=off.y-h.r*0.05;
 var ub=beak(bk.len,bk.r,bk.curve,C(bk.c0),C(bk.c1),bk.flat);ub.position.set(bx,by,0);hg.add(ub);
 var lb=beak(bk.len*0.82,bk.r*0.7,bk.curve*0.4,C(bk.l0||bk.c0),C(bk.l1||bk.c1),bk.flat);lb.position.set(bx+0.05,by-bk.r*0.62,0);hg.add(lb);
 [-1,1].forEach(function(sd){var e=eye(s.eye.ring,s.eye.er),d=new T.Vector3(0.5,0.3,0.8*sd).normalize();
  e.position.copy(off).addScaledVector(d,h.r*0.97);e.lookAt(e.position.clone().add(d));hg.add(e);eyes.push(e);});
 if(s.neck){var pts=s.neck.map(function(p){return new T.Vector3(p[0],p[1],0);});
  tg.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,s.neckR||0.4,12,false),new T.MeshStandardMaterial({color:s.mid,roughness:0.55})));}
 var wings=[];
 [-1,1].forEach(function(sd){var wg=wingMesh(s.wing,sd);wg.position.set(0.35,ry*0.4,sd*rz*0.82);tg.add(wg);wings.push({g:wg,sd:sd});});
 var tl=s.tail,tailG=new T.Group();tailG.position.set(-rx*0.85,-ry*0.1,0);tg.add(tailG);
 for(var i2=0;i2<tl.n;i2++){var t3=i2/(tl.n-1)-0.5,pv2=new T.Group();pv2.rotation.y=t3*tl.spread*2;pv2.rotation.z=0.3+Math.abs(t3)*0.1;
  pv2.add(feather(tl.len*(1-Math.abs(t3)*0.18),tl.w,C(tl.c1),C(tl.c2),0.04));tailG.add(pv2);}
 var lg=s.legs,perchY=-ry*0.75-lg.h,legMat=new T.MeshStandardMaterial({color:lg.col,roughness:0.7});
 [-1,1].forEach(function(sd){
  var leg=new T.Mesh(new T.CylinderGeometry(0.1,0.12,lg.h+0.3,8),legMat);leg.position.set(0.15,-ry*0.75-lg.h/2+0.15,sd*0.5);B.add(leg);
  for(var j=0;j<3;j++){var toe=new T.Mesh(new T.CylinderGeometry(0.07,0.06,0.55,6),legMat);toe.rotation.z=Math.PI/2;toe.rotation.y=j<2?(j?0.35:-0.35):0;
   toe.position.set(0.15+(j<2?0.3:-0.3),perchY+0.18,sd*0.5+(j===0?-0.08:j===1?0.08:0));B.add(toe);}});
 var br=new T.Mesh(new T.CylinderGeometry(0.26,0.3,10,14),new T.MeshStandardMaterial({color:0x6b4a2b,roughness:0.9}));br.rotation.x=Math.PI/2;br.position.set(0.15,perchY-0.1,0);B.add(br);
 for(var q=0;q<4;q++){var lf=new T.Mesh(new T.SphereGeometry(1,10,8),new T.MeshStandardMaterial({color:0x2E8B57,roughness:0.6}));lf.scale.set(0.8,0.05,0.35);
  lf.position.set(0.15+(q%2?0.5:-0.5),perchY+0.05,(q<2?-1:1)*(3+q*0.3));lf.rotation.y=q*0.9;lf.rotation.z=0.25;B.add(lf);}
 var top=hy+h.r;
 return {B:B,tg:tg,body:body,hg:hg,eyes:eyes,wings:wings,tail:tailG,hover:s.hover,ext:s.ext,cx:0.6,cy:(perchY+top)/2};
};
})();
  
