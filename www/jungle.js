/* Реалистичные тропические джунгли: небо, размытые кроны, стволы с корой, лианы, листья, цветы, плоды, животные на ветках */
(function(){
window.buildJungle=function(scene,visW,visH){
var T=THREE,hw=visW/2,hh=visH/2,sway=[],anim=[],i,k;
function R(a,b){return a+Math.random()*(b-a);}
function gcol(a,b,t){return new T.Color(a).lerp(new T.Color(b),t);}
function std(c,r){return new T.MeshStandardMaterial({color:c,roughness:r||0.55});}
function mkc(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
var sph=new T.SphereGeometry(1,12,10),leafGeo=new T.SphereGeometry(1,10,6);

/* небо и размытые дальние кроны (глубина) */
var gc=mkc(256,512),g=gc.getContext('2d'),gr=g.createLinearGradient(0,0,0,512);
gr.addColorStop(0,'#bfe08a');gr.addColorStop(0.22,'#5fae56');gr.addColorStop(0.6,'#236b3c');gr.addColorStop(1,'#0b3a28');
g.fillStyle=gr;g.fillRect(0,0,256,512);
var rg=g.createRadialGradient(190,30,5,190,30,240);rg.addColorStop(0,'rgba(255,248,200,0.9)');rg.addColorStop(1,'rgba(255,248,200,0)');g.fillStyle=rg;g.fillRect(0,0,256,512);
var back=new T.Mesh(new T.PlaneGeometry(visW*4,visH*3),new T.MeshBasicMaterial({map:new T.CanvasTexture(gc),fog:false}));back.position.z=-60;scene.add(back);
function canopy(cols,blur,n,smin,smax,trunkCol,z,alpha){
 var c=mkc(512,1024),g=c.getContext('2d'),i;g.filter='blur('+blur+'px)';
 for(i=0;i<9;i++){g.fillStyle=trunkCol;g.fillRect(R(0,512),0,R(16,46),1024);}
 for(i=0;i<n;i++){g.fillStyle=cols[(Math.random()*cols.length)|0];g.beginPath();g.ellipse(R(0,512),R(0,1024),R(smin,smax),R(smin*0.6,smax*0.8),R(0,3),0,7);g.fill();}
 var m=new T.Mesh(new T.PlaneGeometry(visW*3.4,visH*2.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:alpha,fog:false,depthWrite:false}));m.position.z=z;scene.add(m);}
canopy(['#1d5a46','#256a50','#2d7a58'],14,70,40,110,'#174a3a',-50,0.9);
canopy(['#1f6a3a','#2a8044','#3a9a4a','#1a5a34'],8,90,30,90,'#2a3a24',-34,0.85);

/* лучи света, дымка, пылинки */
for(i=0;i<5;i++){var ray=new T.Mesh(new T.PlaneGeometry(visW*0.12,visH*1.8),new T.MeshBasicMaterial({color:0xfff6c0,transparent:true,opacity:0.09,blending:T.AdditiveBlending,depthWrite:false,fog:false}));
 ray.position.set(-hw*0.4+i*hw*0.4,0,-12);ray.rotation.z=-0.35;scene.add(ray);}
var mc=mkc(128,128),mg=mc.getContext('2d'),mr=mg.createRadialGradient(64,64,0,64,64,64);mr.addColorStop(0,'rgba(220,255,220,0.55)');mr.addColorStop(1,'rgba(220,255,220,0)');mg.fillStyle=mr;mg.fillRect(0,0,128,128);
var mistTex=new T.CanvasTexture(mc);
[[-hw*0.4,-hh*0.55,-9],[hw*0.5,hh*0.1,-14],[0,-hh*0.9,-6],[-hw*0.2,hh*0.5,-18]].forEach(function(p){
 var m=new T.Mesh(new T.PlaneGeometry(visW*0.9,visH*0.35),new T.MeshBasicMaterial({map:mistTex,transparent:true,opacity:0.22,depthWrite:false,fog:false}));m.position.set(p[0],p[1],p[2]);scene.add(m);});
var DN=90,dp=new Float32Array(DN*3),dg=new T.BufferGeometry();
for(i=0;i<DN;i++){dp[i*3]=R(-hw,hw);dp[i*3+1]=R(-hh,hh);dp[i*3+2]=R(-8,2);}
dg.setAttribute('position',new T.BufferAttribute(dp,3));
var dust=new T.Points(dg,new T.PointsMaterial({size:visW*0.012,color:0xfff3b0,transparent:true,opacity:0.7,depthWrite:false,blending:T.AdditiveBlending}));dust.frustumCulled=false;scene.add(dust);

/* стволы с корой, мхом и лианами */
function barkTex(){var c=mkc(128,512),g=c.getContext('2d'),i,y;
 g.fillStyle='#4a3320';g.fillRect(0,0,128,512);
 for(i=0;i<260;i++){y=R(0,512);g.strokeStyle='rgba('+((30+R(0,40))|0)+','+((20+R(0,25))|0)+',10,'+R(0.25,0.6)+')';g.lineWidth=R(1,5);g.beginPath();g.moveTo(R(0,128),y);g.lineTo(R(0,128),y+R(40,200));g.stroke();}
 for(i=0;i<40;i++){g.fillStyle='rgba(70,130,50,'+R(0.2,0.5)+')';g.beginPath();g.ellipse(R(0,128),R(0,512),R(4,14),R(8,30),0,0,7);g.fill();}
 var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,3);return t;}
var bm=new T.MeshStandardMaterial({map:barkTex(),roughness:0.95});
function trunk(x,z,r){var tr=new T.Mesh(new T.CylinderGeometry(r,r*1.25,visH*2.4,16),bm),pts=[],j,a;tr.position.set(x,0,z);scene.add(tr);
 for(j=0;j<=30;j++){a=j*0.55;pts.push(new T.Vector3(x+Math.cos(a)*(r+0.15),-visH*1.1+j*visH*0.073,z+Math.sin(a)*(r+0.15)));}
 scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),90,0.16,6,false),std(0x3a5a2a,0.8)));}
