/* ═══════════════════════════════════════════════════════
   AI · Sci-Fi 테마 동적 효과 (별, 오브, 유성)
   data-theme="ai" 활성화 시에만 파티클 레이어 생성
   data-theme 바뀌면 자동 제거
═══════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const STARS = 90;
    const STREAKS = 2;
    let layer = null;
    let observer = null;

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme');
    }

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createLayer() {
        if (layer) return;
        const root = document.createElement('div');
        root.className = 'ai-stars';
        root.setAttribute('aria-hidden', 'true');

        // 성운 오브
        ['cyan', 'magenta', 'indigo'].forEach(cls => {
            const o = document.createElement('div');
            o.className = 'ai-orb ' + cls;
            root.appendChild(o);
        });

        // 별 파티클
        const frag = document.createDocumentFragment();
        for (let i = 0; i < STARS; i++) {
            const s = document.createElement('div');
            s.className = 'ai-star';
            const r = Math.random();
            if (r < 0.18) s.classList.add('c');
            else if (r < 0.28) s.classList.add('m');

            const size = rand(1, 3);
            s.style.width = size + 'px';
            s.style.height = size + 'px';
            s.style.left = rand(0, 100) + '%';
            s.style.top = rand(0, 100) + '%';
            s.style.setProperty('--dur', rand(2, 6).toFixed(2) + 's');
            s.style.setProperty('--delay', (-rand(0, 5)).toFixed(2) + 's');
            s.style.setProperty('--min', rand(0.1, 0.4).toFixed(2));
            frag.appendChild(s);
        }

        // 유성
        for (let i = 0; i < STREAKS; i++) {
            const t = document.createElement('div');
            t.className = 'ai-streak';
            t.style.setProperty('--sx', rand(-100, 40) + 'vw');
            t.style.setProperty('--sy', rand(-40, 20) + 'vh');
            t.style.animationDelay = (-rand(0, 7)).toFixed(2) + 's';
            t.style.animationDuration = rand(6, 11).toFixed(2) + 's';
            frag.appendChild(t);
        }

        root.appendChild(frag);
        document.body.appendChild(root);
        layer = root;
    }

    function destroyLayer() {
        if (layer) {
            layer.remove();
            layer = null;
        }
    }

    function sync() {
        if (currentTheme() === 'ai') createLayer();
        else destroyLayer();
    }

    function attachObserver() {
        if (observer) return;
        observer = new MutationObserver(muts => {
            for (const m of muts) {
                if (m.type === 'attributes' && m.attributeName === 'data-theme') {
                    sync();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    function init() {
        attachObserver();
        sync();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
