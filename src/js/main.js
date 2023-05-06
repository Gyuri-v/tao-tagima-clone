import * as THREE from 'three';
import { gsap } from 'gsap';

import vertexShader from '../shader/vertex.glsl';
import fragmentShader from '../shader/fragment.glsl';

const DEBUG = location.search.indexOf('debug') > -1;

const App = function () {
  // Dom
  let $canvas;
  const $body = document.body;
  const $container = document.querySelector('.container');
  const $content = $container.querySelector('.content');
  const $listNodes = $container.querySelectorAll('.list-item');
  const $meshArea = $container.querySelector('.list-item_1 img');
  const $btnMenuTrigger = $container.querySelector('.menu-trigger .btn-menu');

  let meshAreaRect = $meshArea.getBoundingClientRect();

  // Values
  let ww, wh;
  let renderer, scene, camera, light, textureLoader, raycaster;
  let pointer = new THREE.Vector2();

  let defalutGeometry, defalutMaterial;
  let sceneUnit;
  let contentOpacityTween;

  const parameters = {
    imageRatio: { width: 1.777, height: 1 }, //////////////// 계산식 !!!!!!!!!!
    hoverScale: 1.3,
    listRow: 3,
  };
  const works = [
    {
      name: 'MN concept movie',
      image: 'resources/images/MN.jpeg',
      material: null,
    },
    {
      name: 'TELE-PLAY - prism',
      image: 'resources/images/prism.jpeg',
      material: null,
    },
    {
      name: 'CITIZEN - ATTESA',
      image: 'resources/images/ATTESA.jpeg',
      material: null,
    },
    {
      name: 'FUTURE FOOD TALK',
      image: 'resources/images/AJINOMOTO.jpeg',
      material: null,
    },
    {
      name: 'MN concept movie',
      image: 'resources/images/MN.jpeg',
      material: null,
    },
    {
      name: 'TELE-PLAY - prism',
      image: 'resources/images/prism.jpeg',
      material: null,
    },
    {
      name: 'CITIZEN - ATTESA',
      image: 'resources/images/ATTESA.jpeg',
      material: null,
    },
    {
      name: 'FUTURE FOOD TALK',
      image: 'resources/images/AJINOMOTO.jpeg',
      material: null,
    },
    {
      name: 'MN concept movie',
      image: 'resources/images/MN.jpeg',
      material: null,
    },
    {
      name: 'TELE-PLAY - prism',
      image: 'resources/images/prism.jpeg',
      material: null,
    },
    {
      name: 'CITIZEN - ATTESA',
      image: 'resources/images/ATTESA.jpeg',
      material: null,
    },
    {
      name: 'FUTURE FOOD TALK',
      image: 'resources/images/AJINOMOTO.jpeg',
      material: null,
    },
  ];

  const listMeshes = [];
  const hoveredlistMeshes = [];
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

    // Setting
    setListStyle();
    setModels();

    // Loading
    THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      if (itemsLoaded === itemsTotal) {
        setEvent();
        onScroll();
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

    setSyncListItems();
  };

  // Setting -------------------
  const setListStyle = function () {
    for (let i = 0; i < $listNodes.length; i++) {
      const valueY = i % parameters.listRow == 1 ? -40 : i % parameters.listRow == 2 ? -17 : 0;
      $listNodes[i].style.transform = `translate3d(0, ${valueY}px, 0)`;
    }
  };

  const shaderUniforms = {
    u_accel: { value: new THREE.Vector2(0.5, 2) },
    u_uvRate: { value: new THREE.Vector2(parameters.imageRatio.width, 1) },
    u_time: { value: 0 },
  };

  const setModels = function () {
    // default geometry, material
    defalutGeometry = new THREE.PlaneGeometry(1, 1, 30, 30);
    defalutMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      uniforms: Object.assign(
        {
          u_resolution: { value: new THREE.Vector2(ww, wh) },
          u_progress: { value: 0 },
          u_texture: { value: null },
          u_hover: { value: new THREE.Vector3() },
          u_hoverScale: { value: 1 },
          u_hoverXGap: { value: 0 },
          u_clickProgress: { value: 0 },
          u_opacity: { value: 0 },
        },
        shaderUniforms,
      ),
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // wireframe: true,
    });

    // plane listMeshes 만들기
    for (let i = 0; i < works.length; i++) {
      const material = defalutMaterial.clone();
      works[i].material = material;
      works[i].material.uniforms.u_time = shaderUniforms.u_time;

      const texture = textureLoader.load(works[i].image);
      material.uniforms.u_texture.value = texture;
      works[i].texture = texture;

      const mesh = new THREE.Mesh(defalutGeometry, material);
      mesh.index = i;

      scene.add(mesh);
      listMeshes.push(mesh);
    }

    // 리스트 sync
    setSyncListItems();
  };

  const setSyncListItems = function () {
    sceneUnit = 2 * (camera.position.z - listMeshes[0].position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    sceneUnit /= wh;

    const scrollTop = window.pageYOffset;
    listMeshes.forEach((plane, index) => {
      const rect = $listNodes[index].querySelector('img').getBoundingClientRect();

      plane.scale.set(rect.width * sceneUnit, rect.height * sceneUnit, 1);
      plane.position.x = (rect.left + rect.width / 2 - ww / 2) * sceneUnit;
      plane.position.y = -(rect.top + scrollTop + rect.height / 2 - wh / 2) * sceneUnit;

      plane.userData.offset = plane.position.clone();
      plane.userData.scale = plane.scale.clone();
    });
  };

  const setEvent = function () {
    window.addEventListener('scroll', onScroll);

    $listNodes.forEach(function (item, index) {
      item.addEventListener('mouseenter', onMouseEnterList);
    });

    $btnMenuTrigger.addEventListener('click', onClickMenuTrigger);
  };

  // Event -----------------
  const onMouseEnterList = function (e) {
    if (currentClickMesh) return;

    const targetNode = e.target.closest('li');
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = listMeshes[targetIndex];
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    if (currentHoverMesh !== plane) {
      // curren hover mesh
      currentHoverMesh = plane;
      hoveredlistMeshes.push(plane);

      // opacity
      planeOpacityUniform.value = 1;

      // render order
      plane.renderOrder = 2;
    }

    // hoverScale
    plane.userData.scaleTween && plane.userData.scaleTween.kill();
    plane.userData.scaleTween = gsap.to(plane.scale, 0.5, {
      x: parameters.hoverScale * plane.userData.scale.x,
      y: parameters.hoverScale * plane.userData.scale.y,
      ease: 'cubic.out',
    });

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

    const plane = listMeshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;

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
      const xMove = plane.userData.offset.x - intersected[0].point.x;
      const xGap = xMove * (parameters.hoverScale - 1);
      plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
      plane.userData.hoverXgapTween = gsap.to(plane.position, 0.2, { x: plane.userData.offset.x + xGap, ease: 'cubic.out' });
    }
  };

  const onMouseLeaveList = function (e) {
    const targetNode = e.target.tagName !== 'LI' ? e.target.closest('li') : e.target;
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = listMeshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planePogressUniform = plane.material.uniforms.u_progress;
    const planeOpacityUniform = plane.material.uniforms.u_opacity;

    // renderOrder
    plane.renderOrder = 0;

    // hover x move
    plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
    plane.userData.hoverXgapTween = gsap.to(plane.position, 0.2, { x: plane.userData.offset.x, ease: 'cubic.out' });

    // hover wave
    plane.userData.hoverTween && plane.userData.hoverTween.kill();
    plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.35, { x: 0, y: 0, z: 0, ease: 'cubic.out' });

    // hoverScale
    plane.userData.scaleTween && plane.userData.scaleTween.kill();
    plane.userData.scaleTween = gsap.to(plane.scale, 0.5, {
      x: plane.userData.scale.x,
      y: plane.userData.scale.y,
      ease: 'cubic.out',
    });

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

  const onClickList = function (e) {
    const targetNode = e.target.tagName !== 'LI' ? e.target.closest('li') : e.target;
    const parentNodes = [...targetNode.parentElement.children];
    const targetIndex = parentNodes.indexOf(targetNode);

    const plane = listMeshes[targetIndex];
    const planeHoverUniformValue = plane.material.uniforms.u_hover.value;
    const planeClickProgressUniform = plane.material.uniforms.u_clickProgress;

    targetNode.removeEventListener('mousemove', onMouseMoveList);
    targetNode.removeEventListener('mouseleave', onMouseLeaveList);

    // curren click mesh
    currentClickMesh = plane;

    // hoverScale target
    plane.userData.scaleTween && plane.userData.scaleTween.kill();
    plane.userData.scaleTween = gsap.to(plane.scale, 0.7, { x: wh * parameters.imageRatio.width * sceneUnit, y: wh * sceneUnit, delay: 0.2, ease: 'cubic.out' });

    // position tween
    plane.userData.positionTween && plane.userData.positionTween.kill();
    plane.userData.positionTween = gsap.to(plane.position, 0.7, { x: 0, y: 0, z: 0, delay: 0.2, ease: 'cubic.out' });

    // hover x move remove
    plane.userData.hoverXgapTween && plane.userData.hoverXgapTween.kill();
    plane.userData.hoverXgapTween = gsap.to(plane.position, 0.2, { x: plane.userData.offset.x, ease: 'cubic.out' });

    // hover wave remove
    plane.userData.hoverTween && plane.userData.hoverTween.kill();
    plane.userData.hoverTween = gsap.to(planeHoverUniformValue, 0.35, { x: 0, y: 0, z: 0, ease: 'cubic.out' });

    // click progress
    plane.userData.clickProgressTween && plane.userData.clickProgressTween.kill();
    plane.userData.clickProgressTween = gsap.to(planeClickProgressUniform, 1, { value: Math.PI * 0.1, ease: 'cubic.out' });

    // renderorder, currenHoverMesh, opacity 은 유지

    // content
    contentOpacityTween = gsap.to($content, 0.7, {
      opacity: 0,
      ease: 'cubic.out',
      onComplete: function () {
        $content.style.visibility = 'hidden';
        $body.style.overflow = 'hidden';
      },
    });
  };

  const onClickMenuTrigger = function () {
    if (currentClickMesh) {
      const targetIndex = currentClickMesh.index;

      const plane = listMeshes[targetIndex];
      const planePogressUniform = plane.material.uniforms.u_progress;
      const planeOpacityUniform = plane.material.uniforms.u_opacity;
      const planeClickProgressUniform = plane.material.uniforms.u_clickProgress;

      // scale
      plane.userData.scaleTween && plane.userData.scaleTween.kill();
      plane.userData.scaleTween = gsap.to(plane.scale, 0.8, { x: plane.userData.scale.x, y: plane.userData.scale.y, ease: 'cubic.out' });

      // position tween
      let scrollTop = window.pageYOffset;
      plane.userData.positionTween && plane.userData.positionTween.kill();
      plane.userData.positionTween = gsap.to(plane.position, 0.6, {
        x: plane.userData.offset.x,
        y: plane.userData.offset.y + scrollTop * sceneUnit,
        ease: 'cubic.out',
        onComplete: function () {
          // currentHoverMesh
          currentHoverMesh = null;

          // currentClickMesh
          currentClickMesh = null;
        },
      });

      // click progress
      plane.userData.clickProgressTween && plane.userData.clickProgressTween.kill();
      plane.userData.clickProgressTween = gsap.to(planeClickProgressUniform, 1, { value: 0, ease: 'cubic.out' });

      // hover texture animation
      plane.userData.hoverProgressTween && plane.userData.hoverProgressTween.kill();
      plane.userData.hoverProgressTween = gsap.to(planePogressUniform, 1, {
        value: 0,
        ease: 'cubic.out',
        onComplete: function () {
          // opacity
          planeOpacityUniform.value = 0;

          // renderOrder
          plane.renderOrder = 0;
        },
      });

      // content
      contentOpacityTween = gsap.to($content, 0.8, {
        opacity: 1,
        ease: 'cubic.out',
        onStart: function () {
          $content.style.visibility = 'inherit';
        },
        onComplete: function () {
          $body.style.overflow = 'visible';
        },
      });
    }
  };

  // Scroll -----------------
  const onScroll = function (e) {
    const scrollTop = window.pageYOffset;

    for (let i = 0; i < listMeshes.length; i++) {
      const plane = listMeshes[i];
      plane.position.y = plane.userData.offset.y + scrollTop * sceneUnit;
    }
  };

  // Render -------------------
  const render = function (time, deltaTime) {
    shaderUniforms.u_time.value += deltaTime * 0.0001;

    renderer.render(scene, camera);
  };

  window.addEventListener('load', init);
  window.addEventListener('resize', resize);
};
App();
