gsap.registerPlugin(ScrollTrigger);

// Cursor ambient light
const glow = document.getElementById('cursorGlow');
window.addEventListener('pointermove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// ---------- Three.js remote ----------
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0.6, 8.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const root = new THREE.Group();
root.rotation.set(-0.22, -0.55, -0.08);
scene.add(root);

const matDark = new THREE.MeshPhysicalMaterial({ color: 0x11151d, roughness: 0.28, metalness: 0.72, clearcoat: 0.65, clearcoatRoughness: 0.24 });
const matEdge = new THREE.MeshPhysicalMaterial({ color: 0x39404c, roughness: 0.25, metalness: 0.88, clearcoat: 0.45 });
const matButton = new THREE.MeshStandardMaterial({ color: 0x202631, roughness: 0.4, metalness: 0.25 });
const matLime = new THREE.MeshStandardMaterial({ color: 0xbaff4a, emissive: 0x4d7a00, emissiveIntensity: 1.8, roughness: 0.25 });
const matCyan = new THREE.MeshStandardMaterial({ color: 0x7be7ff, emissive: 0x1c7687, emissiveIntensity: 1.35, roughness: 0.22 });
const matBoard = new THREE.MeshStandardMaterial({ color: 0x131a19, roughness: 0.45, metalness: 0.3 });
const matCopper = new THREE.MeshStandardMaterial({ color: 0xb77b43, emissive: 0x4d1a00, emissiveIntensity: 0.5, roughness: 0.35, metalness: 0.75 });

function roundedBox(w, h, d, r = 0.22, mat = matDark) {
  const g = new THREE.BoxGeometry(w, h, d, 5, 5, 3);
  const m = new THREE.Mesh(g, mat);
  m.geometry.computeVertexNormals();
  return m;
}

const shell = roundedBox(2.25, 5.55, 0.58, .2, matDark);
shell.position.z = 0.28;
root.add(shell);

const innerFrame = roundedBox(2.06, 5.33, 0.18, .18, matEdge);
innerFrame.position.z = 0.62;
root.add(innerFrame);

// top glass area
const display = roundedBox(1.68, 1.16, 0.11, .18, new THREE.MeshPhysicalMaterial({color:0x0b1118,roughness:.12,metalness:.25,transmission:.05,clearcoat:1}));
display.position.set(0, 1.64, 0.79);
root.add(display);
const displayAccent = roundedBox(1.23, .035, .04, .02, matCyan);
displayAccent.position.set(0,1.25,.87);
root.add(displayAccent);

// navigation ring
const ring = new THREE.Mesh(new THREE.TorusGeometry(.53,.09,24,80), matEdge);
ring.rotation.x = Math.PI/2;
ring.position.set(0,.43,.82);
root.add(ring);
const ok = new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.11,48), matLime);
ok.rotation.x=Math.PI/2;
ok.position.set(0,.43,.86);
root.add(ok);

// buttons
const buttons=[];
function addButton(x,y,r=.16,material=matButton){
  const b=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.10,32),material);
  b.rotation.x=Math.PI/2;
  b.position.set(x,y,.82);
  root.add(b);
  buttons.push(b);
  return b;
}
addButton(-.63,-.48,.15);
addButton(.63,-.48,.15);
addButton(-.63,-.95,.15);
addButton(.63,-.95,.15);
for(let row=0;row<4;row++){
  for(let col=0;col<3;col++){
    addButton((col-1)*.53,-1.55-row*.47,.13, row===3 && col===1 ? matCyan : matButton);
  }
}

// Internals for exploded view
const board = roundedBox(1.8,4.6,.12,.12,matBoard);
board.position.z=-.08;
root.add(board);

const battery = roundedBox(1.12,1.75,.22,.12,new THREE.MeshStandardMaterial({color:0x161a20,roughness:.5,metalness:.2}));
battery.position.set(0,-1.5,-.26);
root.add(battery);

const chip = roundedBox(.72,.72,.16,.1,new THREE.MeshStandardMaterial({color:0x111019,roughness:.25,metalness:.7}));
chip.position.set(0,.7,-.22);
root.add(chip);

const chipGlow = roundedBox(.46,.055,.03,.01,matLime);
chipGlow.position.set(0,.7,-.12);
root.add(chipGlow);

for(let i=0;i<14;i++){
  const trace = roundedBox(Math.random()*.55+.2,.025,.025,.01,matCopper);
  trace.position.set((Math.random()-.5)*1.35,(Math.random()-.5)*3.55,-.13);
  trace.rotation.z = Math.random()>.5 ? 0 : Math.PI/2;
  root.add(trace);
}

// Edge screws
for(const y of [2.25,-2.25]){
  for(const x of [-.82,.82]){
    const s=addButton(x,y,.055,matCopper);
    s.position.z=.87;
  }
}

