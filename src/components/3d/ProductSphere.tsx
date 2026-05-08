import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  color?: string;
}

export default function ProductSphere({ color = '#ff6b00' }: Props) {
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
    camera.position.set(0, 0, 4);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const hex = parseInt(color.replace('#', ''), 16);
    const point1 = new THREE.PointLight(hex, 4, 15);
    point1.position.set(2, 2, 2);
    scene.add(point1);
    const point2 = new THREE.PointLight(0xffffff, 1.5, 10);
    point2.position.set(-2, -1, 1);
    scene.add(point2);

    // Main torus knot
    const geo = new THREE.TorusKnotGeometry(0.9, 0.3, 128, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.1,
      metalness: 0.9,
      emissive: hex,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Outer wireframe ring
    const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    const ring2 = ring.clone();
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    scene.add(ring2);

    let animId: number;
    const animate = (t: number) => {
      animId = requestAnimationFrame(animate);
      const time = t * 0.001;
      mesh.rotation.x = time * 0.4;
      mesh.rotation.y = time * 0.6;
      ring.rotation.z = time * 0.3;
      ring2.rotation.z = -time * 0.2;
      point1.intensity = 3 + Math.sin(time * 2) * 1;
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!el) return;
      const nw = el.clientWidth;
      const nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [color]);

  return <div ref={mountRef} className="w-full h-full" />;
}
