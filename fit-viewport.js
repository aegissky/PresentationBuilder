/*!
 * fit-viewport.js — v5 · 세로 균형 자동 맞춤
 * [INSTR 2026-04-28] 가로 미변경 / 세로 균형 정책
 *  - 콘텐츠가 화면보다 짧음 → 위·아래 여백 균등(중앙정렬)
 *  - 콘텐츠가 화면보다 약간 김 → --vfit-k 로 가볍게 압축 (최소 0.82)
 *  - 그래도 넘치면 → 스크롤 허용 (강제 압축 금지)
 *  - 확장(k>1)은 비활성화 — 짧다고 padding/font를 부풀리지 않음
 */
(function () {
    'use strict';

    const MIN_K = 0.82;            /* 압축 한계 — 더 이상 줄이지 않음 */
    const TOP_RESERVED = 14;       /* 상단 엣지(12px) + 안전여백 */
    const BOTTOM_RESERVED = 4;
    const MAX_ITER = 5;
    const SAFETY_DOWN = 0.985;
    const PAD_VAR = '--vfit-pad-top';   /* 중앙정렬용 추가 상단 패딩 */
    const K_VAR = '--vfit-k';
    /* [INSTR 2026-04-29] 페이지별 수동 세로 조절 */
    const MANUAL_MIN = 0.6;
    const MANUAL_MAX = 1.4;
    const MANUAL_STEP = 0.05;
    const MANUAL_KEY_PREFIX = 'kickoff-page-zoom::';
    function getPageId() {
        return (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    }
    function manualKey(){ return MANUAL_KEY_PREFIX + getPageId(); }
    function getManualK() {
        try {
            const v = parseFloat(localStorage.getItem(manualKey()));
            if (!isNaN(v) && v >= MANUAL_MIN && v <= MANUAL_MAX) return v;
        } catch(_) {}
        return null;
    }
    function setManualK(k) {
        const c = Math.max(MANUAL_MIN, Math.min(MANUAL_MAX, k));
        try { localStorage.setItem(manualKey(), String(c)); } catch(_) {}
        return c;
    }
    function clearManualK() {
        try { localStorage.removeItem(manualKey()); } catch(_) {}
    }

    function getMode() {
        return document.documentElement.getAttribute('data-mode');
    }
    function applyK(k) {
        document.documentElement.style.setProperty(K_VAR, String(k));
    }
    function clearK() {
        document.documentElement.style.removeProperty(K_VAR);
    }
    function applyPad(px) {
        document.documentElement.style.setProperty(PAD_VAR, px + 'px');
    }
    function clearPad() {
        document.documentElement.style.removeProperty(PAD_VAR);
    }
    /* 실제 콘텐츠 하단 위치 측정 — documentElement.scrollHeight 는 viewport 높이 미만으로 줄지 않으므로 부정확
       대신 메인 콘텐츠 컨테이너의 getBoundingClientRect().bottom 사용 */
    function getContentBottom() {
        void document.documentElement.offsetHeight;
        const page = document.querySelector('main.bk-page, .bk-page, .cover');
        if (!page) {
            /* 폴백: body 마지막 자식의 bottom */
            const last = document.body.lastElementChild;
            if (!last) return 0;
            return last.getBoundingClientRect().bottom + window.scrollY;
        }
        return page.getBoundingClientRect().bottom + window.scrollY;
    }

    function fit() {
        const mode = getMode();
        if (!mode) {
            clearK();
            clearPad();
            return;
        }

        /* 측정 전 스크롤 0으로 정렬 — getBoundingClientRect 기준점 통일 */
        try { window.scrollTo(0, 0); } catch (e) {}

        /* [INSTR 2026-04-29] 페이지별 수동 K 우선 적용 — 자동 fit 건너뜀 */
        const manualK = getManualK();
        if (manualK !== null) {
            applyK(manualK);
            clearPad();
            /* 수동 K 적용 후 콘텐츠가 화면보다 짧으면 위/아래 균등 여백 */
            const avail2 = window.innerHeight - BOTTOM_RESERVED;
            const bottom2 = getContentBottom();
            if (bottom2 <= avail2) {
                const room = avail2 - bottom2;
                const extra = Math.max(0, Math.floor(room / 2));
                if (extra > 0) applyPad(extra);
            }
            updateZoomFab();
            return;
        }

        applyK(1);
        clearPad();
        const avail = window.innerHeight - BOTTOM_RESERVED;
        let bottom = getContentBottom();

        /* 콘텐츠가 화면 안에 들어감 — 위/아래 균등 여백 (중앙정렬) */
        if (bottom <= avail) {
            const room = avail - bottom;
            const extra = Math.max(0, Math.floor(room / 2));
            if (extra > 0) applyPad(extra);
            return;
        }

        /* 가벼운 압축 — MIN_K 까지만 */
        let k = Math.max(MIN_K, (avail / bottom) * SAFETY_DOWN);
        applyK(k);
        for (let i = 0; i < MAX_ITER; i++) {
            bottom = getContentBottom();
            if (bottom <= avail) {
                const room = avail - bottom;
                const extra = Math.max(0, Math.floor(room / 2));
                if (extra > 0) applyPad(extra);
                return;
            }
            if (k <= MIN_K + 1e-3) {
                /* 최소까지 줄였는데 여전히 넘침 → 스크롤 허용 */
                return;
            }
            const next = Math.max(MIN_K, k * (avail / bottom) * SAFETY_DOWN);
            if (Math.abs(next - k) < 1e-3) return;
            k = next;
            applyK(k);
        }
    }

    let resizeTimer = null;
    function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fit, 120);
    }

    function init() {
        fit();
        window.addEventListener('resize', onResize);

        new MutationObserver(fit).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-mode']
        });

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(fit).catch(() => {});
        }

        const imgs = document.querySelectorAll('img');
        let pending = 0;
        imgs.forEach(img => {
            if (!img.complete) {
                pending++;
                img.addEventListener('load', () => { pending--; if (pending === 0) fit(); });
                img.addEventListener('error', () => { pending--; if (pending === 0) fit(); });
            }
        });
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    /* [INSTR 2026-04-28] Frame Mode 토글 — 상단 영역 위치 고정, 본문만 vfit 적용
       - data-fit-mode="frame" 또는 unset(fluid)
       - localStorage 영구 저장, F 키 토글 */
    const FIT_MODE_KEY = 'kickoff-fit-mode';

    function getFitMode() {
        return document.documentElement.getAttribute('data-fit-mode') || 'fluid';
    }
    function setFitMode(mode) {
        if (mode === 'frame') {
            document.documentElement.setAttribute('data-fit-mode', 'frame');
            try { localStorage.setItem(FIT_MODE_KEY, 'frame'); } catch (e) {}
        } else {
            document.documentElement.removeAttribute('data-fit-mode');
            try { localStorage.removeItem(FIT_MODE_KEY); } catch (e) {}
        }
        fit();
    }
    function toggleFitMode() {
        setFitMode(getFitMode() === 'frame' ? 'fluid' : 'frame');
    }

    /* localStorage 복원 — paint 전에 적용하기 위해 IIFE 즉시 실행 */
    try {
        if (localStorage.getItem(FIT_MODE_KEY) === 'frame') {
            document.documentElement.setAttribute('data-fit-mode', 'frame');
        }
    } catch (e) {}

    /* [INSTR 2026-04-28] F 키 충돌(풀스크린) 회피 — Shift+F 로 변경 */
    document.addEventListener('keydown', function (e) {
        if (!(e.shiftKey && (e.key === 'F' || e.key === 'f'))) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        toggleFitMode();
    });

    /* [INSTR 2026-04-29] 페이지별 세로 줌 FAB UI + 단축키 ([ ] \) */
    let _zoomFab = null;
    function buildZoomFab() {
        if (_zoomFab) return _zoomFab;
        const wrap = document.createElement('div');
        wrap.id = 'vfit-zoom-fab';
        wrap.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:10;display:flex;flex-direction:column;gap:4px;background:#19355d;border-radius:24px;padding:6px 4px;box-shadow:0 4px 16px rgba(0,0,0,.3);opacity:.55;transition:opacity .2s';
        wrap.addEventListener('mouseenter', () => wrap.style.opacity = '1');
        wrap.addEventListener('mouseleave', () => wrap.style.opacity = '.55');

        function mkBtn(label, title, fn, color) {
            const b = document.createElement('button');
            b.type = 'button';
            b.title = title;
            b.textContent = label;
            b.style.cssText = 'width:36px;height:32px;border:none;background:' + (color||'transparent') + ';color:#fff;font-size:14px;font-weight:800;cursor:pointer;border-radius:4px;transition:background .15s;font-family:monospace';
            b.addEventListener('mouseenter', () => b.style.background = '#ff5300');
            b.addEventListener('mouseleave', () => b.style.background = (color||'transparent'));
            b.addEventListener('click', e => { e.stopPropagation(); fn(); });
            return b;
        }
        const btnUp = mkBtn('▲', '세로 늘림 (콘텐츠 축소) — [ 키', () => zoomDown());
        const lbl = document.createElement('div');
        lbl.id = 'vfit-zoom-lbl';
        lbl.style.cssText = 'color:#fff;font-size:10px;text-align:center;font-weight:700;font-family:monospace;padding:2px 0';
        lbl.textContent = 'AUTO';
        const btnDn = mkBtn('▼', '세로 줄임 (콘텐츠 확대) — ] 키', () => zoomUp());
        const btnRst = mkBtn('⟲', '자동 맞춤 복원 — \\ 키', () => zoomReset(), 'rgba(255,83,0,.4)');
        wrap.appendChild(btnUp);
        wrap.appendChild(lbl);
        wrap.appendChild(btnDn);
        wrap.appendChild(btnRst);
        document.body.appendChild(wrap);
        _zoomFab = wrap;
        return wrap;
    }
    function updateZoomFab() {
        const lbl = document.getElementById('vfit-zoom-lbl');
        if (!lbl) return;
        const k = getManualK();
        lbl.textContent = k === null ? 'AUTO' : k.toFixed(2);
        lbl.style.color = k === null ? '#fff' : '#ffb84d';
    }
    function zoomDown() {
        const cur = getManualK() ?? parseFloat(getComputedStyle(document.documentElement).getPropertyValue(K_VAR)) || 1;
        setManualK(cur - MANUAL_STEP);
        fit();
    }
    function zoomUp() {
        const cur = getManualK() ?? parseFloat(getComputedStyle(document.documentElement).getPropertyValue(K_VAR)) || 1;
        setManualK(cur + MANUAL_STEP);
        fit();
    }
    function zoomReset() {
        clearManualK();
        fit();
    }

    /* DOM ready 후 FAB 생성 + 라벨 갱신 */
    function ensureFab() {
        if (!document.body) return;
        buildZoomFab();
        updateZoomFab();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureFab);
    } else {
        ensureFab();
    }

    /* 단축키 — [ : 늘림 / ] : 줄임 / \ : 리셋 (입력 필드 외) */
    document.addEventListener('keydown', function(e){
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === '[') { e.preventDefault(); zoomDown(); }
        else if (e.key === ']') { e.preventDefault(); zoomUp(); }
        else if (e.key === '\\') { e.preventDefault(); zoomReset(); }
    });

    window.__fitViewport = {
        recalc: fit,
        setK: applyK,
        clearK: clearK,
        clearPad: clearPad,
        getFitMode: getFitMode,
        setFitMode: setFitMode,
        toggleFitMode: toggleFitMode,
        /* [INSTR 2026-04-29] 페이지별 세로 줌 API */
        getPageZoom: getManualK,
        setPageZoom: function(k){ setManualK(k); fit(); },
        resetPageZoom: zoomReset,
        zoomUp: zoomUp,
        zoomDown: zoomDown
    };
})();
