/*!
 * mode-selector.js
 * 첫 진입 시 모드 선택 다이얼로그 + 프리젠테이션 키보드 네비게이션
 * - 모드: 'edit' | 'presentation'
 * - 저장 키: kickoff-mode, kickoff-mode-auto-apply
 * - 키보드: ←↑PgUp(이전) / →↓PgDn/Space(다음) / Home(목차) / Esc(다이얼로그) / F(풀스크린)
 */
(function () {
    'use strict';

    const MODE_KEY = 'kickoff-mode';
    const AUTO_KEY = 'kickoff-mode-auto-apply';
    const FIT_MODE_KEY = 'kickoff-fit-mode';   /* [INSTR 2026-04-28] 활성 핏 모드 (anti-flicker 가 읽음) */
    /* [INSTR 2026-04-29] 모드별 독립 핏 모드 저장 — 편집/프리젠테이션 각각 사용자 선택 보존 */
    const FIT_PREF_KEY = function (mode) { return 'kickoff-fit-mode-' + mode; };
    const VALID = ['edit', 'presentation'];
    const VALID_FIT = ['fluid', 'frame'];

    /* ─ 상태 ─ */
    function getMode() {
        try { return localStorage.getItem(MODE_KEY); } catch (_) { return null; }
    }
    function setMode(m) {
        if (!VALID.includes(m)) return;
        document.documentElement.setAttribute('data-mode', m);
        try { localStorage.setItem(MODE_KEY, m); } catch (_) {}
        setAuto(true); /* 모드를 명시적으로 선택하면 이후 페이지에 자동 적용 */
        syncEditMode(m);
        /* [INSTR 2026-04-29] 모드 전환 시 해당 모드의 핏 선호 자동 복원 */
        try {
            var pref = localStorage.getItem(FIT_PREF_KEY(m));
            if (VALID_FIT.includes(pref)) setFitMode(pref);
        } catch (_) {}
        refreshToggleUI();
    }
    function getAuto() {
        try { return localStorage.getItem(AUTO_KEY) === '1'; } catch (_) { return false; }
    }
    function setAuto(v) {
        try { localStorage.setItem(AUTO_KEY, v ? '1' : '0'); } catch (_) {}
    }

    /* [INSTR 2026-04-28] Frame/Fluid 핏 모드 — fit-viewport.js 와 연동 */
    function getFitMode() {
        var v = (function(){ try { return localStorage.getItem(FIT_MODE_KEY); } catch(_){ return null; } })();
        return VALID_FIT.includes(v) ? v : 'fluid';
    }
    function setFitMode(m) {
        if (!VALID_FIT.includes(m)) return;
        if (m === 'frame') {
            document.documentElement.setAttribute('data-fit-mode', 'frame');
            try { localStorage.setItem(FIT_MODE_KEY, 'frame'); } catch (_) {}
        } else {
            document.documentElement.removeAttribute('data-fit-mode');
            try { localStorage.removeItem(FIT_MODE_KEY); } catch (_) {}
        }
        if (window.__fitViewport && window.__fitViewport.recalc) window.__fitViewport.recalc();
        refreshToggleUI();
    }
    function toggleFitMode() {
        setFitMode(getFitMode() === 'frame' ? 'fluid' : 'frame');
    }

    /* [INSTR 2026-04-29] 모드별 핏 선호 저장/조회 — 편집/프리젠테이션 각각 독립 */
    function getFitPref(mode) {
        try {
            var v = localStorage.getItem(FIT_PREF_KEY(mode));
            if (VALID_FIT.includes(v)) return v;
        } catch (_) {}
        /* 폴백: 활성 핏 모드 → fluid */
        return getFitMode();
    }
    function setFitPref(mode, fit) {
        if (!VALID.includes(mode) || !VALID_FIT.includes(fit)) return;
        try { localStorage.setItem(FIT_PREF_KEY(mode), fit); } catch (_) {}
    }

    /* 프리젠테이션 모드면 편집 OFF 강제 */
    function syncEditMode(m) {
        if (m !== 'presentation') return;
        try { localStorage.setItem('kickoff-edit-mode', '0'); } catch (_) {}
        document.body && document.body.classList.remove('kr-edit-mode');
    }

    /* ─ 다이얼로그 ─ */
    function showDialog() {
        if (document.getElementById('mode-dialog')) return;
        const d = document.createElement('div');
        d.id = 'mode-dialog';
        d.className = 'mode-dialog-overlay';
        d.innerHTML = ''
            + '<div class="mode-dialog">'
            + '  <div class="mode-eye">KICKOFF REPORT · 2026</div>'
            + '  <h2>모드를 선택하세요</h2>'
            + '  <p class="mode-sub">{프로젝트명}</p>'
            + '  <div class="mode-cards">'
            + '    <button class="mode-card mode-edit" data-mode="edit" type="button">'
            + '      <div class="mc-icon">✏</div>'
            + '      <h3>편집 모드</h3>'
            + '      <p>내용 편집 · TIP 메모 · JSON 공유</p>'
            + '      <ul>'
            + '        <li>텍스트 더블클릭 편집</li>'
            + '        <li>틀별 TIP 메모 부착</li>'
            + '        <li>JSON 내보내기 / 가져오기</li>'
            + '        <li>테마 전환 · 페이지 이동</li>'
            + '      </ul>'
            + '      <span class="mc-cta">편집 시작</span>'
            + '    </button>'
            + '    <button class="mode-card mode-pres" data-mode="presentation" type="button">'
            + '      <div class="mc-icon">▶</div>'
            + '      <h3>프리젠테이션 모드</h3>'
            + '      <p>발표용 키보드 네비게이션</p>'
            + '      <ul>'
            + '        <li>← 이전 · → 다음 (좌/우 클릭도 가능)</li>'
            + '        <li>Space · PageUp/PageDown 지원</li>'
            + '        <li>↑ ↓ 는 화면 세로 스크롤</li>'
            + '        <li>F 풀스크린 · Home 목차</li>'
            + '      </ul>'
            + '      <span class="mc-cta">발표 시작</span>'
            + '    </button>'
            + '  </div>'
            /* [INSTR 2026-04-29] 핏 모드 — 편집/프리젠테이션 독립 라디오 그룹 (각자 선택 보존) */
            + '  <div class="mode-fit-grid" style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:12px;color:var(--bk-sub,#475569)">'
            + '    <div style="display:flex;gap:12px;justify-content:center">'
            + '      <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mode-fit-edit" value="fluid"><span>Fluid</span></label>'
            + '      <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mode-fit-edit" value="frame"><span>Frame</span></label>'
            + '    </div>'
            + '    <div style="display:flex;gap:12px;justify-content:center">'
            + '      <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mode-fit-presentation" value="fluid"><span>Fluid</span></label>'
            + '      <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mode-fit-presentation" value="frame"><span>Frame</span></label>'
            + '    </div>'
            + '  </div>'
            + '  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:10px;color:var(--bk-muted,#6685BB);text-align:center;margin-top:4px">'
            + '    <div>편집 — 핏 모드 선택</div><div>발표 — 핏 모드 선택</div>'
            + '  </div>'
            + '  <label class="mode-auto">'
            + '    <input type="checkbox" id="mode-auto-cb">'
            + '    <span>다음부터 자동 적용 (재진입 시 다이얼로그 생략)</span>'
            + '  </label>'
            + '  <button class="mode-close" type="button" aria-label="닫기">×</button>'
            + '</div>';
        document.body.appendChild(d);

        const cb = d.querySelector('#mode-auto-cb');
        cb.checked = getAuto();

        /* [INSTR 2026-04-29] 모드별 핏 라디오 초기값 동기화 — 각 모드의 저장된 선호 표시 */
        VALID.forEach(mode => {
            var pref = getFitPref(mode);
            d.querySelectorAll('input[name="mode-fit-' + mode + '"]').forEach(r => {
                if (r.value === pref) r.checked = true;
            });
        });

        d.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                const m = btn.getAttribute('data-mode');
                /* 클릭한 모드 카드의 라디오만 적용 — 다른 모드 선호는 보존 */
                const fitR = d.querySelector('input[name="mode-fit-' + m + '"]:checked');
                if (fitR) {
                    setFitPref(m, fitR.value);   /* 모드별 선호 저장 */
                    setFitMode(fitR.value);      /* 활성 핏 모드 적용 */
                }
                setAuto(cb.checked);
                setMode(m);
                d.remove();
            });
        });

        /* X / 외부 클릭 → 프리젠테이션 자동 적용 + 자동 적용 ON */
        function dismissAsPresentation() {
            cb.checked = true;
            setAuto(true);
            setMode('presentation');
            d.remove();
        }
        d.querySelector('.mode-close').addEventListener('click', dismissAsPresentation);
        d.addEventListener('click', (e) => {
            if (e.target === d) dismissAsPresentation();
        });
    }

    /* ─ 키보드 네비게이션 ─ */
    function isInputTarget(t) {
        if (!t) return false;
        const tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable === true;
    }

    function isPresentation() {
        return document.documentElement.getAttribute('data-mode') === 'presentation';
    }

    /* 이전 풀스크린 유지 플래그가 남아있으면 정리 (자동 풀스크린 복원 방지) */
    try { sessionStorage.removeItem('kickoff-keep-fullscreen'); } catch (_) {}

    /* 활성 링크인지 확인 (#나 빈 href 아님) */
    function isLiveLink(a) {
        if (!a) return false;
        const h = a.getAttribute('href');
        if (!h || h === '#' || h.trim() === '') return false;
        if (a.classList.contains('disabled') || a.classList.contains('off')) return false;
        return true;
    }

    function findPrevLink() {
        /* pages/ 컨벤션 */
        let a = document.querySelector('.page-foot a.prev:not(.disabled)');
        if (isLiveLink(a)) return a;
        /* page00/ 컨벤션 — .pf 의 첫 a (단 .nx 가 아니어야 함) */
        const pfLinks = document.querySelectorAll('.pf a');
        for (const link of pfLinks) {
            if (link.classList.contains('nx')) continue;
            if (isLiveLink(link)) return link;
        }
        return null;
    }
    function findNextLink() {
        let a = document.querySelector('.page-foot a.next:not(.disabled)');
        if (isLiveLink(a)) return a;
        a = document.querySelector('.pf a.nx');
        if (isLiveLink(a)) return a;
        /* 목차(index.html) — pf 네비 없을 시 첫 페이지로 */
        const cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (cur === 'index.html' || cur === '') {
            return { href: '01-1.html' };
        }
        return null;
    }
    function navPrev() {
        const a = findPrevLink();
        if (a) location.href = a.href;
        else flashEdge('left');
    }
    function navNext() {
        const a = findNextLink();
        if (a) location.href = a.href;
        else flashEdge('right');
    }
    function flashEdge(side) {
        const el = document.body;
        if (!el) return;
        const prevTransition = el.style.transition;
        const prevTransform = el.style.transform;
        el.style.transition = 'transform .15s';
        el.style.transform = (prevTransform || '') + (side === 'left' ? ' translateX(8px)' : ' translateX(-8px)');
        setTimeout(() => {
            el.style.transform = prevTransform;
            el.style.transition = prevTransition;
        }, 150);
    }

    /* ─ 마우스 클릭 네비게이션 (프리젠테이션 모드 / 전체 화면 모드) ─ */
    /* 좌측 절반 클릭 → 이전, 우측 절반 클릭 → 다음 */
    const CLICK_IGNORE_SEL = [
        'a', 'button', 'input', 'textarea', 'select', 'label',
        '[contenteditable="true"]',
        '#mode-reset-btn', '#mode-dialog', '#mode-help',
        '#sa-panel', '#sa-tab',
        '.kr-toolbar', '.kr-popover', '.tipmemo-popover',
        '.tipmemo-indicator', '.tipmemo-add-btn',
        '.pf', '.page-foot' /* 페이지 푸터는 별도 영역 */
    ].join(',');

    function onPresentationClick(e) {
        if (!isPresentation() && !document.fullscreenElement) return;
        if (e.button !== 0) return; /* 좌클릭만 */
        if (e.target.closest(CLICK_IGNORE_SEL)) return;
        /* 텍스트 선택 중이면 무시 */
        const sel = window.getSelection && window.getSelection();
        if (sel && sel.toString().length > 0) return;

        const half = window.innerWidth / 2;
        if (e.clientX < half) navPrev();
        else navNext();
    }

    function onKeyDown(e) {
        /* 다이얼로그 자체 키 처리 */
        const dialog = document.getElementById('mode-dialog');
        if (dialog && e.key === 'Escape') {
            e.preventDefault();
            dialog.remove();
            return;
        }

        if (isInputTarget(e.target)) return;

        /* 글로벌 — Esc로 다이얼로그 호출 (어떤 모드든) */
        if (e.key === 'Escape' && !dialog) {
            e.preventDefault();
            showDialog();
            return;
        }

        if (!isPresentation() && !document.fullscreenElement) {
            /* 편집 모드에서도 ← → 방향키로 페이지 이동 */
            if (document.documentElement.getAttribute('data-mode') === 'edit') {
                if (e.key === 'ArrowLeft') { e.preventDefault(); navPrev(); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); navNext(); }
            }
            return;
        }

        switch (e.key) {
            /* ↑ ↓ 는 화면 세로 스크롤용으로 비워둠 */
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault(); navPrev(); break;
            case 'ArrowRight':
            case 'PageDown':
            case ' ':
                e.preventDefault(); navNext(); break;
            case 'Home':
                e.preventDefault(); location.href = 'index.html'; break;
            case 'f':
            case 'F':
                e.preventDefault();
                if (document.fullscreenElement) document.exitFullscreen();
                else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
                break;
            case '?':
                e.preventDefault(); toggleShortcutHelp(); break;
        }
    }

    /* ─ 단축키 도움말 (?) ─ */
    function toggleShortcutHelp() {
        const existing = document.getElementById('mode-help');
        if (existing) { existing.remove(); return; }
        const h = document.createElement('div');
        h.id = 'mode-help';
        h.className = 'mode-help';
        h.innerHTML = ''
            + '<div class="mh-card">'
            + '  <h3>발표 단축키</h3>'
            + '  <table>'
            + '    <tr><td>← PageUp</td><td>이전 페이지</td></tr>'
            + '    <tr><td>→ PageDown Space</td><td>다음 페이지</td></tr>'
            + '    <tr><td>↑ ↓</td><td>화면 세로 스크롤 (네이티브)</td></tr>'
            + '    <tr><td>Home</td><td>목차로</td></tr>'
            + '    <tr><td>F</td><td>풀스크린 토글</td></tr>'
            + '    <tr><td>Shift + F</td><td>핏 모드 토글 (Frame ↔ Fluid)</td></tr>'
            + '    <tr><td>Esc</td><td>모드 선택 다이얼로그</td></tr>'
            + '    <tr><td>?</td><td>이 도움말 토글</td></tr>'
            + '  </table>'
            + '  <button type="button" class="mh-close">닫기</button>'
            + '</div>';
        document.body.appendChild(h);
        h.querySelector('.mh-close').addEventListener('click', () => h.remove());
        h.addEventListener('click', (e) => { if (e.target === h) h.remove(); });
    }

    /* ─ 모드 토글 버튼 (.kr-toolbar에 추가) ─ */
    let modeBtnEl = null;

    function refreshToggleUI() {
        if (!modeBtnEl) return;
        const cur = document.documentElement.getAttribute('data-mode') || 'edit';
        const label = cur === 'presentation' ? '모드: 발표' : '모드: 편집';
        modeBtnEl.firstChild.nodeValue = label + ' ';
        modeBtnEl.classList.toggle('mode-pres-on', cur === 'presentation');
    }

    function buildToggle() {
        let tb = document.querySelector('.kr-toolbar');
        if (!tb) {
            tb = document.createElement('div');
            tb.className = 'kr-toolbar';
            document.body.appendChild(tb);
        }

        const wrap = document.createElement('div');
        wrap.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'kr-btn mode-toggle-btn';
        btn.type = 'button';
        btn.appendChild(document.createTextNode('모드: 편집 '));
        const caret = document.createElement('span');
        caret.textContent = '▾';
        caret.style.opacity = '0.6';
        btn.appendChild(caret);
        modeBtnEl = btn;

        const menu = document.createElement('div');
        menu.className = 'kr-menu';
        const items = [
            { label: '✏  편집 모드', fn: () => setMode('edit') },
            { label: '▶  프리젠테이션 모드', fn: () => setMode('presentation') },
            { label: '─────────', fn: null, separator: true },
            /* [INSTR 2026-04-28] Frame/Fluid 핏 모드 토글 */
            { label: '▦  핏 모드 토글 (Frame ↔ Fluid)', fn: toggleFitMode },
            { label: '⌨  단축키 도움말', fn: toggleShortcutHelp },
            { label: '⟲  다이얼로그 다시 보기', fn: showDialog }
        ];
        items.forEach(item => {
            const a = document.createElement('a');
            a.textContent = item.label;
            if (item.separator) {
                a.style.pointerEvents = 'none';
                a.style.color = 'var(--secondary-500)';
                a.style.fontSize = '10px';
            } else {
                a.addEventListener('click', (e) => {
                    e.stopPropagation();
                    menu.classList.remove('open');
                    item.fn && item.fn();
                });
            }
            menu.appendChild(a);
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            document.querySelectorAll('.kr-menu.open').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        /* 모드 토글은 가장 왼쪽에 배치 */
        if (tb.firstChild) tb.insertBefore(wrap, tb.firstChild);
        else tb.appendChild(wrap);

        refreshToggleUI();
    }

    /* ─ 모드 초기화 (다이얼로그 다시 보기) ─ */
    function resetModeChoice(redirectToIndex) {
        try {
            localStorage.removeItem(MODE_KEY);
            localStorage.removeItem(AUTO_KEY);
        } catch (_) {}
        document.documentElement.removeAttribute('data-mode');
        if (redirectToIndex) {
            location.href = 'index.html';
        } else {
            location.reload();
        }
    }

    /* ─ 우하단 편집 초기화 아이콘 (편집 ON 일 때만 노출) ─ */
    function buildEditResetIcon() {
        if (document.getElementById('edit-reset-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'edit-reset-btn';
        btn.type = 'button';
        btn.title = '이 페이지 편집 내용 초기화';
        btn.setAttribute('aria-label', '편집 초기화');
        /* 지우개 아이콘 */
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17a2.008 2.008 0 0 1 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0z"/><line x1="13" y1="5" x2="20" y2="12"/><line x1="2" y1="22" x2="22" y2="22"/></svg>';
        btn.addEventListener('click', () => {
            const count = (window.__editor && window.__editor.countEdits) ? window.__editor.countEdits() : 0;
            if (count === 0) {
                alert('이 페이지에 편집된 내용이 없습니다.');
                return;
            }
            if (!confirm('이 페이지의 편집 내용 ' + count + '건을 초기화합니다.\n원본으로 복원되며 페이지가 새로고침됩니다.\n\n계속하시겠습니까?')) return;
            if (window.__editor && window.__editor.resetPageEdits) {
                window.__editor.resetPageEdits();
            }
            location.reload();
        });
        document.body.appendChild(btn);
        refreshEditResetVisibility();
    }

    /* 편집 ON / OFF 상태 따라 노출 제어 */
    function refreshEditResetVisibility() {
        const btn = document.getElementById('edit-reset-btn');
        if (!btn) return;
        const editOn = document.body && document.body.classList.contains('kr-edit-mode');
        const isPres = isPresentation();
        btn.style.display = (editOn && !isPres) ? '' : 'none';
    }

    /* body class 변경 감시 → 편집 ON/OFF 시 버튼 표시/숨김 */
    function watchEditModeForResetBtn() {
        const target = document.body;
        if (!target) return;
        new MutationObserver(refreshEditResetVisibility).observe(target, {
            attributes: true,
            attributeFilter: ['class']
        });
        new MutationObserver(refreshEditResetVisibility).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-mode']
        });
    }

    /* ─ 우하단 초기화 아이콘 (회색·흐리게 → 클릭 시 목록으로) ─ */
    function buildResetIcon() {
        if (document.getElementById('mode-reset-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'mode-reset-btn';
        btn.type = 'button';
        btn.title = '모드 선택 초기화 — 목록으로 이동';
        btn.setAttribute('aria-label', '모드 초기화 후 목록으로');
        /* 작은 ↺ 아이콘 (목록·홈으로 가는 시각적 메타포) */
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
        btn.addEventListener('click', () => {
            const cur = getMode();
            const auto = getAuto();
            const onIndex = (location.pathname.split('/').pop() || 'index.html') === 'index.html';
            const msg = '모드 선택을 초기화하고 ' + (onIndex ? '다이얼로그를 다시 표시' : '목록(목차) 페이지로 이동') + '합니다.\n' +
                (cur ? '\n현재 모드: ' + (cur === 'edit' ? '편집' : '프리젠테이션') : '') +
                (auto ? '\n자동 적용: ON' : '') +
                '\n\n계속하시겠습니까?';
            if (!confirm(msg)) return;
            resetModeChoice(!onIndex);
        });
        document.body.appendChild(btn);
    }

    /* ─ 초기화 ─ */
    function init() {
        const m = getMode();
        const auto = getAuto();
        if (m && VALID.includes(m) && auto) {
            /* 인라인 부트스트랩에서 이미 적용됨 — 그대로 둠 */
            syncEditMode(m);
        } else {
            showDialog();
        }
        /* site-actions.js (page00)가 있으면 toolbar 토글 생략 — 사이드 패널이 처리 */
        if (!document.querySelector('script[src*="site-actions"]')) {
            buildToggle();
        }
        buildResetIcon();
        buildEditResetIcon();
        watchEditModeForResetBtn();
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.kr-menu.open').forEach(menu => menu.classList.remove('open'));
            /* 프리젠테이션 모드 / 전체 화면 모드 — 좌측/우측 클릭으로 페이지 이동 */
            onPresentationClick(e);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* 외부 노출 (site-actions.js, 디버그용) */
    window.__mode = {
        get: getMode,
        set: setMode,
        show: showDialog,
        reset: resetModeChoice,
        isPresentation: isPresentation,
        /* [INSTR 2026-04-28] Frame/Fluid 핏 모드 API */
        getFit: getFitMode,
        setFit: setFitMode,
        toggleFit: toggleFitMode
    };
})();
