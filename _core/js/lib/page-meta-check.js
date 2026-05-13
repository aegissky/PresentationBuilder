/*!
 * page-meta-check.js — PB-MOD W20 페이지 메타 검증 (브라우저 콘솔용)
 *
 * 목적:
 *   현재 페이지의 <!-- pres-meta: {core_version, layout, features:[...]} --> 주석을 읽고
 *   features.manifest.json의 loading_order 와 실 로드된 <script src> 를 비교.
 *
 * 자동 발동: 안 함. 콘솔에서 수동 호출.
 *   사용법: PresPageMeta.check()
 *           PresPageMeta.readMeta()
 *
 * 의도된 한계:
 *   - file:// 환경에서 fetch 차단 시 manifest 비교 불가 — meta만 표시
 *   - declared 안 됐지만 로드된 feature 는 검사 안 함 (extra detect는 향후 확장)
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  function readMeta() {
    var html = document.documentElement.outerHTML;
    var m = html.match(/<!--\s*pres-meta:\s*(\{[\s\S]*?\})\s*-->/);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }

  function listLoadedSrcs() {
    return [].slice.call(document.querySelectorAll('script[src]'))
      .map(function (s) { return s.getAttribute('src'); });
  }

  async function check() {
    var meta = readMeta();
    if (!meta) {
      console.warn('[page-meta-check] pres-meta 주석 없음 — inject-head.ps1 실행 권고');
      return { ok: false, reason: 'no-meta' };
    }

    var manifestUrl = '_core/features.manifest.json';
    var loaded = listLoadedSrcs();
    var declared = Array.isArray(meta.features) ? meta.features : [];

    try {
      var res = await fetch(manifestUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var fman = await res.json();
      var missing = [];

      declared.forEach(function (fid) {
        var f = (fman.features || []).filter(function (x) { return x.id === fid; })[0];
        if (!f) { missing.push(fid + ' (manifest 미정의)'); return; }
        var basename = f.file.split('/').pop();
        var hit = loaded.some(function (s) { return s.indexOf(basename) !== -1; });
        if (!hit) missing.push(fid + ' (' + f.file + ' 미로드)');
      });

      if (missing.length) {
        console.warn('[page-meta-check] declared이지만 미로드: ' + missing.join(', '));
        return { ok: false, missing: missing, meta: meta };
      }
      console.info('[page-meta-check] OK · ' + declared.length + ' features · '
                 + 'core_version=' + meta.core_version + ' · layout=' + meta.layout);
      return { ok: true, meta: meta };
    } catch (e) {
      console.warn('[page-meta-check] manifest fetch 실패: ' + e.message
                 + ' (file:// 환경에서는 정상). meta=' + JSON.stringify(meta));
      return { ok: false, reason: 'fetch-failed', meta: meta };
    }
  }

  window.PresPageMeta = { check: check, readMeta: readMeta };
})();
