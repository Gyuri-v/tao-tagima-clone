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
  const hoveredMeshes = [];
  let hoverScale = 1.25;
  let row = 3;

  const parameters = {
    fitMeshScale: 0,
    initScrollTop: 0,
    imageRatio: { width: 1, height: 1 },
    hoverScale: 1.25,
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

    initScrollTop = scrollY;
  };

  // Setting -------------------
  const setListStyle = function () {
    for (let i = 0; i < $listNodes.length; i++) {
      const valueY = i % row == 1 ? -40 : i % row == 2 ? -17 : 0;

      $listNodes[i].style.transform = `translate3d(0, ${valueY}px, 0)`;
      meshes[i].position.y = meshes[i].savePosition.y - valueY / wh;
      meshes[i].savePosition.y = meshes[i].position.y;
    }
    // console.log($listNodes[0]);
    // $listNodes[0].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[1].style.transform = `matrix(1, 0, 0, 1, 0, ${scrollY * -0.3 - 15})`;
    // $listNodes[2].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[3].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[4].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[5].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[6].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
    // $listNodes[7].style.transform = `matrix(1, 0, 0, 1, 0, ${0})`;
  };

  // const setList = function () {
  //   for (let i = 0; i < works.length; i++) {
  //     const item = works[i];

  //     const list = document.createElement('div');
  //     list.classList.add('list-item');

  //     let listInner = '';
  //     listInner += `<span class="num">${i}</span>`;
  //     listInner += `<div class="image-wrap">`;
  //     listInner += `  <img src="${item.image}" alt="" />`;
  //     listInner += `</div>`;
  //     listInner += `<div class="text-wrap">`;
  //     listInner += `  <strong class="title">${item.name}</strong>`;
  //     listInner += `</div>`;

  //     list.innerHTML = listInner;

  //     $listWrap.appendChild(list);
  //     item.listNode = list;
  //   }

  //   $meshArea = works[0].listNode.querySelector('img');
  // };

  const setModels = function () {
    let dGeometry, dMaterial, dMesh;
    let meshSize, meshHeight, meshWidth;

    // default geometry, material
    dGeometry = new THREE.PlaneGeometry(imageRatio.width, imageRatio.height, 50, 50);
    dMaterial = new THREE.ShaderMaterial({
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
    const targetRect = $meshArea.getBoundingClientRect();
    meshScale = targetRect.height / wh;

    const marginValue = {
      x: 60 / 183, // meshHeight = 183px = three 1 이니까 60/183으로 일단 비율  ----------------- 계산 구하기!!!!!!!!!!!!!!
      y: meshHeight,
    };

    // camera fov, viewOffset 변경
    changeCameraFov(camera, dMesh, meshSize);
    changeSizingViewOffset(targetRect, ww, wh);

    // plane meshes 위치, 스케일 정하기
    for (let i = 0; i < works.length; i++) {
      const item = works[i].mesh;

      item.position.x = (meshWidth + marginValue.x) * meshScale * (i % row);
      item.position.y = -(meshHeight + meshHeight) * meshScale * Math.floor(i / row);
      // if (i === 1) {
      //   item.position.y = -(meshHeight + meshHeight) * meshScale * Math.floor(i / row) - (scrollY * -0.3 - 15) / wh;
      // }
      item.savePosition = item.position.clone();

      item.scale.set(meshScale, meshScale, meshScale);
    }
  };

  const setEvent = function () {
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouseMove);
    // $listNodes.forEach(function (node, index) {
    //   node.index = index;
    //   node.addEventListener('mouseenter', onMouseEnterList);
    //   node.addEventListener('mouseleave', onMouseLeaveList);
    // });
  };

  // Mouse
  // const onMouseEnterList = function (e) {
  //   currentHoverIndex = e.target.index;
  // };
  // const onMouseLeaveList = function (e) {
  //   currentHoverIndex = null;
  // };

  const onMouseMove = function (e) {
    pointer.x = (e.clientX / ww) * 2 - 1;
    pointer.y = -(e.clientY / wh) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersected = raycaster.intersectObjects(meshes);
    if (intersected[0]) {
      const plane = intersected[0].object;
      const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
      const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
      const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;
      const planePogressUniform = plane.material.uniforms.u_progress;

      // console.log(plane);

      if (currentHoverMesh !== plane) {
        currentHoverMesh = plane;
        hoveredMeshes.push(plane);
      }

      // ----------- 이건 뭘까..
      // if (!planeHoverUniformValue.z) {
      //   planeHoverUniformValue.x = intersected[0].uv.x;
      //   planeHoverUniformValue.y = intersected[0].uv.y;
      // }
      /// ----------

      // hover x move
      const positionXGap = plane.position.x - intersected[0].point.x;
      // hover x move -- 1. mesh 움직이기 -- / 6 정도가 적당
      // plane.position.x = plane.savePosition.x + positionXGap;
      // hover x move -- 2. vertex 로 하기
      // planeHoverXgapUniform.value = positionXGap;
      plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
      plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.35, { value: positionXGap, ease: 'cubic.out' });

      // hover wave
      plane.userData.hoverTween && plane.userData.hoverTween.kill();
      plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.75, { x: intersected[0].uv.x, y: intersected[0].uv.y, z: 1, ease: 'cubic.out' });

      // hoverScale -- 1. plane 의 scale 을 키우는 방법
      // plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
      // plane.userData.hoverScaleTween = gsap.to(plane.scale, 0.5, { x: hoverScale * meshScale, y: hoverScale * meshScale, z: hoverScale * meshScale, ease: 'cubic.out' });
      // hoverScale -- 2. vertex shader 로 보내는 방법
      plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
      plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: hoverScale, ease: 'cubic.out' });

      // hover texture animation
      plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
      plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 2, { value: 1, ease: 'cubic.out' });
    } else {
      currentHoverMesh = null;
    }

    if (hoveredMeshes.length > 0) {
      for (let i = 0; i < hoveredMeshes.length; i++) {
        const plane = hoveredMeshes[i];
        const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
        const planeHoverScaleUniform = plane.material.uniforms.u_hoverScale;
        const planeHoverXgapUniform = plane.material.uniforms.u_hoverXGap;
        const planePogressUniform = plane.material.uniforms.u_progress;

        if (plane == currentHoverMesh) return;

        // hover x move
        // plane.position.x = plane.savePosition.x;
        // planeHoverXgapUniform.value = 0;
        plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
        plane.userData.hoverXgapTween = gsap.to(planeHoverXgapUniform, 0.35, { value: 0, ease: 'cubic.out' });

        // hover wave
        plane.userData.hoverTween && plane.userData.hoverTween.kill();
        plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.35, { x: 0, y: 0, z: 0, ease: 'cubic.out' });

        // hoverScale -- plane 의 scale 을 키우는 방법
        // plane.userData.hoverScaleTween.kill();
        // plane.userData.hoverScaleTween = gsap.to(plane.scale, 0.5, { x: 1 * meshScale, y: 1 * meshScale, z: 1 * meshScale, ease: 'cubic.out' });

        // hoverScale -- vertex shader 로 보내는 방법
        plane.userData.hoverScaleTween && plane.userData.hoverScaleTween.kill();
        plane.userData.hoverScaleTween = gsap.to(planeHoverScaleUniform, 0.5, { value: 1, ease: 'cubic.out' });

        // hover texture animation
        plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
        plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 1, { value: 0, ease: 'cubic.out' });

        hoveredMeshes.shift();
      }
    }
  };

  // Scroll -----------------
  const onScroll = function (e) {
    // const scrollRatio = scrollY / wh / meshScale;
    let scrollRatio = (scrollY - initScrollTop) / wh;

    for (let i = 0; i < works.length; i++) {
      // if (i === 1) {
      //   let scrollRatio = ((scrollY * -0.3 - 15) / wh - initScrollTop) / wh;
      //   works[i].mesh.position.y = works[i].mesh.savePosition.y + scrollRatio;
      // } else {
      //   let scrollRatio = (scrollY - initScrollTop) / wh;
      //   works[i].mesh.position.y = works[i].mesh.savePosition.y + scrollRatio;
      // }\
      // works[i].material.uniforms.u_scroll.value = scrollRatio;

      // let translateValue = (i % 2) * 0.1 + 0.1;
      // if (i < 3) translateValue *= 5;
      // console.log(translateValue);

      works[i].mesh.position.y = works[i].mesh.savePosition.y + scrollRatio;
      // $listNodes[i].style.transform = `translate3d(0px, ${-scrollY * translateValue}px, 0px)`;
      // works[i].mesh.position.y = works[i].mesh.savePosition.y + scrollRatio + scrollRatio * translateValue;
    }
  };

  // Change -----------------
  const changeCameraFov = function (camera, targetMesh, meshSize) {
    const meshHeight = meshSize.max.y - meshSize.min.y;

    let cameraDistanceFromMesh = camera.position.distanceTo(targetMesh.position);

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

  // Render -------------------
  const render = function (time, deltaTime) {
    // console.log(works[7].material.uniforms.u_hoverXGap.value);
    // console.log(works[7].material.uniforms.u_uvRate.value);
    // console.log(works[7].material.uniforms.u_resolution.value);
    // console.log(works[7].material.uniforms.u_hoverScale.value);
    // for (let i = 0; i < works.length; i++) {
    //   works[i].material.uniforms.u_time.value += deltaTime * 0.0001;
    // }
    works[0].material.uniforms.u_time.value += deltaTime * 0.0001;

    renderer.render(scene, camera);
  };

  window.addEventListener('load', init);
  window.addEventListener('resize', resize);
};
App();
