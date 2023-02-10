import * as THREE from 'three';
import { gsap } from 'gsap';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

const DEBUG = location.search.indexOf('debug') > -1;

const App = function () {
  // Dom
  let $canvas;
  const $container = document.querySelector('.container');
  const $content = $container.querySelector('.content');
  const $listWrap = $container.querySelector('.list-wrap');
  const $listNodes = $container.querySelectorAll('.list-item');
  const $meshArea = $container.querySelector('.list-item_1 img');
  const $btnMenuTrigger = $container.querySelector('.menu-trigger .btn-menu');

  let meshAreaRect = $meshArea.getBoundingClientRect();

  // Values
  let ww, wh;
  let renderer, scene, camera, light, textureLoader, raycaster;
  let pointer = new THREE.Vector2();

  let meshSize, meshHeight, meshWidth;
  let defalutGeometry, defalutMaterial, defaultMesh;
  let listItemMarginRight, listItemMarginToWorldGap;

  const parameters = {
    imageRatio: { width: 1, height: 1 },
    fitMeshScale: 0,
    fitViewportScale: 0,
    initScrollTop: 0,
    hoverScale: 1.5,
    listRow: 3,
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

  const meshes = [];
  const hoveredMeshes = [];
  let currentHoverMesh = null;
  let currentClickMesh = null;

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
    parameters.initScrollTop = scrollY;
    parameters.imageRatio.width = 1.777; ////////// ------------ 계산식 만들기

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

    parameters.fitMeshScale = meshAreaRect.height / wh;
    for (let i = 0; i < meshes.length; i++) {
      const item = meshes[i];

      item.position.x = (meshWidth + listItemMarginToWorldGap.x) * parameters.fitMeshScale * (i % parameters.listRow);
      item.position.y = -(meshHeight + meshHeight) * parameters.fitMeshScale * Math.floor(i / parameters.listRow);
      item.c_savePosition = item.position.clone();

      item.scale.set(parameters.fitMeshScale, parameters.fitMeshScale, parameters.fitMeshScale);
    }

    setListStyle();

    parameters.initScrollTop = scrollY;
  };

  // Setting -------------------
  const setListStyle = function () {
    for (let i = 0; i < $listNodes.length; i++) {
      const valueY = i % parameters.listRow == 1 ? -40 : i % parameters.listRow == 2 ? -17 : 0;

      $listNodes[i].style.transform = `translate3d(0, ${valueY}px, 0)`;
      meshes[i].position.y = meshes[i].c_savePosition.y - valueY / wh;
      meshes[i].c_savePosition.y = meshes[i].position.y;
      // meshes[i].defaultY = valueY;
    }
  };

  const setModels = function () {
    // default geometry, material
    defalutGeometry = new THREE.PlaneGeometry(parameters.imageRatio.width, parameters.imageRatio.height, 30, 30);
    defalutMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      uniforms: {
        u_accel: { value: new THREE.Vector2(0.5, 2) },
        u_resolution: { value: new THREE.Vector2(ww, wh) },
        u_progress: { value: 0 },
        u_texture: { value: null },
        u_time: { value: 0 },
        u_hover: { value: new THREE.Vector3() },
        u_hoverScale: { value: 1 },
        u_hoverXGap: { value: 0 },
        u_uvRate: { value: new THREE.Vector2(parameters.imageRatio.width, 1) },
        u_opacity: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    // plane meshes 만들기
    for (let i = 0; i < works.length; i++) {
      const material = defalutMaterial.clone();
      works[i].material = material;

      const texture = textureLoader.load(works[i].image);
      material.uniforms.u_texture.value = texture;
      works[i].texture = texture;

      const mesh = new THREE.Mesh(defalutGeometry, material);
      mesh.index = i;

      scene.add(mesh);
      meshes.push(mesh);
    }
    defaultMesh = meshes[0];

    // default mesh 사이즈 구하기
    meshSize = new THREE.Box3().setFromObject(defaultMesh);
    meshHeight = meshSize.max.y - meshSize.min.y;
    meshWidth = meshSize.max.x - meshSize.min.x;

    // plane meshes scale 값 정하기
    parameters.fitMeshScale = meshAreaRect.height / wh;
    parameters.fitViewportScale = 1 / parameters.fitMeshScale;

    listItemMarginRight = window.getComputedStyle($listNodes[0]).marginRight.split('px')[0];
    listItemMarginToWorldGap = { x: listItemMarginRight / meshAreaRect.height, y: meshHeight };

    // camera fov, viewOffset 변경
    changeCameraFov(camera, defaultMesh, meshSize);
    changeSizingViewOffset(meshAreaRect, ww, wh);

    // plane meshes 위치, 스케일 정하기
    for (let i = 0; i < meshes.length; i++) {
      const item = meshes[i];

      item.position.x = (meshWidth + listItemMarginToWorldGap.x) * parameters.fitMeshScale * (i % parameters.listRow);
      item.position.y = -(meshHeight + meshHeight) * parameters.fitMeshScale * Math.floor(i / parameters.listRow);
      item.c_savePosition = item.position.clone();

      item.scale.set(parameters.fitMeshScale, parameters.fitMeshScale, parameters.fitMeshScale);
    }
  };

  const setEvent = function () {
    window.addEventListener('scroll', onScroll);

    $listNodes.forEach(function (item, index) {
      item.addEventListener('mouseenter', onMouseEnterList);
    });

    $btnMenuTrigger.addEventListener('click', onClickMenuTrigger);
  };

  // Menu Trigger 클릭
  const onClickMenuTrigger = function () {
    if (currentClickMesh) {
      const targetIndex = currentClickMesh.index;

      const plane = meshes[targetIndex];
      const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
      const planePogressUniform = plane.material.uniforms.u_progress;
      const planeOpacityUniform = plane.material.uniforms.u_opacity;

      // renderOrder
      plane.renderOrder = 0;

      // hoverScale
      plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
      plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: 1, ease: 'cubic.out' });

      // hover texture animation
      plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
      plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 1, {
        value: 0,
        ease: 'cubic.out',
        onComplete: function () {
          // opacity
          planeOpacityUniform.value = 0;

          // curren hover mesh
          currentHoverMesh = null;
        },
      });

      // content
      $content.style.visibility = 'inherit';
      $content.style.opacity = 1;
    }
  };

  // Event - ListItem 들에 대한
  const onClickList = function (e) {
    const targetNode = e.target.tagName !== 'LI' ? e.target.closest('li') : e.target;
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = meshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
    const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;

    targetNode.removeEventListener('mousemove', onMouseMoveList);
    targetNode.removeEventListener('mouseleave', onMouseLeaveList);

    // curren click mesh
    currentClickMesh = plane;

    // hoverScale target
    plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
    plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.35, { value: parameters.fitViewportScale, ease: 'cubic.out' });

    // hover x move remove
    plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
    plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.35, { value: 0, ease: 'cubic.out' });

    // hover wave remove
    plane.userData.hoverTween && plane.userData.hoverTween.kill();
    plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.35, { x: 0, y: 0, z: 0, ease: 'cubic.out' });

    // renderorder, currenHoverMesh, opacity 은 유지

    // content
    $content.style.visibility = 'hidden';
    $content.style.opacity = 0;
  };

  const onMouseEnterList = function (e) {
    const targetNode = e.target.closest('li');
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = meshes[targetIndex];
    const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    if (currentHoverMesh !== plane) {
      // curren hover mesh
      currentHoverMesh = plane;
      hoveredMeshes.push(plane);

      // opacity
      planeOpacityUniform.value = 1;

      // render order
      plane.renderOrder = 2;
    }

    // hoverScale
    plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
    plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: parameters.hoverScale, ease: 'cubic.out' });

    // hover texture animation
    plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
    plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 2, { value: 1, ease: 'cubic.out' });

    targetNode.addEventListener('click', onClickList);
    targetNode.addEventListener('mousemove', onMouseMoveList);
    targetNode.addEventListener('mouseleave', onMouseLeaveList);
  };

  const onMouseMoveList = function (e) {
    const targetNode = e.target.tagName !== 'LI' ? e.target.closest('li') : e.target;
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = meshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;

    pointer.x = (e.clientX / ww) * 2 - 1;
    pointer.y = -(e.clientY / wh) * 2 + 1;

    // hover wave & x move
    raycaster.setFromCamera(pointer, camera);
    const intersected = raycaster.intersectObjects([plane]);

    if (intersected[0]) {
      // hover wave
      plane.userData.hoverTween && plane.userData.hoverTween.kill();
      plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.75, { x: intersected[0].uv.x, y: intersected[0].uv.y, z: 1, ease: 'cubic.out' });

      // hover x move
      const xMove = (plane.position.x - intersected[0].point.x) * parameters.fitViewportScale;
      const xGap = -(xMove - xMove * parameters.hoverScale);

      plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
      plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.2, { value: xGap, ease: 'cubic.out' });
    }
  };

  const onMouseLeaveList = function (e) {
    const targetNode = e.target.tagName !== 'LI' ? e.target.closest('li') : e.target;
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = meshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
    const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    // renderOrder
    plane.renderOrder = 0;

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
        // opacity
        planeOpacityUniform.value = 0;

        // curren hover mesh
        currentHoverMesh = null;
      },
    });

    targetNode.removeEventListener('mousemove', onMouseMoveList);
    targetNode.removeEventListener('mouseleave', onMouseLeaveList);
  };

  // Scroll -----------------
  const onScroll = function (e) {
    let scrollRatio = (scrollY - parameters.initScrollTop) / wh;

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
