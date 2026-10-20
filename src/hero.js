import { gsap } from 'gsap';

export function animateHero() {
  const hero = document.querySelector('.hero');
  const heading = hero.querySelector('.hero-tagline');
  const lines = [...heading.querySelectorAll('.split-line')];
  const originalText = lines.map(line => line.textContent);
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');
  hero.append(canvas);
  const ctx = canvas.getContext('2d');
  const bounds = hero.getBoundingClientRect();
  const headingBounds = heading.getBoundingClientRect();
  const secondLineTop = lines[1].getBoundingClientRect().top - bounds.top;
  const width = Math.ceil(bounds.width);
  const top = Math.max(0, Math.floor(headingBounds.top - bounds.top - 35));
  const height = Math.ceil(headingBounds.height + 100);
  const density = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * density;
  canvas.height = height * density;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.style.top = `${top}px`;
  const particles = [];
  // Sample the rendered font silhouette; accessible HTML takes over at the end.
  if (ctx) {
    const sample = document.createElement('canvas');
    sample.width = width;
    sample.height = height;
    const ink = sample.getContext('2d', { willReadFrequently: true });
    if (ink) {
      lines.forEach(line => {
        const rect = line.getBoundingClientRect();
        const style = getComputedStyle(line);
        ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        ink.letterSpacing = style.letterSpacing;
        ink.textBaseline = 'middle';
        ink.fillStyle = '#fff';
        ink.fillText(line.textContent, rect.left - bounds.left, rect.top - bounds.top - top + rect.height / 2);
      });
      const pixels = ink.getImageData(0, 0, width, height).data;
      const spacing = width < 761 ? 3 : 2;
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          if (pixels[(y * width + x) * 4 + 3] > 100) {
            const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            const random = seed - Math.floor(seed);
            particles.push({ x, y, secondLine: y + top >= secondLineTop, dx: width * (0.45 + random * 0.4), dy: (random - 0.5) * 18, phase: random * Math.PI * 2, size: 0.45 + random * 0.55 });
          }
        }
      }
    }
    ctx.scale(density, density);
  }
  const formation = { progress: 0 };
  const easeFormation = gsap.parseEase('power3.inOut');
  const entrance = gsap.timeline({ scrollTrigger: { trigger: heading, start: 'top 95%', once: true } });
  if (particles.length) {
    entrance.to(formation, {
      progress: 1.25, duration: 2.9, ease: 'none',
      onUpdate() {
        ctx.clearRect(0, 0, width, height);
        for (const point of particles) {
          const progress = gsap.utils.clamp(0, 1, formation.progress - (point.secondLine ? 0.25 : 0));
          const spread = 1 - easeFormation(progress);
          ctx.globalAlpha = Math.min(progress * 6, 1) * Math.min((1 - progress) * 5, 1);
          const x = point.x + point.dx * spread;
          const y = point.y + point.dy * spread + Math.sin(point.phase + progress * 9) * spread * 3;
          ctx.fillStyle = point.secondLine ? '#bda4ff' : '#e7e1f4';
          ctx.fillRect(x, y, point.size, point.size);
        }
      },
    }, 0.1);
  }
  entrance.add(() => canvas.remove());

  const ambient = gsap.timeline({ repeat: -1, yoyo: true });
  ambient.to('.core', { y: -9, duration: 4, ease: 'sine.inOut' }, 0);
  ambient.to('.core-shine', { x: 35, y: 18, scale: 1.3, opacity: 0.6, duration: 4, ease: 'sine.inOut' }, 0);
  ambient.to('.orbital-glow', { opacity: 0.6, scale: 1.12, duration: 4, ease: 'sine.inOut' }, 0);
  const orbitNodes = [...hero.querySelectorAll('.orbit')].map((orbit, index) => {
    let node = orbit.querySelector('.satellite');
    const added = !node;
    if (added) {
      node = document.createElement('span');
      node.className = 'satellite';
      orbit.append(node);
    }
    const travel = { angle: index * 2.1 };
    const tween = gsap.to(travel, {
      angle: travel.angle + Math.PI * 2, duration: 12 + index * 6, repeat: -1, ease: 'none',
      onUpdate() {
        const x = Math.cos(travel.angle);
        const y = Math.sin(travel.angle);
        node.style.left = `${50 + x * 50}%`;
        node.style.top = `${50 + y * 50}%`;
        node.style.opacity = String(0.45 + (y + 1) * 0.275);
        node.style.transform = `translate(-50%, -50%) scale(${0.7 + (y + 1) * 0.25})`;
      },
    });
    return { tween, node, added };
  });
  let heroVisible = true;
  const updatePlayback = () => {
    const paused = !heroVisible || document.hidden;
    ambient.paused(paused);
    orbitNodes.forEach(({ tween }) => tween.paused(paused));
    hero.classList.toggle('motion-paused', paused);
  };
  const observer = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; updatePlayback(); });
  observer.observe(hero);
  document.addEventListener('visibilitychange', updatePlayback);
  const finishFormation = () => { entrance.progress(1); canvas.remove(); };
  window.addEventListener('resize', finishFormation, { once: true });
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', updatePlayback);
    window.removeEventListener('resize', finishFormation);
    canvas.remove();
    hero.classList.remove('motion-paused');
    orbitNodes.forEach(({ node, added }) => { if (added) node.remove(); else node.removeAttribute('style'); });
    lines.forEach((line, index) => { line.textContent = originalText[index]; line.removeAttribute('aria-label'); });
  };
}
