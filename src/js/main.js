import * as THREE from 'three';
import { gsap } from 'gsap';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

const DEBUG = location.search.indexOf('debug') > -1;

const App = function () {
  // Dom
  let $canvas;
  const $container = document.querySelector('.container');
  const $listWrap = $container.querySelector('.list-wrap');
  const $listNodes = $container.querySelectorAll('.list-item');
  const $meshArea = $container.querySelector('.list-item_1 img');

  let meshAreaRect = $meshArea.getBoundingClientRect();

  // Values
  let ww, wh;
  let renderer, scene, camera, light, textureLoader, raycaster;
  let pointer = new THREE.Vector2();
  let meshes = [];
  let meshScale;
  let initScrollTop;
  const imageRatio = { width: 1, height: 1 };

  let currentHoverMesh = null;
  let currentHoverIndex = null;
  const hoveredefaultMeshes = [];
  let hoverScale = 1.3;
  let row = 3;

  const parameters = {
    fitMeshScale: 0,
    initScrollTop: 0,
    imageRatio: { width: 1, height: 1 },
    hoverScale: 1.2,
  };

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

    // Loader
    textureLoader = new THREE.TextureLoader();

    // Raycaster
    raycaster = new THREE.Raycaster();

    // Value
    initScrollTop = scrollY;
    imageRatio.width = 1.777; ////////// ------------ 계산식 만들기

    // Setting
    setModels();

    // Loading
    THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      if (itemsLoaded === itemsTotal) {
        setListStyle();
        setEvent();
        gsap.ticker.add(render);
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

    meshAreaRect = $meshArea.getBoundingClientRect();
    changeSizingViewOffset(meshAreaRect, ww, wh);

    listItemMarginToWorldGap = { x: listItemMarginRight / meshAreaRect.height, y: meshHeight };

    meshScale = meshAreaRect.height / wh;
    for (let i = 0; i < meshes.length; i++) {
      const item = meshes[i];

      item.position.x = (meshWidth + listItemMarginToWorldGap.x) * meshScale * (i % row);
      item.position.y = -(meshHeight + meshHeight) * meshScale * Math.floor(i / row);
      item.c_savePosition = item.position.clone();

      item.scale.set(meshScale, meshScale, meshScale);
    }

    setListStyle();

    initScrollTop = scrollY;
  };

  // Setting -------------------
  const setListStyle = function () {
    for (let i = 0; i < $listNodes.length; i++) {
      const valueY = i % row == 1 ? -40 : i % row == 2 ? -17 : 0;

      $listNodes[i].style.transform = `translate3d(0, ${valueY}px, 0)`;
      meshes[i].position.y = meshes[i].c_savePosition.y - valueY / wh;
      meshes[i].c_savePosition.y = meshes[i].position.y;
      // meshes[i].defaultY = valueY;
    }
  };

  let meshSize, meshHeight, meshWidth;
  let defalutGeometry, defalutMaterial, defaultMesh;
  let listItemMarginRight, listItemMarginToWorldGap;
  const setModels = function () {
    // default geometry, material
    defalutGeometry = new THREE.PlaneGeometry(imageRatio.width, imageRatio.height, 30, 30);
    defalutMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        u_accel: { type: 'v2', value: new THREE.Vector2(0.5, 2) },
        u_resolution: { type: 'v2', value: new THREE.Vector2(ww, wh) },
        u_progress: { type: 'f', value: 0 },
        u_texture: { type: 'f', value: null },
        u_time: { type: 'f', value: 0 },
        u_hover: { type: 'v3', value: new THREE.Vector3() },
        u_hoverScale: { type: 'f', value: 1 },
        u_hoverXGap: { type: 'f', value: 0 },
        u_uvRate: { type: 'v2', value: new THREE.Vector2(1, 1) },
        u_opacity: { type: 'f', value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    // plane meshes 만들기
    for (let i = 0; i < works.length; i++) {
      const material = defalutMaterial.clone();
      const texture = textureLoader.load(works[i].image);
      material.uniforms.u_texture.value = texture;

      const mesh = new THREE.Mesh(defalutGeometry, material);
      mesh.index = i;

      works[i].material = material;
      scene.add(mesh);
      meshes.push(mesh);
    }
    defaultMesh = meshes[0];

    // default mesh 사이즈 구하기
    meshSize = new THREE.Box3().setFromObject(defaultMesh);
    meshHeight = meshSize.max.y - meshSize.min.y;
    meshWidth = meshSize.max.x - meshSize.min.x;

    // plane meshes scale 값 정하기
    meshScale = meshAreaRect.height / wh;

    listItemMarginRight = window.getComputedStyle($listNodes[0]).marginRight.split('px')[0];
    listItemMarginToWorldGap = { x: listItemMarginRight / meshAreaRect.height, y: meshHeight };

    // camera fov, viewOffset 변경
    changeCameraFov(camera, defaultMesh, meshSize);
    changeSizingViewOffset(meshAreaRect, ww, wh);

    // plane meshes 위치, 스케일 정하기
    for (let i = 0; i < meshes.length; i++) {
      const item = meshes[i];

      item.position.x = (meshWidth + listItemMarginToWorldGap.x) * meshScale * (i % row);
      item.position.y = -(meshHeight + meshHeight) * meshScale * Math.floor(i / row);
      item.c_savePosition = item.position.clone();

      item.scale.set(meshScale, meshScale, meshScale);
    }
  };

  const setEvent = function () {
    window.addEventListener('scroll', onScroll);

    $listNodes.forEach(function (item, index) {
      item.addEventListener('mouseenter', (e) => onMouseEnterList(e, index, item));
    });
  };

  // Event - ListItem 들에 대한
  const onMouseEnterList = function (e, index, item) {
    const plane = meshes[index];
    const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    item.addEventListener('mousemove', (e) => onMouseMoveList(e, index, item));
    item.addEventListener('mouseleave', (e) => onMouseLeaveList(e, index, item));

    if (currentHoverMesh !== plane) {
      currentHoverMesh = plane;
      hoveredefaultMeshes.push(plane);

      planeOpacityUniform.value = 1;
    }

    // hoverScale
    plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
    plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: hoverScale, ease: 'cubic.out' });

    // hover texture animation
    plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
    plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 2, { value: 1, ease: 'cubic.out' });
  };

  const onMouseMoveList = function (e, index) {
    const plane = meshes[index];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;

    pointer.x = (e.clientX / ww) * 2 - 1;
    pointer.y = -(e.clientY / wh) * 2 + 1;

    // hover wave
    raycaster.setFromCamera(pointer, camera);
    const intersected = raycaster.intersectObjects([plane]);

    if (intersected[0]) {
      plane.userData.hoverTween && plane.userData.hoverTween.kill();
      plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.75, { x: intersected[0].uv.x, y: intersected[0].uv.y, z: 1, ease: 'cubic.out' });

      // hover x move
      const positionXGap = plane.position.x - intersected[0].point.x;
      plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
      plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.2, { value: positionXGap, ease: 'cubic.out' });
    }
  };

  const onMouseLeaveList = function (e, index, item) {
    const plane = meshes[index];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
    const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    // hover x move
    plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
    plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.35, { value: 0, ease: 'cubic.out' });

    // hover wave
    plane.userData.hoverTween && plane.userData.hoverTween.kill();
    plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.35, { x: 0, y: 0, z: 0, ease: 'cubic.out' });

    // hoverScale
    plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
    plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: 1, ease: 'cubic.out' });

    // hover texture animation
    plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
    plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 1, {
      value: 0,
      ease: 'cubic.out',
      onComplete: function () {
        planeOpacityUniform.value = 0;
      },
    });

    item.removeEventListener('mousemove', (e) => onMouseMoveList(e, index));
    item.removeEventListener('mouseleave', (e) => onMouseLeaveList(e, index));
  };

  // Scroll -----------------
  const onScroll = function (e) {
    let scrollRatio = (scrollY - initScrollTop) / wh;

    for (let i = 0; i < meshes.length; i++) {
      meshes[i].position.y = meshes[i].c_savePosition.y + scrollRatio;
    }
  };

  // Change -----------------
  const changeCameraFov = function (camera, targetMesh, meshSize) {
    const meshHeight = meshSize.max.y - meshSize.min.y;

    let cameraDistanceFromMesh = camera.position.distanceTo(targetMesh.position);

    camera.fov = 2 * (180 / Math.PI) * Math.atan(meshHeight / (2 * cameraDistanceFromMesh));
    camera.updateProjectionMatrix();
  };

  const changeSizingViewOffset = function (meshAreaRect, ww, wh) {
    camera.setViewOffset(
      //
      ww,
      wh,
      ww / 2 - meshAreaRect.width / 2 - (meshAreaRect.left - 0),
      wh / 2 - meshAreaRect.height / 2 - (meshAreaRect.top - 0),
      ww,
      wh,
    );
  };

  // Render -------------------
  const render = function (time, deltaTime) {
    works[0].material.uniforms.u_time.value += deltaTime * 0.0001;

    renderer.render(scene, camera);
  };

  window.addEventListener('load', init);
  window.addEventListener('resize', resize);
};
App();
