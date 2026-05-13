/*!
 * site-actions.js v4
 * 오른쪽 세로 중앙 패널 — 4버튼 + ✕ 닫기
 * [페이지이동▾] [섹션이동▾] [테마:Navy▾] [편집:OFF●] [✕]
 */
(function () {
  'use strict';

  /* ── 페이지 목록 ─────────────────────────── */
  const PAGES = [
    { group: '목차', items: [
      { file: 'index.html', label: '🏠  목차 (INDEX)' }
    ]},
    { group: 'PART 1 · 사업개요', items: [
      { file: '01-1.html', label: '1.1  추진 배경 및 목적' },
      { file: '01-2.html', label: '1.2  사업범위 · 구축 범위' },
      { file: '01-2-1.html', label: '1.2.1  기능 구성도' },
      { file: '01-2-1-1.html', label: '1.2.1.1  자금이체 신규/고도화' },
      { file: '01-2-2.html', label: '1.2.2  연계 시스템' },
      { file: '01-2-3.html', label: '1.2.3  영림원 ERP 연계' },
      { file: '01-3.html', label: '1.3  기대효과 · 정량' },
      { file: '01-3-1.html', label: '1.3.1  기대효과 · 정성' }
    ]},
    { group: 'PART 2 · 사업수행 방안', items: [
      { file: '02-1.html', label: '2.1  시스템 구성' },
      { file: '02-1-1.html', label: '2.1.1  인프라 · AS-IS→TO-BE' },
      { file: '02-2.html', label: '2.2  고도화 방향' },
      { file: '02-3.html', label: '2.3  서버 · HA/DR' },
      { file: '02-3-1.html', label: '2.3.1  스크래핑·보안·기술' },
      { file: '02-4.html', label: '2.4  프레임워크 · 내부 연계' },
      { file: '02-4-1.html', label: '2.4.1  외부·아키텍처·처리방식' },
      { file: '02-5.html', label: '2.5  표준 · 요구사항' },
      { file: '02-5-1.html', label: '2.5.1  예상 주요 서비스' },
      { file: '02-6.html', label: '2.6  시연 순서' },
      { file: '02-6-0-1.html', label: '2.6.0.1  시연 그룹별 소요 시간' },
      { file: '02-6-1.html', label: '2.6.1  시나리오 1-8' },
      { file: '02-6-2.html', label: '2.6.2  시나리오 9-14 + 환경' }
    ]},
    { group: 'PART 3 · 사업관리 방안', items: [
      { file: '03-1.html', label: '3.1  추진 조직' },
      { file: '03-2.html', label: '3.2  단계별 진행 · Gantt' },
      { file: '03-2-1.html', label: '3.2.1  주요 마일스톤' },
      { file: '03-3.html', label: '3.3  정기 보고' },
      { file: '03-3-1.html', label: '3.3.1  이슈 관리 · 산출물' }
    ]},
    { group: 'CLOSING', items: [
      { file: '99.html', label: '◆  {마무리 페이지}' }
    ]}
  ];

  const CURRENT = location.pathname.split('/').pop() || 'index.html';

  /* ── 테마 시스템 ─────────────────────────── */
  const THEMES = [
    { key: 'navy',     label: 'Navy · 기본' },
    { key: 'forest',   label: 'Forest · 녹색' },
    { key: 'charcoal', label: 'Charcoal · 중후' }
  ];
  const TK = 'kickoff-theme';
  function getTheme() { try { return localStorage.getItem(TK) || 'navy'; } catch (_) { return 'navy'; } }
  function applyTheme(k) {
    document.documentElement.setAttribute('data-theme', k);
    try { localStorage.setItem(TK, k); } catch (_) {}
    refreshUI();
  }

  /* ── 편집 모드 시스템 ────────────────────── */
  const EK = 'kickoff-edit-mode';
  let editOn = false;
  function toggleEdit() {
    editOn = !editOn;
    document.body.classList.toggle('kr-edit-mode', editOn);
    try { localStorage.setItem(EK, editOn ? '1' : '0'); } catch (_) {}
    refreshUI();
  }

  /* ── UI 참조 ─────────────────────────────── */
  let themeBtnRef = null;
  let editBtnRef  = null;
  let editDotRef  = null;
  let themeDropRef = null;

  function refreshUI() {
    const cur = getTheme();
    const found = THEMES.find(t => t.key === cur);
    /* 테마 버튼 텍스트 */
    if (themeBtnRef) {
      themeBtnRef.querySelector('.sa-pb-txt').textContent =
        '테마: ' + (found ? found.label.split(' ·')[0] : cur);
    }
    /* 테마 드롭다운 active */
    if (themeDropRef) {
      themeDropRef.querySelectorAll('a[data-key]').forEach(a => {
        a.classList.toggle('on', a.dataset.key === cur);
      });
    }
    /* 편집 버튼 */
    if (editBtnRef) {
      editBtnRef.querySelector('.sa-pb-txt').textContent = '편집: ' + (editOn ? 'ON' : 'OFF');
      editBtnRef.style.background = editOn ? 'rgba(255,83,0,.35)' : '';
    }
    if (editDotRef) {
      editDotRef.classList.toggle('on', editOn);
    }
  }

  /* ── CSS 주입 ────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('sa-v4-style')) return;
    const s = document.createElement('style');
    s.id = 'sa-v4-style';
    s.textContent = `
/* kr-toolbar 완전 숨김 */
.kr-toolbar { display: none !important; }

/* ════ 오른쪽 사이드 패널 ════ */
#sa-panel {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #19355D;
  border-radius: 8px 0 0 8px;
  box-shadow: -4px 0 24px rgba(0,0,0,.32);
  overflow: visible;
  z-index: 9000;
  min-width: 158px;
  transition: opacity .25s, transform .25s;
  font-family: 'Noto Sans KR','Malgun Gothic',sans-serif;
}
#sa-panel.sa-hidden {
  opacity: 0; pointer-events: none;
  transform: translateY(-50%) translateX(100%);
}

