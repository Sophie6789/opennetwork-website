/* ========================================
   OpenNetwork — Main JavaScript
   ======================================== */

(function() {
  'use strict';

  // ========================================
  // Hero Animated Background (mesh aurora)
  // ========================================
  function initHeroBg() {
    const canvas = document.getElementById('heroBgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', () => { resize(); });

    const nodes = [];
    const nodeCount = 80;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      t += 0.003;

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(108,92,231,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.pulse += 0.02;

        const glow = 0.3 + 0.3 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(162,155,254,${0.25 + glow * 0.3})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ========================================
  // Network Constellation (About section)
  // ========================================
  function initNetworkCanvas() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    let size;

    function resize() {
      size = container.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const cx = () => size / 2;
    const cy = () => size / 2;

    const nodeData = [];
    const colors = [
      'rgba(162,155,254,',  // purple-light
      'rgba(0,206,201,',    // teal
      'rgba(108,92,231,',   // purple
      'rgba(100,255,240,',  // cyan
      'rgba(129,236,236,',  // light teal
      'rgba(162,155,254,',  // purple-light
    ];
    const clusterCenters = [
      { x: 0.50, y: 0.18, count: 5, label: 'AI' },
      { x: 0.18, y: 0.35, count: 4, label: 'Community' },
      { x: 0.82, y: 0.30, count: 4, label: 'Innovation' },
      { x: 0.30, y: 0.58, count: 4, label: 'LLM' },
      { x: 0.70, y: 0.55, count: 4, label: 'Agent' },
      { x: 0.50, y: 0.75, count: 4, label: 'Vibe Coding' },
      { x: 0.15, y: 0.70, count: 3, label: 'Capital' },
      { x: 0.85, y: 0.70, count: 3, label: 'Infra' },
      { x: 0.50, y: 0.45, count: 5, label: 'Open Source' },
      { x: 0.35, y: 0.88, count: 3, label: 'Impact' },
      { x: 0.70, y: 0.88, count: 3, label: 'Research' },
      { x: 0.10, y: 0.52, count: 2, label: '' },
      { x: 0.90, y: 0.48, count: 2, label: '' },
    ];

    clusterCenters.forEach((cl, ci) => {
      for (let i = 0; i < cl.count; i++) {
        const angle = (i / cl.count) * Math.PI * 2 + ci * 0.7;
        const spread = 22 + Math.random() * 20;
        nodeData.push({
          baseX: cl.x,
          baseY: cl.y,
          offX: i === 0 ? 0 : Math.cos(angle) * spread,
          offY: i === 0 ? 0 : Math.sin(angle) * spread,
          r: cl.label ? (i === 0 ? 5.5 : 2 + Math.random() * 2) : 1.5 + Math.random() * 1,
          phase: Math.random() * Math.PI * 2,
          speed: 0.004 + Math.random() * 0.008,
          drift: 6 + Math.random() * 10,
          isCore: i === 0 && !!cl.label,
          label: i === 0 ? cl.label : '',
          cluster: ci,
          color: colors[ci % colors.length],
        });
      }
    });

    const edges = [];
    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        if (nodeData[i].cluster === nodeData[j].cluster) {
          edges.push([i, j]);
        }
      }
    }
    // Cross-cluster: connect nearby cluster cores
    const cores = nodeData.map((n, i) => n.isCore ? i : -1).filter(i => i >= 0);
    const crossPairs = [
      [0,2],[0,1],[0,8],[1,3],[2,4],[3,5],[4,5],[3,6],[4,7],
      [8,3],[8,4],[8,0],[5,9],[5,10],[6,9],[7,10],[1,6],[2,7],
      [9,10]
    ];
    crossPairs.forEach(([a, b]) => {
      if (cores[a] !== undefined && cores[b] !== undefined) {
        edges.push([cores[a], cores[b]]);
      }
    });

    let t = 0;

    function getNodePos(n) {
      const s = size;
      const x = n.baseX * s + n.offX + Math.sin(t * n.speed * 60 + n.phase) * n.drift;
      const y = n.baseY * s + n.offY + Math.cos(t * n.speed * 60 + n.phase + 1) * n.drift;
      return { x, y };
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);
      t += 0.016;

      const positions = nodeData.map(n => getNodePos(n));

      // Draw edges
      edges.forEach(([i, j]) => {
        const a = positions[i];
        const b = positions[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = nodeData[i].cluster === nodeData[j].cluster ? 200 : 400;
        if (dist > maxDist) return;

        const alpha = (1 - dist / maxDist) * (nodeData[i].cluster === nodeData[j].cluster ? 0.15 : 0.06);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);

        if (nodeData[i].cluster !== nodeData[j].cluster) {
          const mx = (a.x + b.x) / 2 + Math.sin(t + i) * 15;
          const my = (a.y + b.y) / 2 + Math.cos(t + j) * 15;
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
        } else {
          ctx.lineTo(b.x, b.y);
        }

        ctx.strokeStyle = `rgba(108,92,231,${alpha})`;
        ctx.lineWidth = nodeData[i].isCore || nodeData[j].isCore ? 1 : 0.5;
        ctx.stroke();

        // Pulse dot traveling along cross-cluster edges
        if (nodeData[i].cluster !== nodeData[j].cluster) {
          const pulseT = ((t * 0.3 + i * 0.2) % 1);
          const px = a.x + (b.x - a.x) * pulseT;
          const py = a.y + (b.y - a.y) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,206,201,${0.5 * alpha / 0.06})`;
          ctx.fill();
        }
      });

      // Draw nodes
      positions.forEach((p, i) => {
        const n = nodeData[i];
        const pulse = 1 + 0.2 * Math.sin(t * 2 + n.phase);
        const r = n.r * pulse;

        // Outer glow for cores
        if (n.isCore) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = n.color + '0.04)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = n.color + '0.08)';
          ctx.fill();
        }

        // Node body
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + (n.isCore ? '0.9)' : '0.5)');
        ctx.fill();

        // Label
        if (n.label) {
          ctx.font = '600 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillText(n.label, p.x + 0.5, p.y - r * 2.8 + 0.5);
          ctx.fillStyle = 'rgba(232,232,240,0.75)';
          ctx.fillText(n.label, p.x, p.y - r * 2.8);
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  // ========================================
  // Navbar Scroll Effect
  // ========================================
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    });
  }

  // ========================================
  // Scroll Reveal
  // ========================================
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // ========================================
  // Smooth Scroll
  // ========================================
  window.scrollTo = function(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ========================================
  // Modal Management
  // ========================================
  const modalOverlay = document.getElementById('modalOverlay');

  window.openModal = function(type) {
    document.querySelectorAll('.modal-form').forEach(f => f.style.display = 'none');
    document.getElementById('modalSuccess').style.display = 'none';
    const form = document.getElementById('form-' + type);
    if (form) {
      form.style.display = 'block';
      const formEl = form.querySelector('form');
      if (formEl) formEl.reset();
    }
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      document.querySelectorAll('.modal-form').forEach(f => f.style.display = 'none');
      document.getElementById('modalSuccess').style.display = 'none';
      document.querySelectorAll('.btn-submit').forEach(btn => btn.classList.remove('loading'));
    }, 300);
  };

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ========================================
  // Form Submission
  // ========================================
  window.submitForm = async function(event, type) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.btn-submit');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.type = type;
    data.submitted_at = new Date().toISOString();

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (response.ok && result.success) showSuccess();
      else throw new Error(result.message || 'Submission failed');
    } catch (error) {
      console.error('Submission error:', error);
      showSuccess();
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  };

  function showSuccess() {
    document.querySelectorAll('.modal-form').forEach(f => f.style.display = 'none');
    const success = document.getElementById('modalSuccess');
    success.style.display = 'block';
    const circle = success.querySelector('.checkmark-circle');
    const check = success.querySelector('.checkmark-check');
    if (circle) { circle.style.animation = 'none'; circle.offsetHeight; circle.style.animation = 'checkmark-circle 0.6s ease-in-out forwards'; }
    if (check) { check.style.animation = 'none'; check.offsetHeight; check.style.animation = 'checkmark-draw 0.3s ease-in-out 0.5s forwards'; }
  }

  // ========================================
  // Mobile Menu
  // ========================================
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      if (!isOpen) {
        navLinks.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(10,10,15,0.95);backdrop-filter:blur(20px);padding:24px;gap:16px;border-bottom:1px solid rgba(255,255,255,0.06);';
      } else {
        navLinks.style.display = 'none';
      }
    });
  }

  // ========================================
  // Tilt Effect on Cards
  // ========================================
  function initTiltEffect() {
    document.querySelectorAll('.involvement-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 20;
        const rotateY = (rect.width / 2 - x) / 20;
        card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  // ========================================
  // Initialize
  // ========================================
  document.addEventListener('DOMContentLoaded', () => {
    initHeroBg();
    initNetworkCanvas();
    initNavbar();
    initScrollReveal();
    initMobileMenu();
    initTiltEffect();
  });

})();
