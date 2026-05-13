// 온디맨드 동기화 트래커
// 사용법:
//   node _sync_check.js            → 마지막 baseline 이후 변경된 HTML 목록 출력
//   node _sync_check.js --baseline → 현재 시각을 baseline 으로 기록
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const BASELINE_FILE = path.join(dir, '.sync_baseline.json');

const isBaseline = process.argv.includes('--baseline');

const htmls = fs.readdirSync(dir).filter(f => /\.html$/.test(f));
const now = Date.now();

if (isBaseline) {
  const snapshot = {};
  for (const f of htmls) {
    const fp = path.join(dir, f);
    snapshot[f] = fs.statSync(fp).mtimeMs;
  }
  fs.writeFileSync(BASELINE_FILE, JSON.stringify({timestamp: now, files: snapshot}, null, 2));
  console.log(`Baseline 저장: ${htmls.length} 파일, ${new Date(now).toISOString()}`);
  process.exit(0);
}

if (!fs.existsSync(BASELINE_FILE)) {
  console.log('baseline 없음. `node _sync_check.js --baseline` 으로 먼저 기록하세요.');
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
const changed = [];
const added = [];

for (const f of htmls) {
  const fp = path.join(dir, f);
  const mtime = fs.statSync(fp).mtimeMs;
  if (!(f in baseline.files)) {
    added.push(f);
  } else if (mtime > baseline.files[f]) {
    changed.push({file: f, mtime: new Date(mtime).toISOString()});
  }
}

console.log(`Baseline: ${new Date(baseline.timestamp).toISOString()}`);
console.log(`변경된 파일 ${changed.length}건, 신규 ${added.length}건\n`);
if (changed.length) {
  console.log('=== 변경 ===');
  changed.forEach(c => console.log(`  ${c.file}  (${c.mtime})`));
}
if (added.length) {
  console.log('=== 신규 ===');
  added.forEach(f => console.log(`  ${f}`));
}
if (!changed.length && !added.length) {
  console.log('변경 없음');
}
