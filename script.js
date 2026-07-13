/**
 * Wedding-Invitation — Standalone helpers (optional)
 * The full app runs via React (src/). This file documents core URLs
 * and can be used if you embed a lightweight static preview.
 */

(function () {
  "use strict";

  var WEDDING = {
    groom: "غانم",
    bride: "أمنية",
    dateLabel: "الجمعة 14/8",
    venue: "قاعة البانسيه",
    mapsUrl: "https://maps.app.goo.gl/sGaN2qYLtmyBdaar8?g_st=ac",
    whatsapp: "+201013403675",
    whatsappUrl:
      "https://wa.me/201013403675?text=" +
      encodeURIComponent("السلام عليكم، حابب أأكد حضوري لفرح غانم وأمنية 💍❤️"),
    audioSrc: "/audio/ho-habibi.mp3",
    weddingDateISO: "2026-08-14T19:00:00+03:00",
  };

  // Expose for debugging / static pages
  window.WeddingInvitation = WEDDING;

  /**
   * Countdown helper (vanilla)
   */
  function getTimeLeft(targetMs) {
    var diff = Math.max(0, targetMs - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  /**
   * Bind location + guests buttons if present in DOM
   */
  function bindActionButtons() {
    document.querySelectorAll("[data-wedding-maps]").forEach(function (el) {
      el.setAttribute("href", WEDDING.mapsUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });

    document.querySelectorAll("[data-wedding-whatsapp]").forEach(function (el) {
      el.setAttribute("href", WEDDING.whatsappUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  /**
   * Simple audio toggle for static markup
   */
  function bindMusic(buttonSelector, src) {
    var btn = document.querySelector(buttonSelector);
    if (!btn) return;

    var audio = new Audio(src || WEDDING.audioSrc);
    audio.loop = true;
    audio.volume = 0.55;
    var playing = false;

    btn.addEventListener("click", function () {
      if (playing) {
        audio.pause();
        playing = false;
        btn.classList.remove("playing");
        return;
      }
      audio
        .play()
        .then(function () {
          playing = true;
          btn.classList.add("playing");
        })
        .catch(function () {
          alert(
            "تعذر تشغيل الأغنية.\nضع الملف في: public/audio/ho-habibi.mp3"
          );
        });
    });
  }

  /**
   * Vanilla fireworks (canvas) — optional for static pages
   */
  function startFireworks(canvas) {
    if (!canvas || !canvas.getContext) return function () {};

    var ctx = canvas.getContext("2d");
    var w, h, raf;
    var particles = [];
    var last = 0;
    var colors = ["#ffd700", "#f5e6a8", "#ff6b6b", "#54a0ff", "#fff", "#d4af37"];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function boom(x, y, color) {
      for (var i = 0; i < 60; i++) {
        var a = (Math.PI * 2 * i) / 60;
        var s = 1.5 + Math.random() * 4;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          color: color,
          size: 1.5 + Math.random() * 2,
        });
      }
    }

    function launch() {
      boom(w * (0.15 + Math.random() * 0.7), h * (0.15 + Math.random() * 0.4), colors[(Math.random() * colors.length) | 0]);
    }

    function loop(t) {
      raf = requestAnimationFrame(loop);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (t - last > 600) {
        launch();
        last = t;
      }

      particles = particles.filter(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.life -= 0.012;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);

    return function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindActionButtons();
    // Example: bindMusic("#music-btn");
  });

  // Export helpers
  window.WeddingInvitationHelpers = {
    getTimeLeft: getTimeLeft,
    bindActionButtons: bindActionButtons,
    bindMusic: bindMusic,
    startFireworks: startFireworks,
  };
})();
