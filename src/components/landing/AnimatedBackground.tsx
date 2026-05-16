import React, { useEffect, useRef, useMemo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: number[];
}

interface AnimatedBackgroundProps {
  topic?: string;
}

// Map topic keywords to color themes
function getTopicTheme(topic?: string): { colors: number[][]; gridColor: string; lineColor: string } {
  if (!topic) return {
    colors: [[88, 204, 2], [73, 192, 248], [165, 96, 232], [255, 200, 0]],
    gridColor: 'rgba(55, 86, 95, 0.06)',
    lineColor: 'rgba(88, 204, 2,',
  };

  const t = topic.toLowerCase();

  // Programming / Tech / CS
  if (t.includes('python') || t.includes('javascript') || t.includes('programming') || t.includes('coding') || t.includes('web dev') || t.includes('react') || t.includes('node') || t.includes('typescript') || t.includes('java') || t.includes('rust') || t.includes('c++') || t.includes('software')) {
    return {
      colors: [[0, 255, 136], [0, 200, 255], [0, 128, 255], [100, 255, 218]],
      gridColor: 'rgba(0, 200, 180, 0.07)',
      lineColor: 'rgba(0, 255, 136,',
    };
  }

  // AI / ML / Data Science
  if (t.includes('machine learning') || t.includes('ai') || t.includes('artificial') || t.includes('deep learning') || t.includes('neural') || t.includes('data science') || t.includes('nlp')) {
    return {
      colors: [[138, 43, 226], [75, 0, 130], [0, 191, 255], [255, 105, 180]],
      gridColor: 'rgba(138, 43, 226, 0.06)',
      lineColor: 'rgba(138, 43, 226,',
    };
  }

  // Music / Guitar / Piano
  if (t.includes('music') || t.includes('guitar') || t.includes('piano') || t.includes('singing') || t.includes('drums') || t.includes('violin') || t.includes('production')) {
    return {
      colors: [[255, 99, 71], [255, 165, 0], [255, 215, 0], [255, 69, 0]],
      gridColor: 'rgba(255, 140, 0, 0.06)',
      lineColor: 'rgba(255, 165, 0,',
    };
  }

  // Science / Biology / Chemistry / Physics
  if (t.includes('biology') || t.includes('chemistry') || t.includes('physics') || t.includes('science') || t.includes('anatomy') || t.includes('genetics') || t.includes('quantum')) {
    return {
      colors: [[0, 200, 83], [76, 175, 80], [0, 230, 118], [129, 199, 132]],
      gridColor: 'rgba(76, 175, 80, 0.06)',
      lineColor: 'rgba(0, 200, 83,',
    };
  }

  // Business / Marketing / Finance
  if (t.includes('business') || t.includes('marketing') || t.includes('finance') || t.includes('startup') || t.includes('entrepreneur') || t.includes('economics') || t.includes('invest')) {
    return {
      colors: [[0, 123, 255], [23, 162, 184], [40, 167, 69], [255, 193, 7]],
      gridColor: 'rgba(0, 123, 255, 0.06)',
      lineColor: 'rgba(0, 123, 255,',
    };
  }

  // Art / Design / Photography
  if (t.includes('art') || t.includes('design') || t.includes('digital') || t.includes('photo') || t.includes('drawing') || t.includes('paint') || t.includes('ui') || t.includes('ux') || t.includes('graphic')) {
    return {
      colors: [[255, 64, 129], [233, 30, 99], [156, 39, 176], [255, 167, 38]],
      gridColor: 'rgba(233, 30, 99, 0.06)',
      lineColor: 'rgba(255, 64, 129,',
    };
  }

  // Math
  if (t.includes('math') || t.includes('algebra') || t.includes('calculus') || t.includes('geometry') || t.includes('statistics')) {
    return {
      colors: [[33, 150, 243], [3, 169, 244], [0, 188, 212], [100, 181, 246]],
      gridColor: 'rgba(33, 150, 243, 0.06)',
      lineColor: 'rgba(33, 150, 243,',
    };
  }

  // Language / Writing
  if (t.includes('english') || t.includes('spanish') || t.includes('french') || t.includes('writing') || t.includes('language') || t.includes('arabic') || t.includes('japanese') || t.includes('chinese')) {
    return {
      colors: [[255, 152, 0], [255, 183, 77], [255, 213, 79], [255, 241, 118]],
      gridColor: 'rgba(255, 152, 0, 0.06)',
      lineColor: 'rgba(255, 152, 0,',
    };
  }

  // Health / Fitness / Sports
  if (t.includes('fitness') || t.includes('health') || t.includes('yoga') || t.includes('nutrition') || t.includes('workout') || t.includes('sport') || t.includes('football') || t.includes('soccer') || t.includes('basketball') || t.includes('chess')) {
    return {
      colors: [[244, 67, 54], [229, 57, 53], [255, 87, 34], [255, 138, 101]],
      gridColor: 'rgba(244, 67, 54, 0.06)',
      lineColor: 'rgba(244, 67, 54,',
    };
  }

  // Default fallback
  return {
    colors: [[88, 204, 2], [73, 192, 248], [165, 96, 232], [255, 200, 0]],
    gridColor: 'rgba(55, 86, 95, 0.06)',
    lineColor: 'rgba(88, 204, 2,',
  };
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ topic }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useMemo(() => getTopicTheme(topic), [topic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // Floating particles
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 35;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles with theme colors
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
      });
    }

    // Subtle gradient mesh + floating particles + grid
    const draw = () => {
      time += 0.0008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // === Gradient mesh blobs using theme colors ===
      const blobs = [
        {
          x: canvas.width * (0.15 + 0.08 * Math.sin(time * 1.1)),
          y: canvas.height * (0.2 + 0.06 * Math.cos(time * 0.9)),
          r: Math.min(canvas.width, canvas.height) * 0.45,
          color: theme.colors[0],
          opacity: 0.04,
        },
        {
          x: canvas.width * (0.85 + 0.06 * Math.cos(time * 0.7)),
          y: canvas.height * (0.75 + 0.08 * Math.sin(time * 1.3)),
          r: Math.min(canvas.width, canvas.height) * 0.5,
          color: theme.colors[1],
          opacity: 0.035,
        },
        {
          x: canvas.width * (0.5 + 0.1 * Math.sin(time * 0.5)),
          y: canvas.height * (0.5 + 0.05 * Math.cos(time * 0.8)),
          r: Math.min(canvas.width, canvas.height) * 0.55,
          color: theme.colors[2],
          opacity: 0.02,
        },
      ];

      for (const blob of blobs) {
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.r
        );
        gradient.addColorStop(0, `rgba(${blob.color.join(',')}, ${blob.opacity})`);
        gradient.addColorStop(0.6, `rgba(${blob.color.join(',')}, ${blob.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // === Subtle grid pattern ===
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // === Floating particles ===
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle with glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, `rgba(${p.color.join(',')}, ${p.opacity})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = `rgba(${p.color.join(',')}, ${p.opacity * 2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // === Connect nearby particles with lines ===
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.04;
            ctx.strokeStyle = `${theme.lineColor} ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};