function branch(x0,y,z,len,dir,r){var b=new T.Mesh(new T.CylinderGeometry(r*0.8,r,len,10),bm);b.rotation.z=Math.PI/2;b.position.set(x0+dir*len/2,y,z);scene.add(b);}
trunk(-visW*0.5,-12,2.4);trunk(visW*0.52,-14,2.6);trunk(visW*0.06,-24,3.0);trunk(-visW*0.2,-30,2.8);
branch(-visW*0.5,hh*0.12,-12,visW*0.3,1,0.5);branch(visW*0.52,-hh*0.35,-14,visW*0.32,-1,0.55);branch(visW*0.06,hh*0.78,-24,visW*0.3,1,0.6);

/* листья с жилками и тенью */
function leafTex(kind){var c=mkc(256,256),g=c.getContext('2d'),i,y;
 function shape(){g.beginPath();
  if(kind==='m'){g.moveTo(128,250);g.bezierCurveTo(6,210,-4,70,112,16);g.lineTo(128,40);g.lineTo(144,16);g.bezierCurveTo(260,70,252,210,128,250);}
  else{g.moveTo(128,252);g.bezierCurveTo(30,200,34,60,128,4);g.bezierCurveTo(222,60,226,200,128,252);}}
 var gr=g.createLinearGradient(0,256,0,0);gr.addColorStop(0,'#9fcf86');gr.addColorStop(1,'#eefad0');
 g.fillStyle=gr;shape();g.fill();
 g.globalCompositeOperation='source-atop';
 g.strokeStyle='rgba(30,80,40,0.55)';g.lineWidth=10;shape();g.stroke();
 g.strokeStyle='rgba(70,130,60,0.9)';g.lineWidth=5;g.beginPath();g.moveTo(128,250);g.lineTo(128,14);g.stroke();
 g.lineWidth=2.5;for(i=0;i<9;i++){y=222-i*22;g.beginPath();g.moveTo(128,y);g.lineTo(40+i*3,y-34);g.moveTo(128,y);g.lineTo(216-i*3,y-34);g.stroke();}
 for(i=0;i<500;i++){g.fillStyle='rgba(40,100,40,'+R(0.03,0.12)+')';g.fillRect(R(0,256),R(0,256),R(1,4),R(1,4));}
 if(kind==='m'){g.globalCompositeOperation='destination-out';g.lineCap='round';g.lineWidth=11;
  for(i=0;i<5;i++){y=70+i*32;g.beginPath();g.moveTo(8,y+14);g.lineTo(88,y);g.moveTo(248,y+14);g.lineTo(168,y);g.stroke();}
  for(i=0;i<3;i++){g.beginPath();g.arc(98,120+i*40,7,0,7);g.arc(158,120+i*40,7,0,7);g.fill();}}
 return new T.CanvasTexture(c);}
