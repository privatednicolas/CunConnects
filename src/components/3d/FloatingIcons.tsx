import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FloatingIcons() {
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
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0xff6b00, 3, 20);
    point.position.set(0, 3, 3);
    scene.add(point);

    // Rocket shape (cone + cylinder)
    const group = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.3, metalness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    const noseGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.y = 0.9;
    group.add(nose);

    group.position.set(-3.5, 1, 0);
    group.rotation.z = Math.PI / 6;
    scene.add(group);

    // Octahedron for "star"
    const starGeo = new THREE.OctahedronGeometry(0.5, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.8, emissive: 0xfbbf24, emissiveIntensity: 0.3 });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(3, 1.5, 0);
    scene.add(star);

    // Torus for "network"
    const netGeo = new THREE.TorusGeometry(0.5, 0.15, 8, 24);
    const netMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.6 });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0.5, -2, -1);
    scene.add(net);

    // Step dots
    const dots: THREE.Mesh[] = [];
    const dotPositions = [[-4, -1, 0], [0, 2.5, 0], [4, -1, 0]];
    dotPositions.forEach((pos, i) => {
      const g = new THREE.SphereGeometry(0.15, 16, 16);
      const colors = [0xff6b00, 0xfbbf24, 0x38bdf8];
      const m = new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.5 });
      const d = new THREE.Mesh(g, m);
      d.position.set(...(pos as [number, number, number]));
      scene.add(d);
      dots.push(d);
    });

    let animId: number;
    const animate = (t: number) => {
      animId = requestAnimationFrame(animate);
      const time = t * 0.001;

      group.position.y = 1 + Math.sin(time * 0.8) * 0.3;
      group.rotation.z = Math.PI / 6 + Math.sin(time * 0.5) * 0.1;

      star.rotation.y = time * 1.2;
      star.rotation.x = time * 0.7;
      star.position.y = 1.5 + Math.sin(time * 1.1) * 0.25;

      net.rotation.x = time * 0.5;
      net.rotation.y = time * 0.8;
      net.position.y = -2 + Math.sin(time * 0.9 + 1) * 0.2;

      dots.forEach((d, i) => {
        d.position.y = dotPositions[i][1] + Math.sin(time * 0.6 + i * 1.5) * 0.15;
      });

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
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