const hemi = new THREE.HemisphereLight(0xbcd8ff, 0x090a0f, 1.3);
scene.add(hemi);
const key = new THREE.PointLight(0x7be7ff, 18, 16, 2);
key.position.set(3,3,5);
scene.add(key);
const rim = new THREE.PointLight(0xbaff4a, 12, 14, 2);
rim.position.set(-4,-2,4);
scene.add(rim);
const warm = new THREE.PointLight(0x8b66ff, 10, 12, 2);
warm.position.set(1,-4,2);
scene.add(warm);

// subtle particles
const pGeo = new THREE.BufferGeometry();
const pCount=170;
const positions=new Float32Array(pCount*3);
for(let i=0;i<pCount;i++){
  positions[i*3]=(Math.random()-.5)*10;
  positions[i*3+1]=(Math.random()-.5)*10;
  positions[i*3+2]=(Math.random()-.5)*7;
}
pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const particles=new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({color:0x7be7ff,size:.018,transparent:true,opacity:.38})
);
scene.add(particles);

let mouseX=0,mouseY=0,isDragging=false,lastX=0,lastY=0;

canvas.addEventListener('pointerdown',e=>{
  isDragging=true;
  lastX=e.clientX;
  lastY=e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup',()=>isDragging=false);
canvas.addEventListener('pointermove',e=>{
  const rect=canvas.getBoundingClientRect();
  mouseX=((e.clientX-rect.left)/rect.width-.5);
  mouseY=((e.clientY-rect.top)/rect.height-.5);
  if(isDragging){
    root.rotation.y+=(e.clientX-lastX)*.008;
    root.rotation.x+=(e.clientY-lastY)*.006;
    lastX=e.clientX;
    lastY=e.clientY;
  }
});

function resize(){
  const rect=canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width,rect.height,false);
  camera.aspect=rect.width/rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
resize();

let t=0;
function animate(){
  requestAnimationFrame(animate);
  t+=.008;
  if(!isDragging){
    root.rotation.y += (mouseX*.22 - (root.rotation.y + .55))*.018;
    root.rotation.x += (-.22+mouseY*.12-root.rotation.x)*.015;
    root.position.y=Math.sin(t)*.06;
  }
  particles.rotation.y+=.0004;
  renderer.render(scene,camera);
}
animate();

let exploded=false;
const explodeBtn=document.getElementById('explodeBtn');

function setExploded(on){
  exploded=on;
  const tl=gsap.timeline({defaults:{duration:1.05,ease:'power3.inOut'}});
  tl.to(shell.position,{z:on?-1.7:.28},0)
    .to(innerFrame.position,{z:on?-0.8:.62},0)
    .to(board.position,{z:on?.15:-.08},0)
    .to(battery.position,{z:on?.9:-.26,y:on?-1.85:-1.5},0)
    .to(chip.position,{z:on?1.35:-.22,y:on?.92:.7},0)
    .to(chipGlow.position,{z:on?1.48:-.12,y:on?.92:.7},0)
    .to(display.position,{z:on?2.25:.79,y:on?1.92:1.64},0)
    .to(displayAccent.position,{z:on?2.38:.87,y:on?1.53:1.25},0)
    .to(ring.position,{z:on?1.82:.82,y:on?.55:.43},0)
    .to(ok.position,{z:on?1.96:.86,y:on?.55:.43},0);

  buttons.forEach((b,i)=>{
    tl.to(
      b.position,
      {
        z:on?1.5+(i%3)*.08:.82,
        y:on?b.position.y+(i%2?-.06:.06):b.userData.baseY ?? b.position.y
      },
      {duration:.85},
      0
    );
  });

  explodeBtn.innerHTML = on
    ? '<span class="play-dot">↺</span> Réassembler'
    : '<span class="play-dot">✦</span> Voir l\'intérieur';
}

buttons.forEach(b=>b.userData.baseY=b.position.y);
explodeBtn.addEventListener('click',()=>setExploded(!exploded));

// Scroll-driven hero object
ScrollTrigger.create({
  trigger:'#hero',
  start:'top top',
  end:'bottom top',
  scrub:1,
  onUpdate:self=>{
    const p=self.progress;
    root.scale.setScalar(1-p*.16);
    root.rotation.z=-.08+p*.32;
    root.position.x=p*.55;
  }
});

// UI entrance
const revealTargets=[
  '.eyebrow',
  'h1',
  '.lead',
  '.hero-actions',
  '.hero-meta',
  '.device-card',
  '.feature-list > div',
  '.spec-grid > div',
  '.purchase-card'
];

revealTargets.forEach(sel=>{
  gsap.utils.toArray(sel).forEach(el=>{
    gsap.from(el,{
      opacity:0,
      y:28,
      duration:.9,
      ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%',once:true}
    });
  });
});

// Macro remote parallax
if(document.querySelector('.macro-remote')){
  gsap.to('.macro-remote',{
    y:-26,
    rotation:-10,
    scrollTrigger:{
      trigger:'.detail-panel',
      start:'top bottom',
      end:'bottom top',
      scrub:1.2
    }
  });
}