var LT={m:leafTex('m'),b:leafTex('b')};
function leaf(kind,x,y,z,size,rot,col){var m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshLambertMaterial({map:LT[kind],transparent:true,alphaTest:0.35,side:T.DoubleSide,color:col}));
 m.scale.set(size*(kind==='b'?0.55:0.9),size,1);m.position.set(x,y,z);m.rotation.z=rot;scene.add(m);sway.push({o:m,b:rot,a:R(0.02,0.05),s:R(0.5,1.1),p:R(0,6)});return m;}
for(i=0;i<34;i++){var d=Math.random();leaf(Math.random()<0.55?'m':'b',R(-hw*1.5,hw*1.5),R(-hh*1.2,hh*1.2),-8-d*18,R(9,19),R(0,6.28),gcol(0x7fcf4a,0x0f5a32,d));}
for(i=0;i<16;i++){var sx=Math.random()<0.5?-1:1;leaf(Math.random()<0.6?'m':'b',sx*R(hw*0.7,hw*1.15),R(-hh,hh),R(-6,-3),R(7,12),R(0,6.28),gcol(0x57b347,0x1f7a3a,Math.random()));}
leaf('m',-hw*0.98,hh*0.98,3,visW*0.42,-0.9,0x2f9e44);leaf('m',hw*0.98,hh*0.98,3,visW*0.42,0.9,0x3fae4a);
leaf('b',-hw*0.98,-hh*0.98,3,visW*0.5,-0.6,0x2f9e44);leaf('m',hw*0.98,-hh*0.98,3,visW*0.42,2.2,0x3fae4a);

/* папоротники и пальмовые листья */
function frond(len,c1,c2,droop){
 var n=14,mesh=new T.InstancedMesh(leafGeo,new T.MeshStandardMaterial({roughness:0.6}),n*2+1),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),sc=new T.Vector3(),v=new T.Vector3(),k=0,i,t,l,sd;
 for(i=0;i<n;i++){t=i/(n-1);l=len*0.26*(1-0.55*t)+len*0.04;
  for(sd=-1;sd<=1;sd+=2){e.set(0,sd*1.15,-0.4);q.setFromEuler(e);v.set(l,0,0).applyQuaternion(q);p.set(t*len+v.x,-droop*t*len+v.y,v.z);sc.set(l,l*0.07,l*0.22);m.compose(p,q,sc);mesh.setMatrixAt(k,m);mesh.setColorAt(k,gcol(c1,c2,t).multiplyScalar(0.85+Math.random()*0.3));k++;}}
 e.set(0,0,Math.atan(-droop));q.setFromEuler(e);p.set(len/2,-droop*len/2,0);sc.set(len*0.5,len*0.012,len*0.012);m.compose(p,q,sc);mesh.setMatrixAt(k,m);mesh.setColorAt(k,new T.Color(0x3d6b2a));
 mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;return mesh;}
function cluster(x,y,z,ang,count,len,spread){
 var gp=new T.Group(),i,f,pv;gp.position.set(x,y,z);
 for(i=0;i<count;i++){f=frond(len*(0.8+Math.random()*0.4),i%2?0x2f9e44:0x1e7a3a,i%2?0x9bd64a:0x4aa84f,0.25+Math.random()*0.3);
  pv=new T.Group();pv.rotation.z=ang+(count>1?(i/(count-1)-0.5)*spread:0);pv.rotation.y=(Math.random()-0.5)*0.9;pv.add(f);gp.add(pv);}
 scene.add(gp);return gp;}
cluster(-hw,hh,1,-0.8,4,visW*0.32,1.0);cluster(hw,hh,1,Math.PI+0.8,4,visW*0.32,1.0);
cluster(-hw,-hh,1,0.8,4,visW*0.32,1.0);cluster(hw,-hh,1,Math.PI-0.8,4,visW*0.32,1.0);
cluster(0,hh,-2,-Math.PI/2,5,visH*0.17,1.7);cluster(-hw,0,-1,0,3,visW*0.2,1.0);cluster(hw,0,-1,Math.PI,3,visW*0.2,1.0);
[-0.38,-0.12,0.14,0.38].forEach(function(f){cluster(visW*f,-hh,-3,Math.PI/2,5,visH*0.1,1.6);});

