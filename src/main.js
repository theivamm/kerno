import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menú');
  mobileNav.hidden = true;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
    ScrollTrigger.refresh();
  });
});
document.querySelectorAll('.service-list details').forEach(detail => {
  detail.addEventListener('toggle', () => { ScrollTrigger.refresh(); });
});
document.querySelector('#year').textContent = new Date().getFullYear();

const motion = gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference)', () => {
  const characters = [];
  document.querySelectorAll('.split-line').forEach(line => {
    const text = line.textContent;
    line.setAttribute('aria-label', text);
    line.textContent = '';
    text.split(' ').forEach((word, index) => {
      if (index) line.append(document.createTextNode(' '));
      const wordSpan = document.createElement('span');
      wordSpan.className = 'split-word';
      wordSpan.setAttribute('aria-hidden', 'true');
      [...word].forEach(character => {
        const span = document.createElement('span');
        span.textContent = character;
        span.className = 'char';
        wordSpan.append(span);
        characters.push(span);
      });
      line.append(wordSpan);
    });
  });
  gsap.from(characters, { yPercent: 105, opacity: 0, rotateX: -45, stagger: 0.027, duration: 1.05, ease: 'power3.out', delay: 0.15 });
  gsap.from('.hero-content > .eyebrow, .hero-content > p, .hero-actions, .hero-note', { opacity: 0, y: 15, duration: 1, stagger: 0.12, delay: 0.3 });
  gsap.from('.orbital', { opacity: 0, y: 45, scale: 0.95, duration: 1.8, delay: 0.25, ease: 'power2.out' });
  gsap.to('.core', { y: -12, duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.core-shine', { x: 22, y: -12, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  document.querySelectorAll('.reveal').forEach(element => {
    gsap.from(element, { y: 32, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
  });
  gsap.to('.orbital-glow', { opacity: 0.55, scale: 1.12, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
});