/* 각 항목 래퍼 (드롭다운 기준점) */
.sa-pi {
  position: relative;
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.sa-pi:last-child { border-bottom: none; }

/* 패널 버튼 공통 */
.sa-pb {
  display: flex; align-items: center;
  justify-content: space-between;
  width: 100%; padding: 11px 14px;
  background: transparent; border: none;
  color: #fff; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  white-space: nowrap; text-align: left;
  gap: 10px;
  transition: background .15s;
}
.sa-pb:hover { background: rgba(255,255,255,.12); }
.sa-pb.sa-active { background: rgba(255,83,0,.35); }
.sa-pb .sa-pb-txt { flex: 1; }
.sa-pb .sa-caret { font-size: 9px; opacity: .7; transition: transform .2s; flex-shrink: 0; }
.sa-pb.sa-active .sa-caret { transform: rotate(180deg); }

/* 편집 토글 도트 */
.sa-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: rgba(255,255,255,.3); flex-shrink: 0;
  transition: background .2s, box-shadow .2s;
}
.sa-dot.on {
  background: #FF5300;
  box-shadow: 0 0 6px rgba(255,83,0,.8);
}

/* ✕ 닫기 버튼 */
.sa-close {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 9px;
  background: rgba(0,0,0,.2); border: none;
  color: rgba(255,255,255,.6); font-size: 16px; line-height: 1;
  cursor: pointer; font-family: inherit;
  transition: background .15s, color .15s;
  border-radius: 0 0 0 8px;
}
.sa-close:hover { background: rgba(255,83,0,.5); color: #fff; }

/* ════ 드롭다운 (왼쪽으로 펼침) ════ */
.sa-drop {
  position: absolute;
  right: calc(100% + 6px);
  top: 0;
  background: #fff;
  border: 1px solid #00338D;
  min-width: 230px; max-height: 400px;
  overflow-y: auto;
  display: none; z-index: 9001;
  box-shadow: -4px 4px 20px rgba(0,0,0,.2);
}
/* 하단 아이템은 드롭다운이 위로 열림 */
.sa-drop.sa-dropup {
  top: auto; bottom: 0;
}
.sa-drop.sa-open { display: block; }

.sa-dg {
  font-size: 10px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: #6685BB;
  padding: 7px 13px 4px;
  background: #F4F7FC; border-bottom: 1px solid #E0EDF8;
  position: sticky; top: 0;
}
.sa-drop a, .sa-drop button {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 13px;
  color: #0F1A2E; font-size: 12px; font-weight: 500;
  text-decoration: none;
  border: none; background: transparent;
  border-bottom: 1px solid #E0EDF8;
  cursor: pointer; font-family: inherit;
  width: 100%; text-align: left;
  transition: background .1s, color .1s;
}
.sa-drop a:last-child, .sa-drop button:last-child { border-bottom: none; }
.sa-drop a:hover, .sa-drop button:hover { background: #E0EDF8; color: #FF5300; }
.sa-drop a.sa-cur { color: #FF5300; font-weight: 700; background: rgba(255,83,0,.05); }
.sa-drop a.sa-cur::after { content: ' ●'; font-size: 8px; margin-left: auto; }
.sa-drop a.on::before, .sa-drop button.on::before { content: '● '; color: #FF5300; font-size: 9px; }
.sa-drop a:not(.on):not(.sa-cur)::before,
.sa-drop button:not(.on)::before { content: '○ '; color: #C1D6ED; font-size: 9px; }
.sa-drop .sa-dn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: #E0EDF8; color: #00338D;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.sa-drop a.sa-cur .sa-dn { background: #FF5300; color: #fff; }

/* ════ 열기 탭 (패널 닫힌 후 우측 가장자리) ════ */
#sa-tab {
  position: fixed;
  right: 0; top: 50%;
  transform: translateY(-50%);
  background: #19355D;
  border-radius: 8px 0 0 8px;
  padding: 14px 7px;
  cursor: pointer; z-index: 8999;
  display: none;
  box-shadow: -3px 0 12px rgba(0,0,0,.25);
  transition: background .15s;
}
#sa-tab:hover { background: #1760E8; }
#sa-tab.sa-show { display: flex; flex-direction: column; align-items: center; gap: 4px; }
#sa-tab span {
  display: block; width: 16px; height: 2px;
  background: rgba(255,255,255,.8); border-radius: 2px;
}

/* ════ 반응형 ════ */
@media (max-width: 768px) {
  #sa-panel { min-width: 138px; }
  .sa-pb { padding: 10px 12px; font-size: 11px; }
  .sa-drop { min-width: 200px; }
}
@media (max-width: 480px) {
  #sa-panel { min-width: 120px; }
  .sa-pb { font-size: 10px; padding: 9px 10px; }
}
    `;
    document.head.appendChild(s);
  }

  /* ── 드롭다운 닫기 ──────────────────────── */
  function closeAllDrops() {
    document.querySelectorAll('.sa-drop.sa-open').forEach(d => d.classList.remove('sa-open'));
    document.querySelectorAll('.sa-pb.sa-active').forEach(b => b.classList.remove('sa-active'));
  }

  function toggleDrop(btn, drop) {
    const isOpen = drop.classList.contains('sa-open');
    closeAllDrops();
    if (!isOpen) {
      drop.classList.add('sa-open');
      btn.classList.add('sa-active');
    }
  }

  /* ── 패널 빌드 ──────────────────────────── */
  function buildPanel() {
    if (document.getElementById('sa-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'sa-panel';
    panel.classList.add('sa-hidden'); /* ★ 기본값: 접힘 상태 */

    /* 0. 모드 (편집/프리젠테이션) — 가장 위 */
    const modeItem = makeModeItem();
    if (modeItem) panel.appendChild(modeItem);

    /* 1. 페이지 이동 */
    panel.appendChild(makePageItem());

    /* 2. 섹션 이동 */
    const secItem = makeSectionItem();
    if (secItem) panel.appendChild(secItem);

    /* 3. 테마 */
    panel.appendChild(makeThemeItem());

    /* 4. 편집 (토글) */
    panel.appendChild(makeEditItem());

    /* 5. ✕ 닫기 */
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sa-close';
    closeBtn.type = 'button';
    closeBtn.title = '닫기';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => collapsePanel(panel));
    panel.appendChild(closeBtn);

    document.body.appendChild(panel);

    /* 열기 탭 */
    buildTab(panel);

    /* 외부 클릭 */
    document.addEventListener('click', e => {
      if (!e.target.closest('#sa-panel')) closeAllDrops();
    });
  }

  function buildTab(panel) {
    const tab = document.createElement('div');
    tab.id = 'sa-tab';
    tab.title = '도구 열기';
    tab.innerHTML = '<span></span><span></span><span></span>';
    tab.classList.add('sa-show'); /* ★ 기본값: 햄버거 탭 표시 */
    tab.addEventListener('click', () => {
      panel.classList.remove('sa-hidden');
      tab.classList.remove('sa-show');
    });
    document.body.appendChild(tab);
  }

  function collapsePanel(panel) {
    closeAllDrops();
    panel.classList.add('sa-hidden');
    const tab = document.getElementById('sa-tab');
    if (tab) tab.classList.add('sa-show');
  }

  /* ── 공통 버튼 생성 헬퍼 ─────────────────── */
  function makeBtn(label, hasCaret) {
    const btn = document.createElement('button');
    btn.className = 'sa-pb';
    btn.type = 'button';

    const txt = document.createElement('span');
    txt.className = 'sa-pb-txt';
    txt.textContent = label;
    btn.appendChild(txt);

    if (hasCaret) {
      const c = document.createElement('span');
      c.className = 'sa-caret';
      c.textContent = '▾';
      btn.appendChild(c);
    }
    return btn;
  }

  /* ── 0. 모드 (편집 / 프리젠테이션) ────────── */
  let modeBtnRef = null;
  let modeDropRef = null;

  function getModeLabel() {
    const m = (window.__mode && window.__mode.get && window.__mode.get()) || 'edit';
    return m === 'presentation' ? '발표' : '편집';
  }

  function refreshModeUI() {
    if (!modeBtnRef) return;
    const txt = modeBtnRef.querySelector('.sa-pb-txt');
    if (txt) txt.textContent = '모드: ' + getModeLabel();
    const isPres = window.__mode && window.__mode.isPresentation && window.__mode.isPresentation();
    modeBtnRef.style.background = isPres ? 'rgba(255,83,0,.35)' : '';
  }

  function makeModeItem() {
    const pi = document.createElement('div');
    pi.className = 'sa-pi';

    const btn = makeBtn('모드: ' + getModeLabel(), true);
    modeBtnRef = btn;

    const drop = document.createElement('div');
    drop.className = 'sa-drop';
    modeDropRef = drop;

    const gl = document.createElement('div');
    gl.className = 'sa-dg';
    gl.textContent = '모드 선택';
    drop.appendChild(gl);

    [
      { key: 'edit', label: '✏  편집 모드' },
      { key: 'presentation', label: '▶  프리젠테이션 모드' }
    ].forEach(item => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = item.label;
      const cur = window.__mode && window.__mode.get && window.__mode.get();
      if (cur === item.key) a.classList.add('on');
      a.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        if (window.__mode && window.__mode.set) window.__mode.set(item.key);
        refreshModeUI();
        drop.querySelectorAll('a').forEach(x =>
            x.classList.toggle('on', x.textContent === item.label));
        closeAllDrops();
      });
      drop.appendChild(a);
    });

    /* 구분선 */
    const sep = document.createElement('div');
    sep.style.height = '1px';
    sep.style.background = '#E0EDF8';
    drop.appendChild(sep);

    /* 다이얼로그 다시 보기 */
    const showA = document.createElement('a');
    showA.href = '#';
    showA.textContent = '⟲  다이얼로그 다시 보기';
    showA.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (window.__mode && window.__mode.show) window.__mode.show();
      closeAllDrops();
    });
    drop.appendChild(showA);

    /* 모드 선택 초기화 */
    const resetA = document.createElement('a');
    resetA.href = '#';
    resetA.textContent = '↺  모드 선택 초기화';
    resetA.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      if (!confirm('모드 선택을 초기화하고 페이지를 새로고침합니다.\n계속하시겠습니까?')) return;
      if (window.__mode && window.__mode.reset) window.__mode.reset();
      closeAllDrops();
    });
    drop.appendChild(resetA);

    btn.addEventListener('click', e => { e.stopPropagation(); toggleDrop(btn, drop); });
    pi.appendChild(btn);
    pi.appendChild(drop);
    return pi;
  }

  /* ── 1. 페이지 이동 ─────────────────────── */
  function makePageItem() {
    const pi = document.createElement('div');
    pi.className = 'sa-pi';

    const btn = makeBtn('페이지 이동', true);
    const drop = document.createElement('div');
    drop.className = 'sa-drop';

    let idx = 0;
    PAGES.forEach(group => {
      const gl = document.createElement('div');
      gl.className = 'sa-dg';
      gl.textContent = group.group;
      drop.appendChild(gl);

      group.items.forEach(item => {
        idx++;
        const a = document.createElement('a');
        a.href = item.file;
        const dn = document.createElement('span');
        dn.className = 'sa-dn';
        dn.textContent = item.file === 'index.html' ? '🏠' : idx - 1;
        a.appendChild(dn);
        a.appendChild(document.createTextNode(' ' + item.label));
        if (item.file === CURRENT) a.classList.add('sa-cur');
        a.addEventListener('click', closeAllDrops);
        drop.appendChild(a);
      });
    });

    btn.addEventListener('click', e => { e.stopPropagation(); toggleDrop(btn, drop); });
    pi.appendChild(btn);
    pi.appendChild(drop);
    return pi;
  }

  /* ── 2. 섹션 이동 ───────────────────────── */
  function makeSectionItem() {
    const secs = [];
    const h1 = document.querySelector('.bk-hd h1, [class*="bk-hd"] h1');
    if (h1) { if (!h1.id) h1.id = 'sa-top'; secs.push({ id: '#sa-top', label: h1.textContent.trim().slice(0, 28) }); }

    document.querySelectorAll('.bk-sec h2, .bk-st h2').forEach((el, i) => {
      if (!el.id) el.id = 'sa-s' + i;
      if (el.parentElement && !el.parentElement.id) el.parentElement.id = 'sa-sp' + i;
      const txt = el.textContent.trim().slice(0, 26);
      if (txt) secs.push({ id: '#' + el.id, label: txt });
    });

    if (secs.length <= 1) return null;

    const pi = document.createElement('div');
    pi.className = 'sa-pi';

    const btn = makeBtn('섹션 이동', true);
    const drop = document.createElement('div');
    drop.className = 'sa-drop';

    const gl = document.createElement('div');
    gl.className = 'sa-dg';
    gl.textContent = '이 페이지 섹션';
    drop.appendChild(gl);

    secs.forEach((sec, i) => {
      const a = document.createElement('a');
      a.href = sec.id;
      const dn = document.createElement('span');
      dn.className = 'sa-dn';
      dn.textContent = i + 1;
      a.appendChild(dn);
      a.appendChild(document.createTextNode(' ' + sec.label));
      a.addEventListener('click', closeAllDrops);
      drop.appendChild(a);
    });

    btn.addEventListener('click', e => { e.stopPropagation(); toggleDrop(btn, drop); });
    pi.appendChild(btn);
    pi.appendChild(drop);
    return pi;
  }

  /* ── 3. 테마 ────────────────────────────── */
  function makeThemeItem() {
    const pi = document.createElement('div');
    pi.className = 'sa-pi';

    const cur = getTheme();
    const found = THEMES.find(t => t.key === cur);
    const btn = makeBtn('테마: ' + (found ? found.label.split(' ·')[0] : cur), true);
    themeBtnRef = btn;

    const drop = document.createElement('div');
    drop.className = 'sa-drop';
    themeDropRef = drop;

    const gl = document.createElement('div');
    gl.className = 'sa-dg';
    gl.textContent = '테마 선택';
    drop.appendChild(gl);

    THEMES.forEach(t => {
      const a = document.createElement('a');
      a.href = '#'; a.dataset.key = t.key;
      a.textContent = t.label;
      if (t.key === cur) a.classList.add('on');
      a.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        applyTheme(t.key);
        closeAllDrops();
      });
      drop.appendChild(a);
    });

    btn.addEventListener('click', e => { e.stopPropagation(); toggleDrop(btn, drop); });
    pi.appendChild(btn);
    pi.appendChild(drop);
    return pi;
  }

  /* ── 4. 편집 (토글 + 서브메뉴) ──────────── */
  function makeEditItem() {
    const pi = document.createElement('div');
    pi.className = 'sa-pi';

    const btn = document.createElement('button');
    btn.className = 'sa-pb';
    btn.type = 'button';
    editBtnRef = btn;

    const txt = document.createElement('span');
    txt.className = 'sa-pb-txt';
    txt.textContent = '편집: ' + (editOn ? 'ON' : 'OFF');
    btn.appendChild(txt);

    const dot = document.createElement('span');
    dot.className = 'sa-dot' + (editOn ? ' on' : '');
    btn.appendChild(dot);
    editDotRef = dot;

    /* 편집 드롭다운 (위로 열림) */
    const drop = document.createElement('div');
    drop.className = 'sa-drop sa-dropup';

    [
      { label: '편집 ON / OFF', fn: () => { toggleEdit(); } },
      { label: 'JSON 내보내기', fn: () => triggerEditor('export') },
      { label: 'JSON 가져오기', fn: () => triggerEditor('import') },
      { label: '전체 초기화',   fn: () => triggerEditor('reset')  }
    ].forEach(item => {
      const b2 = document.createElement('button');
      b2.type = 'button'; b2.textContent = item.label;
      b2.addEventListener('click', e => { e.stopPropagation(); item.fn(); closeAllDrops(); });
      drop.appendChild(b2);
    });

    btn.addEventListener('click', e => { e.stopPropagation(); toggleDrop(btn, drop); });
    pi.appendChild(btn);
    pi.appendChild(drop);
    return pi;
  }

  /* ── 편집 도구 직접 구현 ─────────────────── */
  function triggerEditor(action) {
    const PK = location.pathname.split('/').pop() || 'index.html';
    const SP = 'kickoff-edit::' + PK + '::';
    if (action === 'export') {
      const d = { page: PK, ts: new Date().toISOString(), edits: {} };
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SP)) {
          try { d.edits[k.slice(SP.length)] = JSON.parse(localStorage.getItem(k)); } catch (_) {}
        }
      }
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = u; a.download = 'edits-' + PK.replace(/\.html$/, '') + '.json';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(u);
    } else if (action === 'import') {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'application/json';
      inp.addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data.edits) throw new Error('잘못된 파일');
            Object.entries(data.edits).forEach(([eid, v]) => {
              localStorage.setItem(SP + eid, JSON.stringify(v));
            });
            alert('불러오기 완료. 새로고침합니다.'); location.reload();
          } catch (err) { alert('파일 오류: ' + err.message); }
        };
        r.readAsText(f);
      });
      inp.click();
    } else if (action === 'reset') {
      if (!confirm('이 페이지의 모든 편집 내용을 초기화합니까?')) return;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(SP)) localStorage.removeItem(k);
      }
      alert('초기화 완료. 새로고침합니다.'); location.reload();
    }
  }

  /* ── 초기화 ─────────────────────────────── */
  function init() {
    injectCSS();
    document.documentElement.setAttribute('data-theme', getTheme());
    editOn = (function () { try { return localStorage.getItem(EK) === '1'; } catch (_) { return false; } })();
    if (editOn) document.body.classList.add('kr-edit-mode');
    buildPanel();
    refreshUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
