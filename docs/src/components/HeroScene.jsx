import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {createRocket} from './createRocket';
import {createStarfield} from './createStarfield';

export default function HeroScene() {
  const hostRef = useRef(null);
  const controllerRef = useRef(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  const rocketUrl = useBaseUrl('/img/rocket-logo.png');

  useEffect(() => {
    pausedRef.current = paused;
    controllerRef.current?.updateMotion();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let cleanedUp = false;
    let cleanup = () => {};
    setReady(false);
    setFailed(false);
    setReducedMotion(motion.matches);

    // Load WebGL only on the homepage, after the useful page content renders.
    Promise.all([
      import('three'),
      import('three/addons/environments/RoomEnvironment.js'),
    ]).then(([THREE, {RoomEnvironment}]) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
      } catch {
        setFailed(true);
        return; // Show the original artwork only when WebGL is unavailable.
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
      camera.position.set(0, 0, 9.5);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);

      let environmentMap = null;
      const updateEnvironment = () => {
        environmentMap?.dispose();
        const room = new RoomEnvironment();
        const generator = new THREE.PMREMGenerator(renderer);
        try {
          environmentMap = generator.fromScene(room, 0.04);
          scene.environment = environmentMap.texture;
          scene.environmentIntensity = 0.35;
        } finally {
          room.dispose();
          generator.dispose();
        }
      };

      const rocketModel = createRocket(THREE);
      const rocket = rocketModel.object;
      const flightAngle = 0.62;
      rocket.rotation.set(0.10, 0.4, -flightAngle);
      rocket.position.set(0.1, 0.12, 0);
      scene.add(rocket);
      const starfield = createStarfield(THREE, flightAngle);
      scene.add(starfield.object);
      scene.add(new THREE.HemisphereLight(0xfff8ef, 0x26384b, 1.25));
      const keyLight = new THREE.DirectionalLight(0xfff4e8, 2.4);
      keyLight.position.set(-3, 5, 6);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffc9ad, 1.0);
      fillLight.position.set(4, 1, 4);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0x91ded9, 1.5);
      rimLight.position.set(2, 3, -4);
      scene.add(rimLight);

      let inView = true;
      let contextLost = false;
      let previousTime = null;
      let elapsed = 0;
      let animating = false;
      let hasRendered = false;
      const hero = host.closest('.launch-hero');
      const draw = (time) => {
        const delta = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        elapsed += delta;
        // Follow ordinary page scrolling; pause and reduced motion keep a static pose.
        if (hero && !motion.matches && !pausedRef.current) {
          const bounds = hero.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, -bounds.top / bounds.height));
          rocket.position.set(0.1 + progress * 1.8, 0.12 + progress * 2.8, 0);
        } else if (motion.matches) {
          rocket.position.set(0.1, 0.12, 0);
        }
        rocketModel.animate(elapsed);
        starfield.animate(elapsed);
        renderer.render(scene, camera);
        // Reveal a complete first frame, never an empty or half-built canvas.
        if (!hasRendered) {
          hasRendered = true;
          setFailed(false);
          setReady(true);
        }
      };

      const updateMotion = () => {
        const shouldAnimate = !disposed && !cleanedUp && !contextLost && inView && !document.hidden && !motion.matches && !pausedRef.current;
        previousTime = null;
        if (shouldAnimate !== animating) {
          animating = shouldAnimate;
          renderer.setAnimationLoop(shouldAnimate ? draw : null);
        }
        if (!shouldAnimate && !contextLost && !disposed && !cleanedUp) draw(performance.now());
      };
      controllerRef.current = {updateMotion};

      const resize = () => {
        const {width, height} = host.getBoundingClientRect();
        if (!width || !height || contextLost) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 1.2 ? 10.5 : 9.5;
        camera.updateProjectionMatrix();
        previousTime = null;
        draw(performance.now());
      };
      const onMotionChange = () => { setReducedMotion(motion.matches); updateMotion(); };
      const onContextLost = (event) => {
        event.preventDefault();
        contextLost = true;
        hasRendered = false;
        setReady(false);
        setFailed(true);
        updateMotion();
      };
      const onContextRestored = () => {
        contextLost = false;
        try {
          updateEnvironment();
          resize();
          updateMotion();
        } catch {
          cleanup();
          setReady(false);
          setFailed(true);
        }
      };
      const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); });
      const resizeObserver = new ResizeObserver(resize);
      observer.observe(host);
      resizeObserver.observe(host);
      document.addEventListener('visibilitychange', updateMotion);
      motion.addEventListener('change', onMotionChange);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        renderer.setAnimationLoop(null);
        observer.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', updateMotion);
        motion.removeEventListener('change', onMotionChange);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
        starfield.dispose();
        rocketModel.dispose();
        scene.environment = null;
        environmentMap?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        controllerRef.current = null;
      };
      updateEnvironment();
      resize();
      updateMotion();
    }).catch(() => {
      cleanup();
      if (!disposed) {
        setReady(false);
        setFailed(true);
      }
    });

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div className={`hero-scene${ready ? ' is-ready' : ''}${failed ? ' is-fallback' : ''}`}>
      <div ref={hostRef} className="hero-scene-canvas" aria-hidden="true" />
      <div className="hero-scene-fallback" aria-hidden="true">
        <img className="hero-rocket-fallback" src={rocketUrl} alt="" width="240" height="240" />
      </div>
      <noscript>
        <div className="hero-scene-fallback is-static" aria-hidden="true">
          <img className="hero-rocket-fallback" src={rocketUrl} alt="" width="240" height="240" />
        </div>
      </noscript>
      {ready && !reducedMotion && (
        <button className="scene-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Play hero animation' : 'Pause hero animation'}>
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span> {paused ? 'Play' : 'Pause'}
        </button>
      )}
    </div>
  );
}
