// Stars stream opposite the rocket's flight direction at different depths.
export function createStarfield(THREE, angle) {
  const object = new THREE.Group();
  object.name = 'Passing stars';
  const direction = {x: Math.sin(angle), y: Math.cos(angle)};
  const random = (seed) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const seeds = (count, near) => Array.from({length: count}, (_, i) => ({
    phase: random(i + 1),
    lane: (random(i + 101) - 0.5) * 22,
    depth: near ? -1.5 - random(i + 201) * 5 : -5 - random(i + 201) * 10,
    speed: near ? 5 + random(i + 301) * 4 : 1.8 + random(i + 301) * 2.4,
    size: 1.5 + random(i + 401) * 2.5,
  }));
  const stars = seeds(200, false);
  const trails = seeds(64, true);
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(stars.length * 3), 3));
  starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(stars.map((star) => star.size), 1));
  const starMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    vertexShader: `
      attribute float size;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(size * 18.0 / max(1.0, -viewPosition.z), 1.5, 6.0);
      }
    `,
    fragmentShader: `
      void main() {
        float radius = length(gl_PointCoord - 0.5) * 2.0;
        float glow = pow(max(0.0, 1.0 - radius), 1.5);
        gl_FragColor = vec4(0.76, 0.88, 1.0, glow);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(starGeometry, starMaterial);
  points.name = 'Distant stars';
  points.frustumCulled = false;
  object.add(points);

  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(trails.length * 6), 3));
  const colors = trails.flatMap(() => [0.72, 0.86, 1, 0.04, 0.08, 0.16]);
  trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const trailMaterial = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false,
  });
  const streaks = new THREE.LineSegments(trailGeometry, trailMaterial);
  streaks.name = 'Near star streaks';
  streaks.frustumCulled = false;
  object.add(streaks);

  return {
    object,
    animate(elapsed) {
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const travel = 15 - ((star.phase * 30 + elapsed * star.speed) % 30);
        starGeometry.attributes.position.setXYZ(i,
          direction.x * travel + direction.y * star.lane,
          direction.y * travel - direction.x * star.lane,
          star.depth,
        );
      }
      for (let i = 0; i < trails.length; i++) {
        const star = trails[i];
        const travel = 15 - ((star.phase * 30 + elapsed * star.speed) % 30);
        const x = direction.x * travel + direction.y * star.lane;
        const y = direction.y * travel - direction.x * star.lane;
        const length = star.speed * 0.13;
        trailGeometry.attributes.position.setXYZ(i * 2, x, y, star.depth);
        trailGeometry.attributes.position.setXYZ(i * 2 + 1,
          x + direction.x * length, y + direction.y * length, star.depth,
        );
      }
      starGeometry.attributes.position.needsUpdate = true;
      trailGeometry.attributes.position.needsUpdate = true;
    },
    dispose() {
      starGeometry.dispose();
      starMaterial.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
    },
  };
}
