import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Scene / Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Ambient + point lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const pointA = new THREE.PointLight(0xff6b00, 3, 20);
    pointA.position.set(3, 3, 3);
    scene.add(pointA);
    const pointB = new THREE.PointLight(0xf43f5e, 2, 20);
    pointB.position.set(-3, -2, 2);
    scene.add(pointB);
    const pointC = new THREE.PointLight(0x38bdf8, 1.5, 20);
    pointC.position.set(0, -3, -2);
    scene.add(pointC);

    // Central icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.08, transparent: true });
    const wire = new THREE.Mesh(icoGeo.clone(), wireMat);
    wire.scale.setScalar(1.01);
    scene.add(wire);

    // Orbiting small spheres
    const orbitCount = 6;
    const orbitSpheres: THREE.Mesh[] = [];
    const orbitAngles: number[] = [];
    const orbitColors = [0xff6b00, 0xf43f5e, 0x38bdf8, 0xfbbf24, 0xa78bfa, 0x34d399];
    for (let i = 0; i < orbitCount; i++) {
      const geo = new THREE.SphereGeometry(0.1, 16, 16);
      const mat = new THREE.MeshStandardMaterial({ color: orbitColors[i], emissive: orbitColors[i], emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      orbitSpheres.push(mesh);
      orbitAngles.push((i / orbitCount) * Math.PI * 2);
    }

    // Floating particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!el) return;
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    const animate = (t: number) => {
      animId = requestAnimationFrame(animate);
      const time = t * 0.001;

      // Rotate central mesh
      ico.rotation.x = time * 0.3 + mouseY * 0.2;
      ico.rotation.y = time * 0.5 + mouseX * 0.2;
      wire.rotation.copy(ico.rotation);

      // Orbit spheres
      const orbitRadius = 2.2;
      orbitSpheres.forEach((s, i) => {
        const angle = orbitAngles[i] + time * (0.4 + i * 0.05);
        const tilt = (i % 3) * (Math.PI / 4);
        s.position.x = Math.cos(angle) * orbitRadius;
        s.position.y = Math.sin(angle) * Math.sin(tilt) * orbitRadius;
        s.position.z = Math.sin(angle) * Math.cos(tilt) * orbitRadius * 0.5;
        s.rotation.y = time * 2;
      });

      // Gently float particles
      particles.rotation.y = time * 0.02;
      particles.rotation.x = time * 0.01;

      // Camera slight drift
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Pulse light
      pointA.intensity = 2.5 + Math.sin(time * 1.5) * 0.8;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
