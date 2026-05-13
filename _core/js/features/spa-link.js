/* [INSTR 2026-04-28] SPA 링크 인터셉트 — iframe 내부에서 클릭된 페이지간 링크(.pf, .home 등)를
   부모 index.html 의 hash 라우팅으로 위임. iframe load 핸들러의 cross-origin/replaceState 한계 우회.
   - iframe 안일 때만 동작 (top === self 이면 일반 네비게이션 그대로)
   - 같은 디렉터리의 *.html 링크만 가로챔 (외부·앵커·#·javascript: 제외)
*/
(function () {
    'use strict';

    if (window.top === window.self) return;

    function isInternalHref(href) {
        if (!href) return false;
        if (href.charAt(0) === '#') return false;
        if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return false;
        return /\.html(\?|#|$)/i.test(href);
    }

    function fileFromHref(href) {
        var clean = href.split('#')[0].split('?')[0];
        var parts = clean.split('/');
        return parts[parts.length - 1];
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        if (a.classList && a.classList.contains('off')) return;
        if (a.target && a.target !== '_self') return;
        var href = a.getAttribute('href');
        if (!isInternalHref(href)) return;

        e.preventDefault();
        var file = fileFromHref(href);
        try {
            window.parent.postMessage({
                type: 'kickoff-nav',
                file: file
            }, '*');
        } catch (_) {
            window.location.href = href;
        }
    }, true);
})();
