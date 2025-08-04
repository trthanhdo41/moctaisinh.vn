const targetNumbers = [500, 200, 50, 1000];
let countersStarted = false;
function createParticle(x, y, color) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${x}px;
        top: ${y}px;
        animation: particleFloat 1s ease-out forwards;
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}
function animateCounter(elementId, target, duration = 3000) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }
    element.classList.add('counter-typing');
    let start = 0;
    const startTime = Date.now();
    let lastNumber = 0;
    function easeOutElastic(t) {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
    function easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutElastic(progress);
        start = target * easedProgress;
        const currentNumber = Math.floor(start);
        if (progress >= 1) {
            start = target;
            clearInterval(timer);
            element.classList.add('counter-final');
            element.classList.remove('counter-typing');
            const rect = element.getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createParticle(
                        rect.left + rect.width / 2 + (Math.random() - 0.5) * 100,
                        rect.top + rect.height / 2 + (Math.random() - 0.5) * 100,
                        '#3b5d50'
                    );
                }, i * 50);
            }
            setTimeout(() => {
                element.classList.remove('counter-final');
            }, 1000);
        }
        if (currentNumber !== lastNumber) {
            const formattedNumber = currentNumber.toLocaleString('vi-VN');
            element.textContent = formattedNumber + '+';
            lastNumber = currentNumber;
            element.style.transform = `scale(${1 + (progress * 0.1)})`;
            element.style.filter = `hue-rotate(${progress * 30}deg)`;
            if (Math.random() > 0.7) {
                const rect = element.getBoundingClientRect();
                createParticle(
                    rect.left + Math.random() * rect.width,
                    rect.top + Math.random() * rect.height,
                    `hsl(${120 + progress * 60}, 70%, 50%)`
                );
            }
        }
    }, 20);
}
function setupIntersectionObserver() {
    const options = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                startCounters();
            }
        });
    }, options);
    const counter1 = document.getElementById('counter1');
    if (counter1) {
        observer.observe(counter1);
    }
}
function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    const statsContainer = document.querySelector('#counter1')?.closest('.row')?.parentElement;
    if (statsContainer) {
        statsContainer.classList.add('ripple-effect');
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElement('div');
                ripple.className = 'ripple-wave';
                statsContainer.appendChild(ripple);
                setTimeout(() => ripple.remove(), 1000);
            }, i * 200);
        }
    }
    const delays = [0, 400, 800, 1200];
    targetNumbers.forEach((target, index) => {
        setTimeout(() => {
            animateCounter(`counter${index + 1}`, target);
        }, delays[index]);
    });
}
function addAdvancedStyles() {
    if (document.getElementById('advanced-counter-styles')) return;
    const style = document.createElement('style');
    style.id = 'advanced-counter-styles';
    style.textContent = `
        .stat-item {
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(59, 93, 80, 0.1), transparent);
            transition: left 0.6s ease;
        }
        .stat-item:hover::before {
            left: 100%;
        }
        .stat-item:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(59, 93, 80, 0.15);
        }
        .counter-typing {
            animation: typing 0.1s ease-in-out;
            position: relative;
        }
        .counter-typing::after {
            content: '|';
            animation: blink 1s infinite;
            color: #3b5d50;
            font-weight: bold;
        }
        .counter-final {
            animation: celebration 0.8s ease-out;
        }
        @keyframes typing {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        @keyframes celebration {
            0% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(-5deg); }
            50% { transform: scale(1.1) rotate(5deg); }
            75% { transform: scale(1.15) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(0);
            }
        }
        .ripple-effect {
            position: relative;
            overflow: hidden;
        }
        .ripple-wave {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border: 2px solid rgba(59, 93, 80, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rippleExpand 1s ease-out forwards;
        }
        @keyframes rippleExpand {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }
                 .stat-item h4 {
             color: #ffffff !important;
             -webkit-text-fill-color: #ffffff !important;
             text-shadow: none !important;
             transition: all 0.3s ease;
         }
         .stat-item:hover h4 {
             color: #ffffff !important;
             -webkit-text-fill-color: #ffffff !important;
             text-shadow: 0 0 10px rgba(255,255,255,0.5) !important;
         }
    `;
    document.head.appendChild(style);
}
function initAdvancedCounter() {
    addAdvancedStyles();
    setupIntersectionObserver();
    window.addEventListener('scroll', () => {
        const counter1 = document.getElementById('counter1');
        if (counter1 && !countersStarted) {
            const rect = counter1.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
                startCounters();
            }
        }
    }, { passive: true });
    window.addEventListener('load', () => {
        setTimeout(() => {
            const counter1 = document.getElementById('counter1');
            if (counter1 && counter1.getBoundingClientRect().top < window.innerHeight) {
                startCounters();
            }
        }, 500);
    });
    document.addEventListener('footerLoaded', () => {
        setTimeout(setupIntersectionObserver, 500);
    });
}
initAdvancedCounter(); 