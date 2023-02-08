import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

const DEBUG = location.search.indexOf('debug') > -1;

const App = function () {
  let ww, wh;
  let renderer, scene, camera, light, controls, textureLoader, clock, raycaster;
  let pointer = new THREE.Vector2();
  let meshes = [];
  let meshScale;
  let initScrollTop;

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
    camera = new THREE.PerspectiveCamera(45, ww / wh, 1, 1000);
    camera.position.set(0, 0, 2);
    scene.add(camera);

    // Light
    light = new THREE.AmbientLight('#fff', 1);
    scene.add(light);

    // Controls
    if (DEBUG) {
      controls = new OrbitControls(camera, $canvas);
    }

    // Clock
    clock = new THREE.Clock();

    // Loader
    textureLoader = new THREE.TextureLoader();

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Setting
    setModels();

    // Loading
    THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      if (itemsLoaded === itemsTotal) {
        setEvent();
        gsap.ticker.add(render);
      }
    };

    // Value
    initScrollTop = scrollY;
  };

  const resize = function () {
    ww = window.innerWidth;
    wh = window.innerHeight;

    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();

    renderer.setSize(ww, wh);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    initScrollTop = scrollY;
  };

  // Setting -------------------
  const setModels = function () {
    let dGeometry, dMaterial, dMesh;
    let meshSize, meshHeight, meshWidth;
    let row = 3;

    // default geometry, material
    dGeometry = new THREE.PlaneGeometry(1.8, 1, 50, 50);
    dMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        u_texture: { type: 'f', value: null },
        u_time: { type: 'f', value: 0 },
        u_hover: { value: new THREE.Vector3() },

        // u_scroll: { type: 'f', value: 0 },
        // u_resolution: { type: 'v2', value: new THREE.Vector2(ww, wh) },
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
      meshes.push(mesh);
    }
    dMesh = works[0].mesh;

    // default mesh 사이즈 구하기
    meshSize = new THREE.Box3().setFromObject(dMesh);
    meshHeight = meshSize.max.y - meshSize.min.y;
    meshWidth = meshSize.max.x - meshSize.min.x;

    // plane meshes scale 값 정하기
    const containerRect = $container.getBoundingClientRect();
    const targetRect = $meshArea.getBoundingClientRect();
    meshScale = targetRect.height / containerRect.height;

    const targetMargin = 30;
    const marginValue = getWorldValue(60, 100);

    // camera fov, viewOffset 변경
    changeCameraFov(camera, dMesh);
    changeSizingViewOffset(targetRect, ww, wh);

    // plane meshes 위치, 스케일 정하기
    for (let i = 0; i < works.length; i++) {
      const item = works[i].mesh;

      item.position.x = (meshWidth + marginValue.x) * meshScale * (i % row);
      item.position.y = -(meshHeight + meshHeight) * meshScale * Math.floor(i / row);
      works[i].positionY = item.position.y;

      item.scale.set(meshScale, meshScale, meshScale);
    }
  };

  const setEvent = function () {
    window.addEventListener('scroll', onScroll);
    $canvas.addEventListener('mousemove', onMouseMove);

    // onScroll();
  };

  // Mouse
  let pointerTween;
  let pointerValue = new THREE.Vector3();
  let currentHoverMesh = null;
  const hoverMeshes = [];

  const onMouseMove = function (e) {
    pointer.x = (e.clientX / ww) * 2 - 1;
    pointer.y = -(e.clientY / wh) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersected = raycaster.intersectObjects(meshes);
    if (intersected[0]) {
      const plane = intersected[0].object;
      const planeHoverUniform = plane.material.uniforms.u_hover.value;
      hoverMeshes.push(plane);

      // ----------- 이건 뭘까..
      if (!planeHoverUniform.z) {
        planeHoverUniform.x = intersected[0].uv.x;
        planeHoverUniform.y = intersected[0].uv.y;
      }

      plane.userData.hoverTween && plane.userData.hoverTween.kill();
      plane.userData.hoverTween = gsap.to(planeHoverUniform, 0.75, {
        x: intersected[0].uv.x,
        y: intersected[0].uv.y,
        z: 1,
        ease: 'cubic.out',
      });
    } else {
      if (hoverMeshes.length > 0) {
        for (let i = 0; i < hoverMeshes.length; i++) {
          const plane = hoverMeshes[i];
          const planeHoverUniform = plane.material.uniforms.u_hover.value;
          plane.userData.hoverTween.kill();
          plane.userData.hoverTween = gsap.to(planeHoverUniform, 0.35, { z: 0, ease: 'cubic.out' });
        }
      }
    }
  };

  // Scroll -----------------
  const onScroll = function (e) {
    // const scrollRatio = scrollY / wh / meshScale;
    const scrollRatio = (scrollY - initScrollTop) / wh;

    for (let i = 0; i < works.length; i++) {
      // works[i].material.uniforms.u_scroll.value = scrollRatio;
      works[i].mesh.position.y = works[i].positionY + scrollRatio;
    }
  };

  // Change -----------------
  const changeCameraFov = function (camera, targetMesh) {
    const meshSize = new THREE.Box3().setFromObject(targetMesh);
    const meshHeight = meshSize.max.y - meshSize.min.y;

    const cameraDistanceFromMesh = camera.position.distanceTo(targetMesh.position);

    camera.fov = 2 * (180 / Math.PI) * Math.atan(meshHeight / (2 * cameraDistanceFromMesh));
    camera.updateProjectionMatrix();
  };

  const changeSizingViewOffset = function (targetRect, ww, wh) {
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
  const getWorldValue = function (px, py) {
    const localPoint = new THREE.Vector3(px / 256, py / 256, 0.5);
    const worldPoint = new THREE.Object3D().localToWorld(localPoint);

    return worldPoint;
  };

  // Render -------------------
  const render = function (time, deltaTime) {
    // for (let i = 0; i < works.length; i++) {
    //   works[i].material.uniforms.u_time.value += deltaTime * 0.0001;
    // }
    works[0].material.uniforms.u_time.value += deltaTime * 0.0001;

    renderer.render(scene, camera);
  };

  window.addEventListener('load', init);
  window.addEventListener('resize', resize);

  // -------- 함수들
  const getWorldPositionFromScreenPosition = (function () {
    const vector = new THREE.Vector3();
    const position = new THREE.Vector3();
    return (x, y) => {
      vector.set((x / ww) * 2 - 1, -(y / wh) * 2 + 1, 0.5);
      vector.unproject(camera);
      vector.sub(camera.position).normalize();
      position.copy(camera.position).add(vector.multiplyScalar(-camera.position.z / vector.z));
      return new THREE.Vector3().copy(position);
    };
  })();
};
App();