/* лианы */
function vine(x){
 var pts=[],i,lf,fl;for(i=0;i<7;i++)pts.push(new T.Vector3(x+Math.sin(i*1.3+x)*0.8,hh-i*visH*0.04,-1.5));
 scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,0.08,6,false),std(0x2a7a3a,0.7)));
 for(i=1;i<7;i++){lf=new T.Mesh(leafGeo,std(i%2?0x6fc24a:0x3f9e44,0.6));lf.scale.set(1,0.05,0.45);lf.position.copy(pts[i]).add(new T.Vector3(i%2?0.7:-0.7,-0.2,0));lf.rotation.z=i%2?-0.5:0.5;scene.add(lf);}
 fl=new T.Mesh(new T.SphereGeometry(0.35,8,6),std(0xff7aa8,0.5));fl.position.copy(pts[4]).add(new T.Vector3(0.4,0,0.2));scene.add(fl);}
[-0.46,-0.3,-0.12,0.12,0.3,0.46].forEach(function(f){vine(visW*f);});

/* цветы */
function hibiscus(x,y,z,s,col){var gp=new T.Group(),i,p;
 for(i=0;i<5;i++){p=new T.Mesh(leafGeo,std(col,0.5));p.scale.set(0.9*s,0.55*s,0.12);p.position.set(Math.cos(i*1.256)*0.8*s,Math.sin(i*1.256)*0.8*s,0);p.rotation.z=i*1.256;gp.add(p);}
 var c=new T.Mesh(new T.SphereGeometry(0.28*s,10,8),std(0xF7D21F));c.position.z=0.15;gp.add(c);gp.position.set(x,y,z);scene.add(gp);}
function orchid(x,y,z,s,col){var gp=new T.Group(),i,p;
 for(i=0;i<3;i++){p=new T.Mesh(leafGeo,std(col,0.45));p.scale.set(0.9*s,0.5*s,0.1);p.position.set(Math.cos(i*2.09+1.5)*0.8*s,Math.sin(i*2.09+1.5)*0.8*s,0);p.rotation.z=i*2.09+1.5;gp.add(p);}
 var l=new T.Mesh(leafGeo,std(0xffd1ec));l.scale.set(0.4*s,0.6*s,0.1);l.position.set(0,-0.5*s,0.1);gp.add(l);gp.position.set(x,y,z);scene.add(gp);}
function heliconia(x,y,z,s){var gp=new T.Group(),i,p;
 for(i=0;i<6;i++){p=new T.Mesh(leafGeo,std(i%2?0xE24B4A:0xF7C21F,0.45));p.scale.set(0.9*s,0.28*s,0.3*s);p.position.set((i%2?0.5:-0.5)*s,-i*0.55*s,0);p.rotation.z=i%2?-0.6:0.6;gp.add(p);}
 gp.position.set(x,y,z);scene.add(gp);}
var fc=[0xE24B4A,0xF2A33A,0xF05A9F,0xC75CE0,0xFFFFFF,0xFF7A3C];
for(i=0;i<14;i++){var side=Math.random()<0.5?-1:1;(i%3===0?orchid:hibiscus)(side*R(hw*0.55,hw*1.05),R(-hh,hh),R(-5,0.5),R(0.8,1.5),fc[i%fc.length]);}
heliconia(-visW*0.05,hh*0.98,-2,1.1);heliconia(visW*0.35,hh*0.97,-2,1.0);heliconia(-visW*0.4,hh*0.97,-2,1.0);

/* плоды */
function banana(x,y,z){var gp=new T.Group(),i,b,a,st=new T.Mesh(new T.CylinderGeometry(0.12,0.12,2.2,8),std(0x5a8a2a));st.position.y=1.1;gp.add(st);
 for(i=0;i<8;i++){a=i/8*6.28;b=new T.Mesh(leafGeo,std(0xf7d63b,0.4));b.scale.set(0.3,1.15,0.3);b.position.set(Math.cos(a)*0.38,-0.7,Math.sin(a)*0.38);b.rotation.z=-Math.cos(a)*0.35;b.rotation.x=Math.sin(a)*0.35;gp.add(b);}
 var bud=new T.Mesh(leafGeo,std(0x7a2a5a));bud.scale.set(0.35,0.6,0.35);bud.position.y=-2.2;gp.add(bud);gp.position.set(x,y,z);scene.add(gp);}
