(function () {
    'use strict';

    const THEMES = [
        { key: 'navy', label: 'Navy · 기본' },
        { key: 'forest', label: 'Forest · 녹색' },
        { key: 'charcoal', label: 'Charcoal · 중후' },
        { key: 'ai', label: 'AI · 네온', asset: 'theme-ai' }
    ];
    const STORAGE_KEY = 'kickoff-theme';
    const DEFAULT = 'navy';
    const loadedAssets = new Set();

    function loadThemeAssets(key) {
        const theme = THEMES.find(t => t.key === key);
        if (!theme || !theme.asset || loadedAssets.has(theme.asset)) return;
        loadedAssets.add(theme.asset);
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = theme.asset + '.css';
        document.head.appendChild(css);
        const js = document.createElement('script');
        js.defer = true;
        js.src = theme.asset + '.js';
        document.head.appendChild(js);
    }

    function getTheme() {
        try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; }
        catch (_) { return DEFAULT; }
    }

    function setTheme(key) {
        loadThemeAssets(key);
        document.documentElement.setAttribute('data-theme', key);
        try { localStorage.setItem(STORAGE_KEY, key); } catch (_) {}
        refreshMenu();
    }

    let menuEl = null;
    let btnEl = null;

    function refreshMenu() {
        if (!menuEl) return;
        const cur = getTheme();
        menuEl.querySelectorAll('a').forEach(a => {
            a.classList.toggle('on', a.dataset.key === cur);
        });
        const label = THEMES.find(t => t.key === cur);
        if (btnEl) btnEl.firstChild.nodeValue = '테마: ' + (label ? label.label.split(' ·')[0] : cur) + ' ';
    }

    function buildUI(toolbar) {
        const wrap = document.createElement('div');
        wrap.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'kr-btn';
        btn.type = 'button';
        btn.appendChild(document.createTextNode('테마: Navy '));
        const caret = document.createElement('span');
        caret.textContent = '▾';
        caret.style.opacity = '0.6';
        btn.appendChild(caret);
        btnEl = btn;

        const menu = document.createElement('div');
        menu.className = 'kr-menu';
        THEMES.forEach(t => {
            const a = document.createElement('a');
            a.dataset.key = t.key;
            a.textContent = t.label;
            a.addEventListener('click', (e) => {
                e.stopPropagation();
                setTheme(t.key);
                menu.classList.remove('open');
            });
            menu.appendChild(a);
        });
        menuEl = menu;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
            document.querySelectorAll('.kr-menu.open').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
        });

        wrap.appendChild(btn);
        wrap.appendChild(menu);
        toolbar.appendChild(wrap);
    }

    function ensureToolbar() {
        let tb = document.querySelector('.kr-toolbar');
        if (!tb) {
            tb = document.createElement('div');
            tb.className = 'kr-toolbar';
            document.body.appendChild(tb);
        }
        return tb;
    }

    function init() {
        const cur = getTheme();
        loadThemeAssets(cur);
        document.documentElement.setAttribute('data-theme', cur);
        const tb = ensureToolbar();
        buildUI(tb);
        refreshMenu();
        document.addEventListener('click', () => {
            document.querySelectorAll('.kr-menu.open').forEach(m => m.classList.remove('open'));
        });
    }

    (function bootstrap() {
        const cur = getTheme();
        loadThemeAssets(cur);
        document.documentElement.setAttribute('data-theme', cur);
    })();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
