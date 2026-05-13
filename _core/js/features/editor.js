(function () {
    'use strict';

    const EDITABLE_SELECTORS = [
        'h1', 'h2', 'h3', 'h4',
        '.page-header .sub', '.page-header .eyebrow',
        '.eyebrow', '.sec-title h2', '.sec-title h3',
        '.card p', '.card h3', '.card h4',
        '.bullet-list li', '.num-list li', '.num-list li strong',
        'table.data td', 'table.data th',
        '.kpi .num', '.kpi .label', '.kpi .sub',
        '.as-is-to-be li', '.as-is-to-be h4',
        '.flow-chain .step',
        '.notice', '.notice .title',
        '.badge',
        '.hero h1', '.hero .sub', '.hero .eye', '.hero .line-2',
        '.index-grid .no', '.index-grid .ttl', '.index-grid .sub',
        '.section-block .hd', '.section-block > h2',
        '.page-foot a .title'
    ];

    const PAGE_KEY = location.pathname.split('/').pop() || 'index';
    const STORAGE_PREFIX = 'kickoff-edit::' + PAGE_KEY + '::';
    const MODE_KEY = 'kickoff-edit-mode';

    let editMode = false;
    let popover = null;
    let currentlyEditing = null;

    /* ─ 요소 ID 부여 + 편집 대상 마킹 ─ */
    function assignEids() {
        let idx = 0;
        EDITABLE_SELECTORS.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.closest('.kr-toolbar, .kr-popover, .kr-menu, .top-nav, .page-foot a .dir')) return;
                if (el.querySelector(EDITABLE_SELECTORS.join(','))) {
                    // 컨테이너 성격이면 스킵 — 더 하위가 편집됨
                    if (el.tagName !== 'LI' && el.tagName !== 'TD' && el.tagName !== 'TH') return;
                }
                if (!el.hasAttribute('data-eid')) {
                    el.setAttribute('data-eid', 'e' + (idx++));
                }
            });
        });
    }

    /* ─ 저장/복원 ─ */
    function loadAll() {
        const all = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(STORAGE_PREFIX)) {
                try {
                    const v = JSON.parse(localStorage.getItem(k));
                    all.push({ key: k, eid: k.slice(STORAGE_PREFIX.length), data: v });
                } catch (_) {}
            }
        }
        return all;
    }

    function applyStored() {
        loadAll().forEach(({ eid, data }) => {
            const el = document.querySelector('[data-eid="' + eid + '"]');
            if (!el) return;
            if (typeof data.html === 'string') el.innerHTML = data.html;
            else if (typeof data.text === 'string') el.textContent = data.text;
            if (data.struck) el.classList.add('kr-struck');
            el.classList.add('kr-edited');
        });
    }

    function saveElement(el) {
        const eid = el.getAttribute('data-eid');
        if (!eid) return;
        const originalHTML = el.dataset.krOriginal;
        const currentHTML = el.innerHTML;
        const struck = el.classList.contains('kr-struck');
        if (currentHTML === originalHTML && !struck) {
            localStorage.removeItem(STORAGE_PREFIX + eid);
            el.classList.remove('kr-edited');
            return;
        }
        try {
            localStorage.setItem(STORAGE_PREFIX + eid, JSON.stringify({
                html: currentHTML,
                struck: struck,
                ts: new Date().toISOString()
            }));
            el.classList.add('kr-edited');
        } catch (e) {
            alert('저장 실패 (저장 공간 초과 가능): ' + e.message);
        }
    }

    function cacheOriginal(el) {
        if (!el.hasAttribute('data-kr-original')) {
            el.dataset.krOriginal = el.innerHTML;
        }
    }

    /* ─ 편집 모드 진입/종료 ─ */
    function enterEdit(el) {
        if (currentlyEditing && currentlyEditing !== el) commitEdit(currentlyEditing);
        cacheOriginal(el);
        el.setAttribute('contenteditable', 'true');
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        currentlyEditing = el;
        showPopover(el);
    }

    function commitEdit(el) {
        if (!el) return;
        el.removeAttribute('contenteditable');
        saveElement(el);
        hidePopover();
        currentlyEditing = null;
    }

    function cancelEdit(el) {
        if (!el) return;
        if (el.dataset.krOriginal !== undefined) {
            el.innerHTML = el.dataset.krOriginal;
        }
        el.removeAttribute('contenteditable');
        hidePopover();
        currentlyEditing = null;
    }

    /* ─ 취소선 팝오버 ─ */
    function showPopover(el) {
        hidePopover();
        popover = document.createElement('div');
        popover.className = 'kr-popover';

        const btnStrike = document.createElement('button');
        btnStrike.type = 'button';
        btnStrike.textContent = el.classList.contains('kr-struck') ? '취소선 해제' : '취소선';
        btnStrike.addEventListener('mousedown', (e) => {
            e.preventDefault();
            el.classList.toggle('kr-struck');
            btnStrike.textContent = el.classList.contains('kr-struck') ? '취소선 해제' : '취소선';
        });

        const btnDone = document.createElement('button');
        btnDone.type = 'button';
        btnDone.textContent = '완료 (Esc)';
        btnDone.addEventListener('mousedown', (e) => {
            e.preventDefault();
            commitEdit(el);
        });

        const btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.textContent = '원복';
        btnReset.addEventListener('mousedown', (e) => {
            e.preventDefault();
            cancelEdit(el);
            el.classList.remove('kr-struck', 'kr-edited');
            localStorage.removeItem(STORAGE_PREFIX + el.getAttribute('data-eid'));
        });

        popover.appendChild(btnStrike);
        popover.appendChild(btnReset);
        popover.appendChild(btnDone);
        document.body.appendChild(popover);

        const r = el.getBoundingClientRect();
        popover.style.top = (window.scrollY + r.top - 40) + 'px';
        popover.style.left = (window.scrollX + r.left) + 'px';
    }

    function hidePopover() {
        if (popover) { popover.remove(); popover = null; }
    }

    /* ─ 이벤트 바인딩 ─ */
    function isEditOn() {
        /* [INSTR 2026-04-29] body.kr-edit-mode 단일 진실 — site-actions.js 토글과 동기화 */
        return document.body && document.body.classList.contains('kr-edit-mode');
    }

    function onDblClick(e) {
        if (document.documentElement.getAttribute('data-mode') === 'presentation') return;
        if (!isEditOn()) return;
        const el = e.target.closest('[data-eid]');
        if (!el) return;
        if (el.closest('.kr-toolbar, .kr-popover, .tipmemo-popover, #sa-panel, #sa-tab')) return;
        e.preventDefault();
        enterEdit(el);
    }

    function onKeyDown(e) {
        if (!currentlyEditing) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            commitEdit(currentlyEditing);
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            commitEdit(currentlyEditing);
        }
    }

    function onDocClick(e) {
        if (!currentlyEditing) return;
        if (currentlyEditing.contains(e.target)) return;
        if (e.target.closest('.kr-popover')) return;
        commitEdit(currentlyEditing);
    }

    /* ─ 편집 모드 토글 ─ */
    function setEditMode(on) {
        editMode = !!on;
        document.body.classList.toggle('kr-edit-mode', editMode);
        try { localStorage.setItem(MODE_KEY, editMode ? '1' : '0'); } catch (_) {}
        refreshEditMenu();
    }

    /* ─ 내보내기/가져오기/초기화 ─ */
    function exportJSON() {
        const data = { page: PAGE_KEY, ts: new Date().toISOString(), edits: {} };
        loadAll().forEach(({ eid, data: d }) => { data.edits[eid] = d; });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kickoff-edits-' + PAGE_KEY.replace(/\.html$/, '') + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!data.edits) throw new Error('잘못된 파일 형식');
                    Object.entries(data.edits).forEach(([eid, d]) => {
                        localStorage.setItem(STORAGE_PREFIX + eid, JSON.stringify(d));
                    });
                    alert('불러오기 완료. 새로고침합니다.');
                    location.reload();
                } catch (err) {
                    alert('파일 오류: ' + err.message);
                }
            };
            reader.readAsText(f);
        });
        input.click();
    }

    function resetAll() {
        if (!confirm('이 페이지의 모든 편집 내용을 초기화합니다.\n계속하시겠습니까?')) return;
        loadAll().forEach(({ key }) => localStorage.removeItem(key));
        alert('초기화 완료. 새로고침합니다.');
        location.reload();
    }

    /* 외부 노출 — mode-selector.js의 페이지 편집 초기화 버튼이 사용 */
    function resetPageEditsSilent() {
        const all = loadAll();
        all.forEach(({ key }) => localStorage.removeItem(key));
        return all.length;
    }
    window.__editor = {
        getPageKey: function () { return PAGE_KEY; },
        countEdits: function () { return loadAll().length; },
        resetPageEdits: resetPageEditsSilent,
        /* [INSTR 2026-04-29] 외부 토글 동기화 — site-actions.js 등 다른 UI 에서 호출 */
        setEditMode: setEditMode,
        isEditOn: function () { return isEditOn(); }
    };

    /* ─ 툴바 UI ─ */
    let editMenuEl = null;
    let editBtnEl = null;

    function refreshEditMenu() {
        if (!editBtnEl) return;
        editBtnEl.classList.toggle('active', editMode);
        const count = loadAll().length;
        editBtnEl.firstChild.nodeValue = '편집: ' + (editMode ? 'ON' : 'OFF') + (count ? ' (' + count + ')' : '') + ' ';
    }

    function buildToolbar() {
        let tb = document.querySelector('.kr-toolbar');
        if (!tb) {
            tb = document.createElement('div');
            tb.className = 'kr-toolbar';
            document.body.appendChild(tb);
        }
        const wrap = document.createElement('div');
        wrap.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'kr-btn';
        btn.type = 'button';
        btn.appendChild(document.createTextNode('편집: OFF '));
        const caret = document.createElement('span');
        caret.textContent = '▾';
        caret.style.opacity = '0.6';
        btn.appendChild(caret);
        editBtnEl = btn;

        const menu = document.createElement('div');
        menu.className = 'kr-menu';
        const items = [
            { label: '편집 ON / OFF', fn: () => setEditMode(!editMode) },
            { label: '변경사항 보기', fn: showChanges },
            { label: 'JSON 내보내기', fn: exportJSON },
            { label: 'JSON 가져오기', fn: importJSON },
            { label: '전체 초기화', fn: resetAll }
        ];
        items.forEach(item => {
            const a = document.createElement('a');
            a.textContent = item.label;
            a.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.remove('open');
                item.fn();
            });
            menu.appendChild(a);
        });
        editMenuEl = menu;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            document.querySelectorAll('.kr-menu.open').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        tb.appendChild(wrap);
    }

    function showChanges() {
        const all = loadAll();
        if (!all.length) { alert('변경 사항이 없습니다.'); return; }
        const lines = all.map((e, i) => {
            const el = document.querySelector('[data-eid="' + e.eid + '"]');
            const preview = el ? (el.textContent || '').slice(0, 60) : '(삭제됨)';
            return (i + 1) + '. [' + e.eid + '] ' + preview;
        });
        alert('변경 사항 ' + all.length + '건:\n\n' + lines.join('\n'));
    }

    /* ─ 초기화 ─ */
    function init() {
        assignEids();
        applyStored();
        buildToolbar();

        let storedMode = '0';
        try { storedMode = localStorage.getItem(MODE_KEY) || '0'; } catch (_) {}
        setEditMode(storedMode === '1');

        document.addEventListener('dblclick', onDblClick);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('click', onDocClick, true);

        /* [INSTR 2026-04-29] body.kr-edit-mode 외부 변경 감지 → 내부 변수/툴바 동기화 */
        new MutationObserver(() => {
            const on = isEditOn();
            if (editMode !== on) {
                editMode = on;
                refreshEditMenu();
            }
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        /* 다른 탭/창의 localStorage 변경 동기화 */
        window.addEventListener('storage', (e) => {
            if (e.key !== MODE_KEY) return;
            const on = e.newValue === '1';
            if (isEditOn() !== on) {
                document.body.classList.toggle('kr-edit-mode', on);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
