import './style.css';
import './effects.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateHero } from './hero.js';

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
const heroHeading = document.querySelector('.hero h1');
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) heroHeading.classList.add('hero-preparing');
document.fonts.ready.then(() => {
motion.add('(prefers-reduced-motion: no-preference)', () => {
  const cleanupHero = animateHero();
  heroHeading.classList.add('particle-heading');
  document.querySelectorAll('.split-line').forEach((line, lineIndex) => {
    const characters = [];
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
    gsap.from(characters, { opacity: 0, stagger: { each: 0.012, from: 'end' }, duration: 0.65, ease: 'power2.out', delay: 1.85 + lineIndex * 0.58 });
  });
  heroHeading.classList.remove('hero-preparing');
  gsap.from('.hero-content > .eyebrow', { opacity: 0, y: 8, duration: 0.7 });
  gsap.from('.hero-content > p, .hero-actions, .hero-note', { opacity: 0, y: 12, duration: 0.85, stagger: 0.13, delay: 1.9 });
  gsap.from('.orbital', { opacity: 0, y: 28, scale: 0.96, duration: 1.6, delay: 0.65, ease: 'power2.out' });
  gsap.from('.orbit-label', { opacity: 0, y: 12, stagger: 0.2, duration: 0.8, delay: 1.5 });
  document.querySelectorAll('.reveal').forEach(element => {
    gsap.from(element, { y: 32, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
  });
  return () => { cleanupHero(); heroHeading.classList.remove('particle-heading'); };
});
heroHeading.classList.remove('hero-preparing');
});
