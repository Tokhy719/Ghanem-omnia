/**
 * Wedding Invitation Website Script
 * Fully animated using Three.js and GSAP. Includes:
 * 1. 3D Envelope Scene with click-to-open and card slide-out animation.
 * 2. High-performance canvas-based falling rose petals.
 * 3. Glittering golden sparkles.
 * 4. Interactive, colorful fireworks at the end of the page.
 * 5. Audio Player controls (custom music toggle).
 * 6. High-accuracy countdown timer.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let isMusicPlaying = false;
    let isOpened = false;
    const weddingDate = new Date('August 14, 2026 20:00:00').getTime();

    // DOM Elements
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    const envelopeScreen = document.getElementById('envelope-screen');
    const invitationScreen = document.getElementById('invitation-screen');
    const clickTrigger = document.getElementById('click-trigger');
    const threeContainer = document.getElementById('three-container');

    // Countdown Timer Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Canvas contexts
    const petalsCanvas = document.getElementById('rose-petals-canvas');
    const sparklesCanvas = document.getElementById('sparkles-canvas');
    const fireworksCanvas = document.getElementById('fireworks-canvas');

    // --- 1. AUDIO CONTROLLER ---
    function toggleMusic() {
        if (!bgMusic) return;
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
            isMusicPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicToggle.classList.add('playing');
                isMusicPlaying = true;
            }).catch(err => {
                console.log("الرجاء التفاعل مع الصفحة أولاً لتشغيل الصوت:", err);
            });
        }
    }

    musicToggle.addEventListener('click', toggleMusic);

    // --- 2. COUNTDOWN TIMER ---
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // --- 3. THREE.JS 3D ENVELOPE CREATION ---
    let scene, camera, renderer, envelopeGroup, flapPivot, cardMesh, waxSealMesh;
    let isHovering = false;

    function init3D() {
        const width = threeContainer.clientWidth;
        const height = threeContainer.clientHeight;

        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xfbfbf9, 0.015);

        // Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 10);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        threeContainer.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionLight(0xfff8e7, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 25;
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xdfba6b, 1.5, 15);
        pointLight.position.set(0, -2, 4);
        scene.add(pointLight);

        // Materials
        const envelopeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xfaf8f4,
            roughness: 0.25,
            metalness: 0.05,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xdfba6b,
            metalness: 0.85,
            roughness: 0.15,
            side: THREE.DoubleSide
        });

        const cardMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.1,
            metalness: 0.0
        });

        // Envelope Group
        envelopeGroup = new THREE.Group();
        scene.add(envelopeGroup);

        // 1. Back pocket panel
        const backGeometry = new THREE.BoxGeometry(5.2, 3.6, 0.08);
        const backMesh = new THREE.Mesh(backGeometry, envelopeMaterial);
        backMesh.receiveShadow = true;
        envelopeGroup.add(backMesh);

        // 2. Right Front Panel (triangular fold)
        const rightShape = new THREE.Shape();
        rightShape.moveTo(2.6, 1.8);
        rightShape.lineTo(2.6, -1.8);
        rightShape.lineTo(0.5, 0);
        rightShape.lineTo(2.6, 1.8);
        const rightGeom = new THREE.ShapeGeometry(rightShape);
        const rightMesh = new THREE.Mesh(rightGeom, envelopeMaterial);
        rightMesh.position.z = 0.06;
        envelopeGroup.add(rightMesh);

        // Golden trim for right panel
        const rightTrim = new THREE.LineSegments(
            new THREE.EdgesGeometry(rightGeom),
            new THREE.LineBasicMaterial({ color: 0xdfba6b, linewidth: 2 })
        );
        rightTrim.position.z = 0.061;
        envelopeGroup.add(rightTrim);

        // 3. Left Front Panel (triangular fold)
        const leftShape = new THREE.Shape();
        leftShape.moveTo(-2.6, 1.8);
        leftShape.lineTo(-2.6, -1.8);
        leftShape.lineTo(-0.5, 0);
        leftShape.lineTo(-2.6, 1.8);
        const leftGeom = new THREE.ShapeGeometry(leftShape);
        const leftMesh = new THREE.Mesh(leftGeom, envelopeMaterial);
        leftMesh.position.z = 0.06;
        envelopeGroup.add(leftMesh);

        // Golden trim for left panel
        const leftTrim = new THREE.LineSegments(
            new THREE.EdgesGeometry(leftGeom),
            new THREE.LineBasicMaterial({ color: 0xdfba6b, linewidth: 2 })
        );
        leftTrim.position.z = 0.061;
        envelopeGroup.add(leftTrim);

        // 4. Bottom Front Panel (triangular fold)
        const bottomShape = new THREE.Shape();
        bottomShape.moveTo(-2.6, -1.8);
        bottomShape.lineTo(2.6, -1.8);
        bottomShape.lineTo(0, 0.2);
        bottomShape.lineTo(-2.6, -1.8);
        const bottomGeom = new THREE.ShapeGeometry(bottomShape);
        const bottomMesh = new THREE.Mesh(bottomGeom, envelopeMaterial);
        bottomMesh.position.z = 0.08;
        envelopeGroup.add(bottomMesh);

        // 5. Flap Group (for proper pivot rotation)
        flapPivot = new THREE.Group();
        flapPivot.position.set(0, 1.8, 0.04); // Pivot on top edge of the envelope
        envelopeGroup.add(flapPivot);

        const flapShape = new THREE.Shape();
        flapShape.moveTo(-2.6, 0);
        flapShape.lineTo(2.6, 0);
        flapShape.lineTo(0, -1.8); // Points downward when closed
        flapShape.lineTo(-2.6, 0);
        
        const flapGeom = new THREE.ShapeGeometry(flapShape);
        const flapMesh = new THREE.Mesh(flapGeom, envelopeMaterial);
        flapPivot.add(flapMesh);

        // Golden border for top flap
        const flapTrim = new THREE.LineSegments(
            new THREE.EdgesGeometry(flapGeom),
            new THREE.LineBasicMaterial({ color: 0xdfba6b })
        );
        flapTrim.position.z = 0.005;
        flapPivot.add(flapTrim);

        // 6. Wax Seal (gorgeous gold medallion)
        const sealGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 32);
        sealGeom.rotateX(Math.PI / 2);
        waxSealMesh = new THREE.Mesh(sealGeom, goldMaterial);
        // Positioned over the closed envelope flap tip
        waxSealMesh.position.set(0, -1.65, 0.12);
        flapPivot.add(waxSealMesh);

        // 7. Invitation Card Inside
        const cardGeom = new THREE.PlaneGeometry(4.8, 3.2);
        cardMesh = new THREE.Mesh(cardGeom, cardMaterial);
        cardMesh.position.set(0, 0, -0.01); // Nested inside the envelope pocket
        envelopeGroup.add(cardMesh);

        // Add visual text mockup onto the 3D Card for depth
        const canvasCard = document.createElement('canvas');
        canvasCard.width = 512;
        canvasCard.height = 384;
        const ctxCard = canvasCard.getContext('2d');
        ctxCard.fillStyle = '#ffffff';
        ctxCard.fillRect(0, 0, 512, 384);
        // Gold border
        ctxCard.strokeStyle = '#dfba6b';
        ctxCard.lineWidth = 12;
        ctxCard.strokeRect(20, 20, 472, 344);
        ctxCard.lineWidth = 2;
        ctxCard.strokeRect(30, 30, 452, 324);
        // Text
        ctxCard.fillStyle = '#3d3321';
        ctxCard.font = 'bold 36px Amiri, serif';
        ctxCard.textAlign = 'center';
        ctxCard.fillText('دعوة زفاف', 256, 100);
        ctxCard.font = 'bold 44px Amiri, serif';
        ctxCard.fillStyle = '#c49e4d';
        ctxCard.fillText('غانم & أمنية', 256, 180);
        ctxCard.font = '24px Cairo, sans-serif';
        ctxCard.fillStyle = '#8c7b60';
        ctxCard.fillText('بكل الحب والسرور ندعوكم', 256, 250);
        ctxCard.fillText('حضور زفافنا البهيج', 256, 290);

        const cardTexture = new THREE.CanvasTexture(canvasCard);
        cardMaterial.map = cardTexture;
        cardMaterial.needsUpdate = true;

        // Start floating/idle animation
        animate3D();
    }

    // Floating/hover loop variables
    let floatTime = 0;

    function animate3D() {
        requestAnimationFrame(animate3D);

        if (!isOpened) {
            floatTime += 0.015;
            envelopeGroup.position.y = Math.sin(floatTime) * 0.15;
            envelopeGroup.rotation.y = Math.cos(floatTime * 0.7) * 0.15;
            envelopeGroup.rotation.x = Math.sin(floatTime * 0.5) * 0.08;
        }

        renderer.render(scene, camera);
    }

    // --- 4. OPENING CINEMATIC ANIMATION ---
    function openEnvelope() {
        if (isOpened) return;
        isOpened = true;

        // Stop user hints
        const openerHint = document.getElementById('opener-hint');
        if (openerHint) {
            gsap.to(openerHint, { opacity: 0, y: 30, duration: 0.6, pointerEvents: 'none' });
        }

        // Play music immediately
        if (bgMusic && bgMusic.paused) {
            toggleMusic();
        }

        // Cinematic timeline with GSAP
        const tl = gsap.timeline({
            onComplete: () => {
                // Smooth transition to high-fidelity HTML screen
                gsap.to(envelopeScreen, {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power2.inOut",
                    onComplete: () => {
                        envelopeScreen.style.display = 'none';
                        // Clean up Three.js resources
                        renderer.dispose();
                    }
                });

                // Display invitation screen with luxurious staggered fades
                invitationScreen.classList.remove('pointer-events-none');
                gsap.to(invitationScreen, {
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out"
                });

                // Staggered contents animation inside the card
                gsap.fromTo("#invitation-screen .bg-white\\/80 > *", 
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 1.2, stagger: 0.25, ease: "power4.out" }
                );

                // Trigger amazing fireworks
                startFireworks();
            }
        });

        // Step 1: Align envelope to center camera perfectly
        tl.to(envelopeGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.8, ease: "power2.out" });
        tl.to(envelopeGroup.position, { y: -0.5, duration: 0.8, ease: "power2.out" }, "-=0.8");
        tl.to(camera.position, { z: 7.5, duration: 0.8, ease: "power2.out" }, "-=0.8");

        // Step 2: Wax seal dissolves
        tl.to(waxSealMesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.4, ease: "back.in" });
        tl.to(waxSealMesh.position, { y: -2, opacity: 0, duration: 0.4 }, "-=0.4");

        // Step 3: Rotate Top Flap up (open rotation)
        tl.to(flapPivot.rotation, { x: Math.PI * 0.9, duration: 1.0, ease: "power1.inOut" });

        // Step 4: Card slides out elegantly
        tl.to(cardMesh.position, { 
            y: 2.5, 
            z: 0.3,
            duration: 1.4, 
            ease: "back.out(1.2)" 
        }, "-=0.2");

        // Step 5: Hover and approach camera
        tl.to(envelopeGroup.position, { y: -3, duration: 1.2, ease: "power2.inOut" }, "-=0.8");
        tl.to(cardMesh.scale, { x: 1.25, y: 1.25, duration: 1.2, ease: "power2.out" }, "-=1.0");
        tl.to(cardMesh.position, { y: 3.5, duration: 1.2, ease: "power2.out" }, "-=1.2");
    }

    // Trigger open on click
    clickTrigger.addEventListener('click', openEnvelope);
    threeContainer.addEventListener('click', openEnvelope);

    // Initialise 3D Canvas
    init3D();

    // Adjust 3D on window resize
    window.addEventListener('resize', () => {
        if (!isOpened && camera && renderer && threeContainer) {
            const width = threeContainer.clientWidth;
            const height = threeContainer.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
    });


    // --- 5. FALLING ROSE PETALS ---
    const petalsCtx = petalsCanvas.getContext('2d');
    let petalsArray = [];
    const petalImages = [];

    // Let's draw petal-like paths instead of needing external images for absolute offline/GitHub Pages reliability
    function drawPetal(ctx, x, y, size, angle, r, g, b, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        
        // Organic leaf/rose petal path
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size * 1.2, -size * 0.5, -size * 0.8, -size * 1.8, 0, -size * 2);
        ctx.bezierCurveTo(size * 0.8, -size * 1.8, size * 1.2, -size * 0.5, 0, 0);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        // Shading lines
        ctx.strokeStyle = `rgba(${r - 20}, ${g - 20}, ${b - 20}, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-size * 0.2, -size, 0, -size * 1.8);
        ctx.stroke();

        ctx.restore();
    }

    class Petal {
        constructor() {
            this.x = Math.random() * petalsCanvas.width;
            this.y = Math.random() * -petalsCanvas.height - 20;
            this.size = Math.random() * 8 + 8; // 8px to 16px
            this.speedX = Math.random() * 1.5 - 0.5;
            this.speedY = Math.random() * 1.2 + 0.8;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = Math.random() * 0.02 - 0.01;
            this.opacity = Math.random() * 0.4 + 0.5;
            // High luxury wedding colors (soft blush pink, elegant crimson peach)
            this.r = 239 + Math.floor(Math.random() * 16); // 239-255
            this.g = 186 + Math.floor(Math.random() * 20); // 186-206
            this.b = 191 + Math.floor(Math.random() * 20); // 191-211
        }

        update() {
            this.x += this.speedX + Math.sin(floatTime) * 0.15; // drift
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Recycle if fallen below screen
            if (this.y > petalsCanvas.height + 20) {
                this.y = -20;
                this.x = Math.random() * petalsCanvas.width;
                this.opacity = Math.random() * 0.4 + 0.5;
            }
        }

        draw() {
            drawPetal(petalsCtx, this.x, this.y, this.size, this.rotation, this.r, this.g, this.b, this.opacity);
        }
    }

    function initPetals() {
        petalsCanvas.width = window.innerWidth;
        petalsCanvas.height = window.innerHeight;
        petalsArray = [];
        // Add 50 rose petals
        for (let i = 0; i < 50; i++) {
            petalsArray.push(new Petal());
        }
    }

    function animatePetals() {
        petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
        for (let i = 0; i < petalsArray.length; i++) {
            petalsArray[i].update();
            petalsArray[i].draw();
        }
        requestAnimationFrame(animatePetals);
    }

    initPetals();
    animatePetals();


    // --- 6. GOLDEN SHIMMERS / SPARKLES ---
    const sparklesCtx = sparklesCanvas.getContext('2d');
    let sparklesArray = [];

    class Sparkle {
        constructor() {
            this.x = Math.random() * sparklesCanvas.width;
            this.y = Math.random() * sparklesCanvas.height;
            this.size = Math.random() * 2 + 1; // 1px to 3px
            this.alpha = Math.random() * 0.5 + 0.2;
            this.speedY = -(Math.random() * 0.4 + 0.1); // float upwards gently
            this.frequency = Math.random() * 0.05 + 0.01;
            this.phase = Math.random() * Math.PI;
        }

        update() {
            this.y += this.speedY;
            this.phase += this.frequency;
            this.alpha = (Math.sin(this.phase) * 0.4) + 0.5; // sparkle pulse

            if (this.y < -10) {
                this.y = sparklesCanvas.height + 10;
                this.x = Math.random() * sparklesCanvas.width;
            }
        }

        draw() {
            sparklesCtx.save();
            // Draw a glowing cross or standard dot
            sparklesCtx.fillStyle = `rgba(223, 186, 107, ${this.alpha})`;
            sparklesCtx.shadowBlur = 8;
            sparklesCtx.shadowColor = '#dfba6b';
            
            sparklesCtx.beginPath();
            // Core
            sparklesCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            sparklesCtx.fill();

            // Flare lines for larger sparkles
            if (this.size > 2.2) {
                sparklesCtx.strokeStyle = `rgba(223, 186, 107, ${this.alpha * 0.4})`;
                sparklesCtx.lineWidth = 0.5;
                sparklesCtx.beginPath();
                sparklesCtx.moveTo(this.x - 6, this.y);
                sparklesCtx.lineTo(this.x + 6, this.y);
                sparklesCtx.moveTo(this.x, this.y - 6);
                sparklesCtx.lineTo(this.x, this.y + 6);
                sparklesCtx.stroke();
            }

            sparklesCtx.restore();
        }
    }

    function initSparkles() {
        sparklesCanvas.width = window.innerWidth;
        sparklesCanvas.height = window.innerHeight;
        sparklesArray = [];
        for (let i = 0; i < 60; i++) {
            sparklesArray.push(new Sparkle());
        }
    }

    function animateSparkles() {
        sparklesCtx.clearRect(0, 0, sparklesCanvas.width, sparklesCanvas.height);
        for (let i = 0; i < sparklesArray.length; i++) {
            sparklesArray[i].update();
            sparklesArray[i].draw();
        }
        requestAnimationFrame(animateSparkles);
    }

    initSparkles();
    animateSparkles();


    // --- 7. FIREWORKS GENERATOR (Page Bottom Activation / Card Open) ---
    const fxCtx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let particles = [];
    let allowFireworks = false;

    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
            this.distanceTraveled = 0;
            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 2;
            this.acceleration = 1.05;
            this.brightness = random(50, 70);
            this.targetRadius = 1;
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            if (this.targetRadius < 8) {
                this.targetRadius += 0.3;
            } else {
                this.targetRadius = 1;
            }

            this.speed *= this.acceleration;

            const vx = Math.cos(this.angle) * this.speed;
            const vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

            if (this.distanceTraveled >= this.distanceToTarget) {
                createParticles(this.tx, this.ty);
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        }

        draw() {
            fxCtx.beginPath();
            fxCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            fxCtx.lineTo(this.x, this.y);
            // Elegant gold and white trail
            fxCtx.strokeStyle = `hsla(39, 70%, ${this.brightness}%, 0.8)`;
            fxCtx.lineWidth = 1.5;
            fxCtx.stroke();
        }
    }

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.coordinates = [];
            this.coordinateCount = 5;
            while (this.coordinateCount--) {
                this.coordinates.push([this.x, this.y]);
            }
            this.angle = random(0, Math.PI * 2);
            this.speed = random(1, 10);
            this.friction = 0.95;
            this.gravity = 0.8; // fall downwards
            // Golden-Champagne palettes: Hues between 35 and 45
            this.hue = random(35, 48); 
            this.brightness = random(60, 85);
            this.alpha = 1;
            this.decay = random(0.015, 0.03);
        }

        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;

            if (this.alpha <= this.decay) {
                particles.splice(index, 1);
            }
        }

        draw() {
            fxCtx.beginPath();
            fxCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            fxCtx.lineTo(this.x, this.y);
            fxCtx.strokeStyle = `hsla(${this.hue}, 80%, ${this.brightness}%, ${this.alpha})`;
            fxCtx.lineWidth = 2;
            fxCtx.stroke();
        }
    }

    function createParticles(x, y) {
        let particleCount = 40;
        while (particleCount--) {
            particles.push(new Particle(x, y));
        }
    }

    function calculateDistance(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Launch random firework
    let fireworkTimer = 0;
    function animateFireworks() {
        if (!allowFireworks) return;

        fxCtx.globalCompositeOperation = 'destination-out';
        fxCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        fxCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        fxCtx.globalCompositeOperation = 'lighter';

        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        let j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }

        if (fireworkTimer >= 35) {
            // Launch from bottom, aim to top 60% of screen
            const startX = random(50, fireworksCanvas.width - 50);
            const targetX = random(50, fireworksCanvas.width - 50);
            const targetY = random(50, fireworksCanvas.height * 0.5);
            fireworks.push(new Firework(startX, fireworksCanvas.height, targetX, targetY));
            fireworkTimer = 0;
        } else {
            fireworkTimer++;
        }

        requestAnimationFrame(animateFireworks);
    }

    function startFireworks() {
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
        allowFireworks = true;
        animateFireworks();
    }

    // Trigger fireworks automatically periodically when scrolled to bottom
    window.addEventListener('scroll', () => {
        if (isOpened) {
            const d = document.documentElement;
            const offset = d.scrollTop + window.innerHeight;
            const height = d.offsetHeight;

            // Near bottom of invitation
            if (height - offset < 100) {
                // Instantly generate a burst of fireworks
                const centerW = window.innerWidth / 2;
                createParticles(centerW - 100, window.innerHeight * 0.4);
                createParticles(centerW + 100, window.innerHeight * 0.3);
            }
        }
    });

    // Resize all canvases with window resize
    window.addEventListener('resize', () => {
        petalsCanvas.width = window.innerWidth;
        petalsCanvas.height = window.innerHeight;
        sparklesCanvas.width = window.innerWidth;
        sparklesCanvas.height = window.innerHeight;
        if (allowFireworks) {
            fireworksCanvas.width = window.innerWidth;
            fireworksCanvas.height = window.innerHeight;
        }
    });
});
