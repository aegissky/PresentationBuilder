/*!
 * nav-data.template.js — 새 PPT 프로젝트용 페이지 네비 데이터 템플릿
 *
 * 사용법:
 *   1. 본 파일을 새 PPT 프로젝트 루트로 복제 → 파일명 `nav-data.js`
 *   2. pages 배열을 자기 프로젝트의 슬라이드 시리즈로 교체
 *   3. 각 슬라이드 HTML의 헤드에 다음 한 줄 포함 (다른 _core 스크립트 다음):
 *      <script defer src="nav-data.js"></script>
 *   4. site-actions.js가 자동으로 window.PRES_NAV_DATA.pages를 사용
 *
 * 스키마:
 *   window.PRES_NAV_DATA = {
 *     version: '1.0',
 *     pages: [
 *       { group: '<섹션 표시명>', items: [
 *         { file: '<페이지 파일명>.html', label: '<드롭다운 표시 라벨>' },
 *         ...
 *       ]},
 *       ...
 *     ]
 *   };
 *
 * 규칙:
 *   - file 값은 site-actions.js와 같은 디렉터리 기준 상대경로
 *   - label은 사용자에게 보일 한글/이모지 자유
 *   - group은 PART/CHAPTER/STAGE 등 — 발표 흐름의 큰 구획
 *   - 인덱스 페이지는 group '목차' 안에 두는 것이 관례
 */
(function () {
  'use strict';
  window.PRES_NAV_DATA = {
    version: '1.0',
    pages: [
      { group: '목차', items: [
        { file: 'index.html', label: '🏠  목차 (INDEX)' }
      ]},
      { group: 'PART 1 · {섹션 1 제목}', items: [
        { file: '01-1.html', label: '1.1  {페이지 1 제목}' },
        { file: '01-2.html', label: '1.2  {페이지 2 제목}' }
      ]},
      { group: 'PART 2 · {섹션 2 제목}', items: [
        { file: '02-1.html', label: '2.1  {페이지 제목}' }
      ]},
      { group: 'CLOSING', items: [
        { file: '99.html', label: '◆  {마무리 페이지}' }
      ]}
    ]
  };
})();
