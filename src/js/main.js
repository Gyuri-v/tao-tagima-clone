import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

const DEBUG = location.search.indexOf('debug') > -1;

const App = function () {
  let ww, wh;
  let renderer, scene, camera, light, controls, textureLoader, clock;
  let isRequestRender = false;

  const worksGroup = new THREE.Group();
  const works = [
    {
      name: 'MN concept movie',
      image: './resources/images/MN.jpeg',
      material: null,
    },
    {
      name: 'TELE-PLAY - prism',
      image: './resources/images/prism.jpeg',
      material: null,
    },
    {
      name: 'CITIZEN - ATTESA',
      image: './resources/images/ATTESA.jpeg',
      material: null,
    },
    {
      name: 'FUTURE FOOD TALK',
      image: './resources/images/AJINOMOTO.jpeg',
      material: null,
    },
    {
      name: 'MN concept movie',
      image: './resources/images/MN.jpeg',
      material: null,
    },
    {
      name: 'TELE-PLAY - prism',
      image: './resources/images/prism.jpeg',
      material: null,
    },
    {
      name: 'CITIZEN - ATTESA',
      image: './resources/images/ATTESA.jpeg',
      material: null,
    },
    {
      name: 'FUTURE FOOD TALK',
      image: './resources/images/AJINOMOTO.jpeg',
      material: null,
    },
  ];

  let $canvas;
  const $container = document.querySelector('.container');
  const $meshArea = $container.querySelector('.list-item_1');

  const init = function () {
    // Window
    ww = window.innerWidth;
    wh = window.innerHeight;

    // Scene
    scene = new THREE.Scene();

    // Renderer
    renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#000', 0.0);
    renderer.setSize(ww, wh);
    $canvas = renderer.domElement;
    $container.appendChild($canvas);

    // Camera
    camera = new THREE.PerspectiveCamera(70, ww / wh, 1, 999);
    camera.position.set(0, 0, 2);
    scene.add(camera);

    // Light
    light = new THREE.AmbientLight('#fff', 1);
    scene.add(light);

    // Controls
    if (DEBUG) {
      controls = new OrbitControls(camera, $canvas);
      controls.addEventListener('change', renderRequest);
    }

    // Clock
    clock = new THREE.Clock();

    // Loader
    textureLoader = new THREE.TextureLoader();

    // Setting
    setModels();

    // Render
    renderRequest();
    render();

    // Loading
    THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      if (itemsLoaded === itemsTotal) {
        setEvent();
        render();
      }
    };
  };

  const resize = function () {
    ww = window.innerWidth;
    wh = window.innerHeight;

    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();

    renderer.setSize(ww, wh);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    renderRequest();
  };

  // Setting -------------------
  let dGeometry, dMaterial, dMesh;
  let meshSize, meshHeight, meshWidth;
  let row = 3;
  const setModels = function () {
    // default geometry, material
    dGeometry = new THREE.PlaneGeometry(1.8, 1, 512, 512);
    dMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        u_texture: { type: 'f', value: null },
        u_resolution: { type: 'v2', value: new THREE.Vector2(ww, wh) },
        u_time: { type: 'f', value: 0 },
        u_scroll: { type: 'f', value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // plane meshes 만들기
    for (let i = 0; i < works.length; i++) {
      const material = dMaterial.clone();
      const texture = textureLoader.load(works[i].image);
      material.uniforms.u_texture.value = texture;

      const mesh = new THREE.Mesh(dGeometry, material);

      scene.add(mesh);
      works[i].mesh = mesh;
      works[i].material = material;
    }
    dMesh = works[0].mesh;

    // default mesh 사이즈 구하기
    meshSize = new THREE.Box3().setFromObject(dMesh);
    meshHeight = meshSize.max.y - meshSize.min.y;
    meshWidth = meshSize.max.x - meshSize.min.x;

    // plane meshes scale 값 정하기
    const containerRect = $container.getBoundingClientRect();
    const targetRect = $meshArea.getBoundingClientRect();
    const scale = targetRect.height / containerRect.height;

    const targetMargin = 30;
    const marginValue = getWorldPosition(60, 100);

    // camera fov, viewOffset 변경
    changeCameraFov(camera, dMesh);
    changeSizingViewOffset(targetRect, ww, wh);

    // plane meshes 위치, 스케일 정하기
    for (let i = 0; i < works.length; i++) {
      const item = works[i].mesh;

      item.position.x = (meshWidth + marginValue.x) * scale * (i % row);
      item.position.y = -(meshHeight + meshHeight) * scale * Math.floor(i / row);

      item.scale.set(scale, scale, scale);
    }
  };

  const setEvent = function () {
    window.addEventListener('scroll', scroll);
  };

  // Scroll -----------------
  const scroll = function (e) {
    // const scrollWorldValue = getWorldPosition(0, window.scrollY).y / 5;
    for (let i = 0; i < works.length; i++) {
      works[i].material.uniforms.u_scroll.value = window.scrollY;
    }
    const targetRect = $meshArea.getBoundingClientRect();
    changeSizingViewOffset(targetRect, ww, wh);
  };

  // Change -----------------
  const changeCameraFov = function (camera, targetMesh) {
    const meshSize = new THREE.Box3().setFromObject(targetMesh);
    const meshHeight = meshSize.max.y - meshSize.min.y;
    const meshWidth = meshSize.max.x - meshSize.min.x;

    const cameraDistanceFromMesh = camera.position.distanceTo(targetMesh.position);

    camera.fov = 2 * (180 / Math.PI) * Math.atan(meshHeight / (2 * cameraDistanceFromMesh));
    camera.updateProjectionMatrix();
  };

  const changeSizingViewOffset = function (targetRect, ww, wh) {
    console.log(targetRect);
    camera.setViewOffset(
      //
      ww,
      wh,
      ww / 2 - targetRect.width / 2 - (targetRect.left - 0),
      wh / 2 - targetRect.height / 2 - (targetRect.top - 0),
      ww,
      wh,
    );
  };

  // Get --------------------
  const getWorldPosition = function (px, py) {
    const localPoint = new THREE.Vector3(px / 256, py / 256, 0.5);
    const worldPoint = new THREE.Object3D().localToWorld(localPoint);

    return worldPoint;
  };

  // Render -------------------
  const renderRequest = function () {
    isRequestRender = true;
  };

  let elapsedTime = 0;
  const render = function () {
    elapsedTime = clock.getElapsedTime();
    // dMaterial.uniforms.u_time.value = elapsedTime;
    // console.log(elapsedTime);

    for (let i = 0; i < works.length; i++) {
      works[i].material.uniforms.u_time.value = elapsedTime;
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
  };

  window.addEventListener('load', init);
  window.addEventListener('resize', resize);

  // -------- 함수들
  // const getWorldPositionFromScreenPosition = (function () {
  //   const vector = new THREE.Vector3();
  //   const position = new THREE.Vector3();
  //   return (x, y) => {
  //     vector.set((x / ww) * 2 - 1, -(y / wh) * 2 + 1, 0.5);
  //     vector.unproject(camera);
  //     vector.sub(camera.position).normalize();
  //     position.copy(camera.position).add(vector.multiplyScalar(-camera.position.z / vector.z));
  //     return new THREE.Vector3().copy(position);
  //   };
  // })();
};
App();
