import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "lil-gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { AnimationMixer } from "three";
gsap.registerPlugin(ScrollTrigger);

//!GUI
const gui = new GUI({ width: 800 });
const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
dracoLoader.setDecoderPath(`./draco/`);
dracoLoader.setDecoderConfig({ type: "js" });
gltfLoader.setDRACOLoader(dracoLoader);

//! Sizes
let clock = new THREE.Clock();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("resize", () => {
  //*UPDATE SIZES
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //*UPDATE CAMERA
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //*UPDATE RENDERER
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // // //*UPDATE PP
  // effectComposer.setSize(sizes.width, sizes.height);
  // effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//RAYCASTER İÇİN
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -((event.clientY / sizes.height) * 2 + 1);
});
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

//! CANVAS
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
document.body.appendChild(renderer.domElement);

//! SCENEjn
const scene = new THREE.Scene();
scene.fog = new THREE.Fog("#ffffff", 100, 100);

//! OBJECTS
let model = null;
let action = null;
let mixer = null;
let clips = null;
let animation = null;
gltfLoader.load("/gezegenXL3.gltf", function (gltf) {
  model = gltf.scene;
  gltf.scene.position.set(0, 0, 0);
  scene.add(gltf.scene);

  //ANİMATİON
  mixer = new THREE.AnimationMixer(gltf.scene);
  clips = gltf.animations;
  for (let i = 0; i < 273; i++) {
    const element = gltf.animations[i];
    action = mixer.clipAction(element);
    action.loop = true;
    action.time = 0;
    mixer.time = 0;
    setTimeout(() => {
      clips.forEach(function (element) {
        animation = mixer.clipAction(element).play();
        animation.play();
      });
    }, 0);
  }
});

setTimeout(() => {
  console.log(animation.time);
}, 3000);




//! GALAXY

const parameters = {};

parameters.count = 10000;
parameters.size = 0.02;
parameters.colorYakin = '#ff0000'
parameters.colorUzak = '#ffffff'
let renkDegis = 0.6;


const generateGalaxy = () => {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const colorYakin = new THREE.Color(parameters.colorYakin)
  const colorUzak = new THREE.Color(parameters.colorUzak)

  // colorYakin.lerp(colorUzak,0.5)
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    //Position
    positions[i3 + 0] = (Math.random() - 0.5) * 20; //x
    positions[i3 + 1] = (Math.random() - 0.5) * 20; //y
    positions[i3 + 2] = (Math.random() - 0.5) * 20; //z

    //Color

    const mixedColor = colorYakin.clone()
    mixedColor.lerp(colorUzak,renkDegis)

    colors[i3+0] =mixedColor.r
    colors[i3+1] =mixedColor.g
    colors[i3+2] =mixedColor.b
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  //Material Galaxy
  const material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors:true,
  });

  //STARS

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
};
generateGalaxy();

//LOGOLAR

gltfLoader.load("/Logolar.gltf", function (gltf) {
  model = gltf.scene;
  gltf.scene.position.set(0, 0.2, -0.5);
  scene.add(gltf.scene);
})

//! LIGHT
const pointLight = new THREE.PointLight(0xff0000, 150, 10);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// const sphereSize = 1;
// const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
// scene.add( pointLightHelper );

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(0, 3, 3);
scene.add(directionalLight);
// const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// scene.add( helper );



//!Controls Orbital
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enableZoom = false;
// controls.update();

//! CAMERA

const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);
scene.add(camera);

//! GSAP

let tl = gsap.timeline({
  defaults: { duration: 1, ease: "sine.inOut" },
  scrollTrigger: {
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    scrub: 2,
    ease: "sine.inOut",
    toggleActions: "play reverse play reverse",
    markers: true,
  },
});

tl.to(camera.position, { z: 4 });
tl.to(camera.position, { z: 3 });
tl.to(camera.position, { z: 2 });
tl.to(camera.position, { z: 1 });
tl.to(camera.position, { z: 0.5 });




//!Renderer

renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.render(scene, camera);


//* STATS
const stats = new Stats();
stats.domElement.style.position = "fixed";
stats.domElement.style.left = "0px";
stats.domElement.style.top = "0px";
document.body.appendChild(stats.domElement);


let previousTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (model) {
    model.rotation.y += 0.001;
  }

  //*PARALAX
  const parallaxX = cursor.x * 1;
  const parallaxY = -cursor.y * -1;
  camera.position.x += (parallaxX - camera.position.x) * 2 * deltaTime;
  camera.position.y += ((parallaxY - camera.position.y) * 2 * deltaTime);
  // controls.update();
  stats.update();
  // if ( mixer ) {mixer.update( deltaTime*0.5 )}
  if (mixer) {
    mixer.setTime(scrollY * 0.003);
  }
 
  requestAnimationFrame(tick);
  renderer.render(scene, camera);
};

tick();
