/*!
 * nav-data.js — PresentationBuilder 자체 데모용 페이지 목록
 *
 * 역할: site-actions.js가 참조하는 window.PRES_NAV_DATA 전역 주입.
 * 새 PPT 프로젝트는 _templates/nav-data.template.js를 복제하여 자신의 페이지 목록으로 교체.
 *
 * 스키마:
 *   window.PRES_NAV_DATA = {
 *     version: '1.0',
 *     pages: [
 *       { group: '<섹션명>', items: [
 *         { file: '<파일명>.html', label: '<표시 라벨>' },
 *         ...
 *       ]},
 *       ...
 *     ]
 *   };
 */
(function () {
  'use strict';
  window.PRES_NAV_DATA = {
    version: '1.0',
    pages: [
      { group: 'Builder Demo', items: [
        { file: 'index.html',   label: '🏠  Builder 인덱스' },
        { file: 'index01.html', label: '📄  데모 페이지 01' }
      ]}
    ]
  };
})();
