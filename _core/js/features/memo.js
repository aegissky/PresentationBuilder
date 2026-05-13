/*!
 * tip-memo.js
 * 페이지 "틀"에 TIP 메모를 부착하는 시스템
 * - 위치 기반 저장: selector + index + anchorEid (data-eid 인접 요소)
 * - 저장 키: kickoff-tips::<page>
 * - JSON 입출력으로 다른 환경 호환
 */
(function () {
    'use strict';

    /* ─ TIP 부착 가능 셀렉터 (pages/ 기준) ─ */
    const FRAME_SELECTORS = [
        '.card', '.card-navy', '.card-accent',
        'table.data',
        '.sec-title',
        '.page-header',
        '.notice', '.notice.warn',
        '.kpi',
        '.flow-chain',
        '.as-is-to-be',
        '.grid-2', '.grid-3', '.grid-4',
        '.bk-card', '.bk-card.orange', '.bk-card.deep',
        '.bk-st', '.bk-sec', '.bk-hd',
        '.bk-arch', '.bk-matrix',
        '.bk-grid-2', '.bk-grid-3', '.bk-grid-4'
    ];

    const PAGE_KEY = location.pathname.split('/').pop() || 'index.html';
    const STORAGE_KEY = 'kickoff-tips::' + PAGE_KEY;
    const SCHEMA_VERSION = '1.0';
    const MAX_TIPS = 50;

    let tips = [];          /* 메모 데이터 배열 */
    let frameInfo = [];     /* {selector, frame, index} 매핑 */
    let activeFrame = null;
    let popoverEl = null;

    /* ─ 셀렉터 → 프레임 캐싱 ─ */
    function indexFrames() {
        frameInfo = [];
        FRAME_SELECTORS.forEach(sel => {
            const matches = Array.from(document.querySelectorAll(sel));
            matches.forEach((el, idx) => {
                /* 중복 방지: 동일 요소가 다중 셀렉터에 매칭되면 첫 번째만 채택 */
                if (frameInfo.some(f => f.frame === el)) return;
                /* 패널·툴바·다이얼로그 자체 제외 */
                if (el.closest('.kr-toolbar, .kr-popover, #mode-dialog, #mode-help, .tipmemo-popover')) return;
                /* position: relative 부여 (인디케이터 위치 기준) */
                const cs = getComputedStyle(el);
                if (cs.position === 'static') {
                    el.style.position = 'relative';
                }
                el.setAttribute('data-tipframe', '1');
                frameInfo.push({ selector: sel, frame: el, index: idx });
            });
        });
    }

    /* ─ 가장 가까운 data-eid 요소 찾기 ─ */
    function findAnchor(frame) {
        let anchor = frame.querySelector('[data-eid]');
        if (anchor) {
            return {
                eid: anchor.getAttribute('data-eid'),
                text: (anchor.textContent || '').trim().slice(0, 30)
            };
        }
        let p = frame.parentElement;
        while (p) {
            if (p.hasAttribute('data-eid')) {
                return {
                    eid: p.getAttribute('data-eid'),
                    text: (p.textContent || '').trim().slice(0, 30)
                };
            }
            p = p.parentElement;
        }
        return { eid: null, text: '' };
    }

    /* ─ 저장 / 로드 ─ */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) { tips = []; return; }
            const data = JSON.parse(raw);
            tips = Array.isArray(data) ? data : (data.tips || []);
        } catch (_) { tips = []; }
    }
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tips));
        } catch (e) {
            alert('TIP 저장 실패 (저장 공간 초과 가능): ' + e.message);
        }
    }

    /* ─ ID 생성 ─ */
    function newId() {
        return 'tip_' + Math.random().toString(36).slice(2, 8);
    }

    /* ─ 위치 복원 ─ */
    function findFrameForTip(tip) {
        const t = tip.target || {};

        /* 1순위: anchorEid가 있는 프레임 */
        if (t.anchorEid) {
            const anchorEl = document.querySelector('[data-eid="' + t.anchorEid + '"]');
            if (anchorEl) {
                /* 후보들 중 anchorEid를 contains 하는 첫 프레임 */
                for (const f of frameInfo) {
                    if (f.selector === t.selector && f.frame.contains(anchorEl)) {
                        return f.frame;
                    }
                }
                /* selector 무관하게 closest 시도 */
                const closest = anchorEl.closest(t.selector);
                if (closest) return closest;
            }
        }

        /* 2순위: selector + index */
        const sameSelector = frameInfo.filter(f => f.selector === t.selector);
        if (sameSelector[t.index]) return sameSelector[t.index].frame;

        return null;
    }

    /* ─ 인디케이터 렌더 ─ */
    function clearIndicators() {
        document.querySelectorAll('.tipmemo-indicator, .tipmemo-add-btn').forEach(el => el.remove());
    }
    function renderIndicators() {
        clearIndicators();
        if (!isEditMode()) return;

        /* 메모가 있는 프레임에 인디케이터 */
        tips.forEach(tip => {
            const frame = findFrameForTip(tip);
            if (!frame) return;
            const ind = document.createElement('button');
            ind.type = 'button';
            ind.className = 'tipmemo-indicator priority-' + (tip.priority || 'normal');
            ind.dataset.tipId = tip.id;
            ind.title = tip.content && tip.content.text ? tip.content.text.slice(0, 80) : '';
            ind.textContent = '●';
            ind.addEventListener('click', (e) => {
                e.stopPropagation();
                openPopover(frame, tip);
            });
            frame.appendChild(ind);
        });

        /* 모든 프레임에 hover 시 표시되는 + 버튼 */
        frameInfo.forEach(({ frame }) => {
            const hasTip = tips.some(t => findFrameForTip(t) === frame);
            if (hasTip) return;
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'tipmemo-add-btn';
            add.title = 'TIP 메모 추가';
            add.textContent = '+';
            add.addEventListener('click', (e) => {
                e.stopPropagation();
                openPopover(frame, null);
            });
            frame.appendChild(add);
        });
    }

    /* ─ 팝오버 열기 ─ */
    function openPopover(frame, tip) {
        closePopover();
        activeFrame = frame;

        const isNew = !tip;
        if (isNew) {
            const anchor = findAnchor(frame);
            const info = frameInfo.find(f => f.frame === frame);
            tip = {
                id: newId(),
                target: {
                    selector: info ? info.selector : '',
                    index: info ? info.index : 0,
                    scope: 'main, .page-wrap, body',
                    anchorEid: anchor.eid,
                    anchorText: anchor.text
                },
                position: { anchor: 'top-right', offsetX: -10, offsetY: -10 },
                content: {
                    text: '',
                    author: 'anonymous',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                priority: 'normal'
            };
        }

        const pop = document.createElement('div');
        pop.className = 'tipmemo-popover';
        pop.innerHTML = ''
            + '<div class="tm-hd">'
            + '  <span class="tm-title">' + (isNew ? 'TIP 메모 추가' : 'TIP 메모') + '</span>'
            + '  <button type="button" class="tm-close" aria-label="닫기">×</button>'
            + '</div>'
            + '<textarea class="tm-text" placeholder="이 영역에 대한 메모를 입력하세요..."></textarea>'
            + '<div class="tm-row">'
            + '  <span class="tm-lbl">우선순위</span>'
            + '  <label class="tm-pr"><input type="radio" name="tm-pr" value="low"> 낮음</label>'
            + '  <label class="tm-pr"><input type="radio" name="tm-pr" value="normal" checked> 일반</label>'
            + '  <label class="tm-pr"><input type="radio" name="tm-pr" value="high"> 높음</label>'
            + '</div>'
            + '<div class="tm-row">'
            + '  <span class="tm-lbl">작성자</span>'
            + '  <input class="tm-author" type="text" placeholder="이름 (선택)">'
            + '</div>'
            + '<div class="tm-actions">'
            + (isNew ? '' : '  <button type="button" class="tm-del">삭제</button>')
            + '  <button type="button" class="tm-cancel">취소</button>'
            + '  <button type="button" class="tm-save">저장</button>'
            + '</div>';
        document.body.appendChild(pop);
        popoverEl = pop;

        const ta = pop.querySelector('.tm-text');
        const author = pop.querySelector('.tm-author');
        ta.value = (tip.content && tip.content.text) || '';
        author.value = (tip.content && tip.content.author) || '';
        const pr = pop.querySelector('input[name="tm-pr"][value="' + (tip.priority || 'normal') + '"]');
        if (pr) pr.checked = true;

        /* 위치 — 프레임 우상단 근처 */
        const r = frame.getBoundingClientRect();
        const top = window.scrollY + r.top + 10;
        const left = Math.min(window.scrollX + r.right - 320, window.scrollX + window.innerWidth - 340);
        pop.style.top = top + 'px';
        pop.style.left = Math.max(20, left) + 'px';

        ta.focus();

        pop.querySelector('.tm-close').addEventListener('click', closePopover);
        pop.querySelector('.tm-cancel').addEventListener('click', closePopover);
        pop.querySelector('.tm-save').addEventListener('click', () => {
            const text = ta.value.trim();
            if (!text) { alert('메모 내용을 입력하세요.'); return; }
            tip.content.text = text;
            tip.content.author = author.value.trim() || 'anonymous';
            tip.content.updatedAt = new Date().toISOString();
            const checked = pop.querySelector('input[name="tm-pr"]:checked');
            tip.priority = checked ? checked.value : 'normal';

            if (isNew) {
                if (tips.length >= MAX_TIPS) {
                    alert('이 페이지의 TIP 메모는 최대 ' + MAX_TIPS + '개까지 저장 가능합니다.');
                    return;
                }
                tips.push(tip);
            } else {
                const i = tips.findIndex(t => t.id === tip.id);
                if (i >= 0) tips[i] = tip;
            }
            save();
            renderIndicators();
            closePopover();
        });
        const delBtn = pop.querySelector('.tm-del');
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                if (!confirm('이 TIP 메모를 삭제하시겠습니까?')) return;
                tips = tips.filter(t => t.id !== tip.id);
                save();
                renderIndicators();
                closePopover();
            });
        }
    }

    function closePopover() {
        if (popoverEl) { popoverEl.remove(); popoverEl = null; }
        activeFrame = null;
    }

    /* ─ 편집 모드 감지 ─ */
    function isEditMode() {
        return document.body && document.body.classList.contains('kr-edit-mode');
    }
    function isPresentation() {
        return document.documentElement.getAttribute('data-mode') === 'presentation';
    }

    /* ─ JSON 내보내기 / 가져오기 ─ */
    function exportJSON() {
        const data = {
            schemaVersion: SCHEMA_VERSION,
            page: PAGE_KEY,
            exportedAt: new Date().toISOString(),
            exportedBy: 'anonymous',
            tips: tips
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tips-' + PAGE_KEY.replace(/\.html$/, '') + '-' +
            new Date().toISOString().slice(0, 10) + '.json';
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
            if (f.size > 1024 * 1024) {
                alert('파일이 너무 큽니다 (1MB 이하).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!data.tips || !Array.isArray(data.tips)) throw new Error('tips 배열이 없습니다.');
                    if (data.schemaVersion && data.schemaVersion !== SCHEMA_VERSION) {
                        if (!confirm('스키마 버전이 다릅니다 (' + data.schemaVersion + '). 계속하시겠습니까?')) return;
                    }
                    if (data.page && data.page !== PAGE_KEY) {
                        if (!confirm('이 JSON은 다른 페이지(' + data.page + ')용입니다. 계속하시겠습니까?')) return;
                    }
                    if (tips.length > 0) {
                        if (!confirm('현재 ' + tips.length + '개의 TIP이 있습니다. 어떻게 처리할까요?\n\n[확인] 병합 (ID 중복은 새 것 유지)\n[취소] 가져오기 취소')) return;
                        const ids = new Set(tips.map(t => t.id));
                        data.tips.forEach(t => {
                            if (ids.has(t.id)) tips = tips.filter(x => x.id !== t.id);
                            tips.push(t);
                        });
                    } else {
                        tips = data.tips;
                    }
                    save();
                    renderIndicators();
                    alert('TIP 메모 ' + data.tips.length + '개를 가져왔습니다.');
                } catch (err) {
                    alert('JSON 파싱 실패: ' + err.message);
                }
            };
            reader.readAsText(f);
        });
        input.click();
    }

    function showList() {
        if (!tips.length) { alert('등록된 TIP 메모가 없습니다.'); return; }
        const lines = tips.map((t, i) => {
            const frame = findFrameForTip(t);
            const status = frame ? '✓' : '⚠';
            const pr = (t.priority || 'normal').toUpperCase();
            const text = (t.content && t.content.text || '').slice(0, 60);
            return (i + 1) + '. [' + status + '][' + pr + '] ' + text;
        });
        alert('TIP 메모 ' + tips.length + '건:\n\n' + lines.join('\n') + '\n\n✓ 정상 위치 / ⚠ 복원 실패');
    }

    function resetTips() {
        if (!tips.length) { alert('삭제할 TIP이 없습니다.'); return; }
        if (!confirm('이 페이지의 TIP 메모 ' + tips.length + '개를 모두 삭제합니다.\n계속하시겠습니까?')) return;
        tips = [];
        save();
        renderIndicators();
    }

    /* ─ 도구막대 메뉴 항목 추가 ─ */
    function injectToolbarItems() {
        /* editor.js가 만든 .kr-toolbar 첫 번째 메뉴(.kr-menu)에 항목 추가 */
        const tb = document.querySelector('.kr-toolbar');
        if (!tb) return;

        /* 별도 TIP 버튼 (.kr-toolbar 우측 추가) */
        const wrap = document.createElement('div');
        wrap.style.position = 'relative';
        const btn = document.createElement('button');
        btn.className = 'kr-btn';
        btn.type = 'button';
        btn.appendChild(document.createTextNode('TIP '));
        const caret = document.createElement('span');
        caret.textContent = '▾';
        caret.style.opacity = '0.6';
        btn.appendChild(caret);

        const menu = document.createElement('div');
        menu.className = 'kr-menu';
        const items = [
            { label: 'TIP 메모 보기', fn: showList },
            { label: 'TIP JSON 내보내기', fn: exportJSON },
            { label: 'TIP JSON 가져오기', fn: importJSON },
            { label: 'TIP 전체 삭제', fn: resetTips }
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

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            document.querySelectorAll('.kr-menu.open').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
            updateMenuLabels();
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        tb.appendChild(wrap);

        function updateMenuLabels() {
            const links = menu.querySelectorAll('a');
            if (links[0]) links[0].textContent = 'TIP 메모 보기 (' + tips.length + ')';
        }
    }

    /* ─ 편집 모드 변경 감시 ─ */
    function watchEditMode() {
        let last = isEditMode();
        const observer = new MutationObserver(() => {
            const cur = isEditMode();
            if (cur !== last) {
                last = cur;
                renderIndicators();
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    /* [INSTR 2026-04-29] 편집 ON 모드 — 클릭한 영역에 즉시 TIP 메모 부착
       - 클릭한 가장 가까운 frame(FRAME_SELECTORS) 찾아 popover 열기
       - 이미 TIP 있으면 그 TIP 편집, 없으면 신규 작성
       - 텍스트 편집 중([contenteditable]) / [data-eid] 단일 클릭은 무시 (dblclick 텍스트 편집 보존) */
    const CLICK_IGNORE_SEL = [
        '.tipmemo-popover', '.tipmemo-indicator', '.tipmemo-add-btn',
        '.kr-toolbar', '.kr-popover', '.kr-menu',
        '#sa-panel', '#sa-tab', '#mode-dialog', '#mode-help',
        '#mode-reset-btn', '#edit-reset-btn',
        'a', 'button', 'input', 'textarea', 'select', 'label',
        '[contenteditable="true"]'
    ].join(',');

    function onEditClick(e) {
        if (!isEditMode()) return;
        if (isPresentation()) return;
        /* 텍스트 선택 중이면 무시 */
        const sel = window.getSelection && window.getSelection();
        if (sel && sel.toString().length > 0) return;
        if (e.target.closest(CLICK_IGNORE_SEL)) return;
        /* dblclick 텍스트 편집 우선 — [data-eid] 단일 클릭은 무시 */
        if (e.target.closest('[data-eid]')) return;
        /* 가장 가까운 tip frame 찾기 */
        const frame = e.target.closest('[data-tipframe="1"]');
        if (!frame) return;
        e.preventDefault();
        e.stopPropagation();
        /* 이 frame 의 기존 TIP 이 있으면 편집, 없으면 신규 */
        const existing = tips.find(t => findFrameForTip(t) === frame);
        openPopover(frame, existing || null);
    }

    /* ─ 초기화 ─ */
    function init() {
        if (isPresentation()) {
            /* 프리젠테이션 모드면 인디케이터·도구막대 항목도 만들지 않음 */
            return;
        }
        load();
        indexFrames();
        renderIndicators();
        injectToolbarItems();
        watchEditMode();

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tipmemo-popover, .tipmemo-indicator, .tipmemo-add-btn')) {
                /* 팝오버 외부 클릭 시 닫기 */
                if (popoverEl && !popoverEl.contains(e.target)) closePopover();
            }
        });

        /* [INSTR 2026-04-29] 편집 ON 모드 — 클릭으로 TIP 부착 */
        document.addEventListener('click', onEditClick);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* 외부 노출 */
    window.__tipMemo = { list: () => tips, export: exportJSON, import: importJSON, reset: resetTips };
})();