function hang(x,y,z,len,mk){var st=new T.Mesh(new T.CylinderGeometry(0.05,0.05,len,6),std(0x4a7a2a));st.position.set(x,y-len/2,z);scene.add(st);mk(x,y-len,z);}
function ball(x,y,z,r,sx,sy,col){var m=new T.Mesh(new T.SphereGeometry(r,14,10),std(col,0.4));m.scale.set(sx,sy,sx);m.position.set(x,y,z);scene.add(m);return m;}
function mango(x,y,z){ball(x,y,z,0.7,0.85,1.1,0xF0891E);ball(x+0.2,y+0.1,z+0.4,0.45,0.9,1.05,0xE0452B);}
function berries(x,y,z){for(var k=0;k<9;k++)ball(x+R(-0.7,0.7),y+R(-0.7,0.3),z+R(-0.3,0.3),0.26,1,1,0xD0262B);}
function coconuts(x,y,z){ball(x,y,z,0.75,1,1,0x6b4a2b);ball(x+1.2,y-0.2,z,0.7,1,1,0x5e3f24);ball(x+0.5,y-0.9,z+0.3,0.72,1,1,0x6b4a2b);}
function pineapple(x,y,z){ball(x,y,z,0.9,0.85,1.3,0xE8A21E);for(var k=0;k<5;k++){var c=new T.Mesh(leafGeo,std(0x3f9e44));c.scale.set(0.15,0.9,0.05);c.position.set(x+(k-2)*0.2,y+1.5,z);c.rotation.z=(k-2)*0.35;scene.add(c);}}
function papaya(x,y,z){ball(x,y,z,0.8,0.75,1.4,0xF59A2E);}
function passion(x,y,z){ball(x,y,z,0.55,1,1,0x6a2a7a);ball(x+0.9,y-0.2,z,0.5,1,1,0x7a3a8a);}
hang(-visW*0.3,hh*0.99,-2,2.2,banana);hang(visW*0.22,hh*0.99,-2,1.6,mango);hang(visW*0.42,hh*0.97,-2,1.2,berries);hang(-visW*0.44,hh*0.99,-3,1.4,coconuts);hang(-visW*0.12,hh*0.99,-3,1.0,passion);
pineapple(-visW*0.32,-hh*0.93,-1);papaya(visW*0.12,-hh*0.92,-1);mango(visW*0.38,-hh*0.9,-1);banana(-visW*0.1,-hh*0.78,-3);berries(-hw*0.98,hh*0.15,-2);mango(hw*0.97,-hh*0.2,-2);

/* животные на деревьях (приглушённые, не бросаются в глаза) */
function part(g,mt,sx,sy,sz,x,y,z){var m=new T.Mesh(sph,mt);m.scale.set(sx,sy,sz);m.position.set(x,y,z);g.add(m);return m;}
function monkey(x,y,z,s){var g=new T.Group(),br=std(0x6b4a2e,0.9),tan=std(0xc9a67a,0.9),dk=std(0x1a1210,0.5);
 part(g,br,0.9,1.15,0.8,0,0,0);part(g,tan,0.6,0.8,0.4,0.05,-0.1,0.5);
 var head=new T.Group();head.position.set(0,1.5,0.1);g.add(head);
 part(head,br,0.75,0.7,0.7,0,0,0);part(head,tan,0.5,0.4,0.3,0,-0.12,0.55);part(head,br,0.22,0.22,0.12,-0.7,0.1,0);part(head,br,0.22,0.22,0.12,0.7,0.1,0);
 part(head,dk,0.09,0.09,0.06,-0.22,0.1,0.62);part(head,dk,0.09,0.09,0.06,0.22,0.1,0.62);
 part(g,br,0.28,0.9,0.28,-1.0,0.1,0.15);part(g,br,0.28,0.9,0.28,1.0,0.1,0.15);
 part(g,br,0.35,0.4,0.8,-0.55,-1.05,0.55);part(g,br,0.35,0.4,0.8,0.55,-1.05,0.55);
 var tail=new T.Group();tail.position.set(0,-0.9,-0.6);g.add(tail);
 tail.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(0,-0.9,-0.6),new T.Vector3(0,-1.5,-0.1),new T.Vector3(0,-1.3,0.6)]),20,0.13,6,false),br));
 g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);
 anim.push(function(t){head.rotation.y=Math.sin(t*0.5)*0.5;head.rotation.z=Math.sin(t*0.7)*0.08;tail.rotation.x=Math.sin(t*1.2)*0.25;});}
