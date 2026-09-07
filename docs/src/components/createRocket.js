// A volumetric interpretation of the SpeziVibe mark, built from mesh geometry.
// The front faces +Z and the nose points +Y.
export function createRocket(THREE) {
  const object = new THREE.Group();
  object.name = 'SpeziVibe rocket';
  const geometries = new Set();
  const materials = new Set();
  const geometry = (value) => { geometries.add(value); return value; };
  const material = (value) => { materials.add(value); return value; };
  const mesh = (name, shape, surface, parent = object) => {
    const part = new THREE.Mesh(geometry(shape), surface);
    part.name = name;
    parent.add(part);
    return part;
  };

  const orange = material(new THREE.MeshPhysicalMaterial({
    color: 0xf26322, roughness: 0.78, metalness: 0.02, clearcoat: 0,
  }));
  const red = material(new THREE.MeshPhysicalMaterial({
    color: 0xad2511, roughness: 0.75, metalness: 0.05, clearcoat: 0,
  }));
  const rim = material(new THREE.MeshStandardMaterial({
    color: 0x252735, roughness: 0.7, metalness: 0.2,
  }));
  const champagne = material(new THREE.MeshStandardMaterial({
    color: 0xf0c8a0, roughness: 0.65, metalness: 0.25,
  }));
  const glass = material(new THREE.MeshPhysicalMaterial({
    color: 0x83d9ef, roughness: 0.3, metalness: 0, clearcoat: 0,
    transmission: 0.65, thickness: 0.25, ior: 1.45,
  }));

  // Revolve a rounded profile to give the fuselage a continuous curved surface.
  const profile = new THREE.Path();
  profile.moveTo(0, -0.72);
  profile.lineTo(0.43, -0.72);
  profile.bezierCurveTo(0.60, -0.30, 0.70, 0.40, 0.56, 0.96);
  profile.bezierCurveTo(0.49, 1.28, 0.23, 1.70, 0, 1.90);
  mesh('Orange fuselage', new THREE.LatheGeometry(profile.getPoints(40), 64), orange);

  const nose = new THREE.Path();
  nose.moveTo(0.292, 1.50);
  nose.bezierCurveTo(0.19, 1.68, 0.08, 1.82, 0, 1.914);
  mesh('Red nose cap', new THREE.LatheGeometry(nose.getPoints(24), 64), red);
  const collar = mesh('Engine collar', new THREE.TorusGeometry(0.427, 0.055, 12, 48), red);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = -0.70;
  const nozzle = mesh('Engine nozzle', new THREE.CylinderGeometry(0.29, 0.245, 0.22, 40), rim);
  nozzle.position.y = -0.81;
  for (const y of [-0.78, -0.90]) {
    const engineBand = mesh('Machined engine band', new THREE.TorusGeometry(y === -0.78 ? 0.29 : 0.25, 0.019, 10, 48), champagne);
    engineBand.rotation.x = Math.PI / 2;
    engineBand.position.y = y;
  }

  // Beveled, solid fins with inset orange panels echo the red outline of the mark.
  const finShape = new THREE.Shape();
  finShape.moveTo(0.44, -0.08);
  finShape.bezierCurveTo(0.64, -0.26, 0.86, -0.48, 0.96, -0.66);
  finShape.lineTo(0.87, -1.05);
  finShape.quadraticCurveTo(0.85, -1.09, 0.80, -1.02);
  finShape.lineTo(0.43, -0.69);
  finShape.closePath();
  const finGeometry = geometry(new THREE.ExtrudeGeometry(finShape, {
    depth: 0.16, bevelEnabled: true, bevelSegments: 3,
    steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 16,
  }));
  finGeometry.translate(0, 0, -0.08);
  const panelShape = new THREE.Shape();
  panelShape.moveTo(0.56, -0.34);
  panelShape.lineTo(0.83, -0.69);
  panelShape.lineTo(0.78, -0.86);
  panelShape.lineTo(0.56, -0.66);
  panelShape.closePath();
  const panelGeometry = geometry(new THREE.ExtrudeGeometry(panelShape, {
    depth: 0.015, bevelEnabled: true, bevelSegments: 2,
    bevelSize: 0.01, bevelThickness: 0.01,
  }));
  for (const side of [-1, 1]) {
    const fin = mesh(`${side < 0 ? 'Left' : 'Right'} fin`, finGeometry, red);
    fin.scale.x = side;
    const panel = mesh('Orange fin inset', panelGeometry, orange);
    panel.scale.x = side;
    panel.position.z = 0.115;
  }
  const keel = mesh('Front stabilizer', new THREE.CapsuleGeometry(0.065, 0.46, 5, 12), red);
  keel.position.set(0, -0.39, 0.535);

  // Raised rim and a convex window make the depth clear as the rocket turns.
  const windowMount = new THREE.Group();
  windowMount.name = 'Porthole';
  windowMount.position.set(0, 0.70, 0.592);
  windowMount.rotation.x = -0.12;
  object.add(windowMount);
  mesh('Porthole outer rim', new THREE.TorusGeometry(0.282, 0.060, 20, 64), champagne, windowMount);
  const innerRim = mesh('Porthole inner rim', new THREE.TorusGeometry(0.218, 0.024, 12, 48), rim, windowMount);
  innerRim.position.z = 0.03;
  const cabin = material(new THREE.MeshStandardMaterial({
    color: 0x08283c, emissive: 0x0a6980, emissiveIntensity: 0.35, roughness: 0.3,
  }));
  const backing = mesh('Deep blue cabin', new THREE.SphereGeometry(0.211, 32, 20), cabin, windowMount);
  backing.scale.z = 0.13;
  backing.position.z = 0.008;
  const window = mesh('Convex glass window', new THREE.SphereGeometry(0.205, 40, 24), glass, windowMount);
  window.scale.z = 0.4;
  window.position.z = 0.047;
  const rivetGeometry = geometry(new THREE.SphereGeometry(0.014, 10, 8));
  for (let i = 0; i < 8; i++) {
    const angle = i / 8 * Math.PI * 2;
    const rivet = mesh('Porthole rivet', rivetGeometry, rim, windowMount);
    rivet.position.set(Math.cos(angle) * 0.282, Math.sin(angle) * 0.282, 0.059);
  }
  const reflection = material(new THREE.MeshBasicMaterial({
    color: 0xe8fcff, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false,
  }));
  const windowGlint = mesh('Window reflection', new THREE.TorusGeometry(0.136, 0.009, 8, 32, 1.1), reflection, windowMount);
  windowGlint.position.set(-0.014, 0.016, 0.11);
  windowGlint.rotation.z = 0.55;

  // Tapered tubes follow curved paths, preserving the logo's sweeping flame.
  function taperedFlame(curve, radius) {
    const segments = 48;
    const sides = 20;
    const frames = curve.computeFrenetFrames(segments, false);
    const positions = [];
    const indices = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const center = curve.getPointAt(t);
      const width = radius * Math.pow(1 - t, 0.8) + 0.002;
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2;
        const offset = frames.normals[i].clone().multiplyScalar(Math.cos(angle) * width)
          .addScaledVector(frames.binormals[i], Math.sin(angle) * width);
        positions.push(center.x + offset.x, center.y + offset.y, center.z + offset.z * 0.7);
        if (i < segments && j < sides) {
          const a = i * (sides + 1) + j;
          const b = a + sides + 1;
          indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    return result;
  }
  const flame = new THREE.Group();
  flame.name = 'Curved exhaust';
  flame.position.set(0, -0.94, 0);
  object.add(flame);
  const outerFire = material(new THREE.MeshStandardMaterial({
    color: 0xff641c, emissive: 0xff4d0b, emissiveIntensity: 1.8, roughness: 0.65,
    side: THREE.DoubleSide,
  }));
  const innerFire = material(new THREE.MeshStandardMaterial({
    color: 0xffefb3, emissive: 0xffba46, emissiveIntensity: 2.4, roughness: 0.6,
    side: THREE.DoubleSide,
  }));
  mesh('Orange flame', taperedFlame(new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, -0.48, 0),
    new THREE.Vector3(-0.38, -1.05, 0), new THREE.Vector3(-1.10, -1.28, 0),
  ), 0.22), outerFire, flame);
  mesh('Golden flame core', taperedFlame(new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0.12), new THREE.Vector3(0.08, -0.40, 0.12),
    new THREE.Vector3(-0.26, -0.78, 0.12), new THREE.Vector3(-0.72, -1.02, 0.10),
  ), 0.135), innerFire, flame);
  const flameGlow = material(new THREE.MeshBasicMaterial({
    color: 0xff861c, transparent: true, opacity: 0.12, depthWrite: false,
    side: THREE.DoubleSide, toneMapped: false,
  }));
  mesh('Exhaust glow', taperedFlame(new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, -0.48, 0),
    new THREE.Vector3(-0.38, -1.05, 0), new THREE.Vector3(-1.14, -1.32, 0),
  ), 0.32), flameGlow, flame);
  const engineLight = new THREE.PointLight(0xffa34b, 0.8, 2.6, 2);
  engineLight.position.set(0, -0.99, 0.4);
  object.add(engineLight);

  const sparkCount = 28;
  const sparkGeometry = geometry(new THREE.BufferGeometry());
  sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(sparkCount * 3), 3));
  sparkGeometry.setAttribute('life', new THREE.Float32BufferAttribute(new Float32Array(sparkCount), 1));
  const sparkMaterial = material(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    vertexShader: `
      attribute float life;
      varying float vLife;
      void main() {
        vLife = life;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(60.0 * life / max(1.0, -viewPosition.z), 1.0, 10.0);
      }
    `,
    fragmentShader: `
      varying float vLife;
      void main() {
        float radius = length(gl_PointCoord - 0.5) * 2.0;
        float glow = pow(max(0.0, 1.0 - radius), 2.0);
        vec3 color = mix(vec3(1.0, 0.18, 0.02), vec3(1.0, 0.83, 0.35), vLife);
        gl_FragColor = vec4(color, glow * vLife);
        #include <colorspace_fragment>
      }
    `,
  }));
  const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
  sparks.name = 'Exhaust sparks';
  sparks.frustumCulled = false;
  flame.add(sparks);

  return {
    object,
    animate(elapsed) {
      flame.scale.set(0.92 + Math.sin(elapsed * 11) * 0.025, 1.25 + Math.sin(elapsed * 13) * 0.04, 1);
      innerFire.emissiveIntensity = 2.4 + Math.sin(elapsed * 6) * 0.2;
      engineLight.intensity = 0.8 + Math.sin(elapsed * 5) * 0.12;
      for (let i = 0; i < sparkCount; i++) {
        const t = (elapsed * (0.7 + (i % 3) * 0.08) + i / sparkCount) % 1;
        const spread = 0.07 + t * 0.17;
        sparkGeometry.attributes.position.setXYZ(i,
          -1.4 * t * t + Math.sin(i * 2.4) * spread,
          -0.12 - t * 1.45,
          Math.cos(i * 2.4) * spread + 0.1,
        );
        sparkGeometry.attributes.life.setX(i, 1 - t);
      }
      sparkGeometry.attributes.position.needsUpdate = true;
      sparkGeometry.attributes.life.needsUpdate = true;
    },
    dispose() {
      geometries.forEach((item) => item.dispose());
      materials.forEach((item) => item.dispose());
    },
  };
}
