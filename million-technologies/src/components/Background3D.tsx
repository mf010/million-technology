import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { Mesh } from 'three';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';

function AnimatedShape() {
  const meshRef = useRef<Mesh>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Calculate target rotation based on scroll progress
      const targetX = scrollProgress * Math.PI * 2;
      const targetY = scrollProgress * Math.PI * 4;

      // Lerp for smooth animation, catching up to target
      meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={0.9}>
        <torusKnotGeometry args={[1.2, 0.4, 256, 64]} />
        <MeshDistortMaterial
          color="#1A9CDD"
          envMapIntensity={1}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.2}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-80 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#1A9CDD" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#FF6B6B" />
        <AnimatedShape />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