function sloth(x,y,z,s){var g=new T.Group(),fur=std(0x7a6a52,0.95),pale=std(0xc8b896,0.9),dk=std(0x2a1f18,0.6);
 part(g,fur,1.4,0.7,0.7,0,-1.2,0);
 var head=new T.Group();head.position.set(1.3,-1.45,0);g.add(head);
 part(head,pale,0.55,0.5,0.5,0,0,0);part(head,dk,0.5,0.14,0.1,0,0.05,0.42);part(head,dk,0.07,0.07,0.06,-0.2,0.05,0.5);part(head,dk,0.07,0.07,0.06,0.2,0.05,0.5);
 [[-0.6,0.3],[0.6,0.3],[-0.7,-0.3],[0.6,-0.3]].forEach(function(p){var a=new T.Mesh(new T.CylinderGeometry(0.1,0.12,1.3,6),fur);a.position.set(p[0],-0.55,p[1]);a.rotation.z=p[0]*0.08;g.add(a);});
 g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);
 anim.push(function(t){g.rotation.z=Math.sin(t*0.5)*0.04;head.rotation.y=Math.sin(t*0.4)*0.4;});}
function snake(x,y,z,s){var g=new T.Group(),pts=[],j;
 for(j=0;j<=14;j++)pts.push(new T.Vector3(j*0.4-2.8,Math.sin(j*0.9)*0.35+0.3,Math.cos(j*0.7)*0.25));
 g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),60,0.17,8,false),std(0x5a9a3a,0.6)));
 var head=part(g,std(0x4f8a32,0.6),0.34,0.2,0.26,3.0,0.3,-0.2);
 part(g,std(0xF2C230,0.4),0.06,0.06,0.06,3.1,0.4,-0.05);part(g,std(0xF2C230,0.4),0.06,0.06,0.06,3.1,0.4,-0.35);
 g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);
 anim.push(function(t){g.rotation.z=Math.sin(t*0.8)*0.02;head.position.y=0.3+Math.sin(t*1.4)*0.08;});}
function frog(x,y,z,s){var g=new T.Group(),gr=std(0x58a83a,0.5),dk=std(0x1a1a10,0.4);
 part(g,gr,0.8,0.5,1,0,0,0);part(g,std(0xe8e0a0,0.6),0.55,0.3,0.7,0,-0.15,0.1);
 [-0.4,0.4].forEach(function(ex){part(g,std(0xF2C230,0.3),0.22,0.22,0.22,ex,0.5,0.55);part(g,dk,0.1,0.1,0.1,ex,0.52,0.74);});
 [-0.7,0.7].forEach(function(lx){part(g,gr,0.3,0.25,0.7,lx,-0.15,-0.3);});
 g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);
 anim.push(function(t){g.scale.y=s*(1+0.04*Math.sin(t*2.5));});}
monkey(-visW*0.3,hh*0.12+0.5+1.45,-11.8,1.0);
sloth(visW*0.3,-hh*0.35-0.3,-13.8,0.9);
snake(visW*0.2,hh*0.78+0.7,-23.5,1.3);
frog(-visW*0.3,-hh*0.86,-3.5,0.8);

/* бабочки */
var bf=[];
for(i=0;i<3;i++){var gp=new T.Group(),wl,wr,tri=new T.Shape();tri.moveTo(0,0);tri.lineTo(0.9,0.5);tri.lineTo(0.7,-0.5);
 var col=[0xFFB347,0x7FD1FF,0xFF7AA8][i];
 wl=new T.Mesh(new T.ShapeGeometry(tri),new T.MeshBasicMaterial({color:col,side:T.DoubleSide}));wr=new T.Mesh(new T.ShapeGeometry(tri),new T.MeshBasicMaterial({color:col,side:T.DoubleSide}));wr.scale.x=-1;
 gp.add(wl);gp.add(wr);gp.scale.setScalar(visW*0.03);gp.position.z=2.5;scene.add(gp);bf.push({g:gp,l:wl,r:wr,p:i*2.1});}

var lastT=0;
return {cluster:cluster,update:function(t){
 var dt=Math.min(Math.max(t-lastT,0),0.1);lastT=t;
 sway.forEach(function(s){s.o.rotation.z=s.b+Math.sin(t*s.s+s.p)*s.a;});
 anim.forEach(function(f){f(t);});
 bf.forEach(function(b,k){var tt=t*0.5+b.p;b.g.position.x=Math.sin(tt*1.3)*hw*0.8;b.g.position.y=Math.sin(tt*0.9+k)*hh*0.75;b.g.rotation.z=Math.cos(tt*1.3)*0.5;var f=Math.sin(t*14+b.p);b.l.rotation.y=f;b.r.rotation.y=-f;});
 for(var j=0;j<DN;j++){dp[j*3+1]+=dt*0.4;dp[j*3]+=Math.sin(t+j)*dt*0.3;if(dp[j*3+1]>hh)dp[j*3+1]=-hh;}
 dg.attributes.position.needsUpdate=true;}};
};
})();
                       
