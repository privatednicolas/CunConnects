import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AuthScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const p1 = new THREE.PointLight(0xff6b00, 4, 15);
    p1.position.set(2, 2, 2);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xf43f5e, 2, 10);
    p2.position.set(-2, -2, 1);
    scene.add(p2);
    const p3 = new THREE.PointLight(0x38bdf8, 2, 10);
    p3.position.set(0, 0, -2);
    scene.add(p3);

    // Interlocked torus rings
    const rings: THREE.Mesh[] = [];
    const ringData = [
      { r: 1.2, tube: 0.05, color: 0xff6b00, rx: 0, ry: 0, rz: 0 },
      { r: 1.2, tube: 0.05, color: 0xf43f5e, rx: Math.PI / 2, ry: 0, rz: 0 },
      { r: 1.2, tube: 0.05, color: 0x38bdf8, rx: 0, ry: Math.PI / 2, rz: 0 },
    ];
    ringData.forEach((d) => {
      const geo = new THREE.TorusGeometry(d.r, d.tube, 16, 100);
      const mat = new THREE.MeshStandardMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.8 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(d.rx, d.ry, d.rz);
      scene.add(mesh);
      rings.push(mesh);
    });

    // Central sphere
    const sphereGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.1, metalness: 0.9, emissive: 0xfbbf24, emissiveIntensity: 0.3 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Particles
    const pCount = 120;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(pGeo, pMat));

    let animId: number;
    const animate = (t: number) => {
      animId = requestAnimationFrame(animate);
      const time = t * 0.001;
      rings[0].rotation.x = time * 0.5;
      rings[0].rotation.y = time * 0.3;
      rings[1].rotation.x = Math.PI / 2 + time * 0.4;
      rings[1].rotation.z = time * 0.6;
      rings[2].rotation.y = Math.PI / 2 + time * 0.35;
      rings[2].rotation.z = time * 0.25;
      sphere.rotation.y = time * 1.5;
      p1.intensity = 3 + Math.sin(time * 1.2) * 1.5;
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
