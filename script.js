const members = [
  { name: "신유", img: "https://i.imgur.com/5L6wDru.png" },
  { name: "도훈", img: "https://i.imgur.com/hPrDoAd.png" },
  { name: "영재", img: "https://i.imgur.com/jaBqdU9.png" },
  { name: "한진", img: "https://i.imgur.com/dlN47CT.png" },
  { name: "지훈", img: "https://i.imgur.com/3jElNXL.png" },
  { name: "경민", img: "https://i.imgur.com/0qLTCdv.png" }
];

const CANVAS_W = 1200;
const CANVAS_H = 900;

const STEP = 10;            // 10% 단위
const FIXED_WIDTH = 50;     // 결과 바 길이 항상 50%
const MAX_CHARS = 100;      // 한글 기준 띄어쓰기 포함 100자 제한
const BASE_FONT = 12;       // 기본 12
const MIN_FONT = 10;        // 최소 10

const inputs = document.getElementById("inputs");
const resultList = document.getElementById("resultList");

/* 입력 UI 생성 */
members.forEach((m, i) => {
  inputs.innerHTML += `
    <div class="member-control">
      <div class="member-header">
        <img src="${m.img}" crossorigin="anonymous" alt="${m.name}">
        <strong>${m.name}</strong>
      </div>

      <div class="range-row">
        <span class="side">공 <b id="gPct${i}">50%</b></span>

        <input
          type="range"
          min="0"
          max="100"
          step="${STEP}"
          value="50"
          id="range${i}"
          aria-label="${m.name} 공수 비율"
        >

        <span class="side">수 <b id="sPct${i}">50%</b></span>
      </div>

      <textarea id="text${i}" placeholder="텍스트 작성" maxlength="${MAX_CHARS}"></textarea>
    </div>
  `;

  resultList.innerHTML += `
    <div class="card">
      <img src="${m.img}" crossorigin="anonymous" alt="${m.name}">
      <div class="content">
        <div class="bar-wrap">
          공
          <div class="bar">
            <div class="bar-inner" id="bar${i}"></div>
          </div>
          수
        </div>
        <div class="result-text" id="resultText${i}"></div>
      </div>
    </div>
  `;
});

/* ✅ 텍스트 길이에 따라 폰트 자동 축소 (12 → 최소 10) */
function applyAutoFont(el, text){
  const len = text.length;

  // 가볍게 3단계만 쓰는 게 안정적 (줄바꿈/폰트 차이에도 덜 깨짐)
  let size = BASE_FONT;
  if (len > 80) size = 10;
  else if (len > 60) size = 11;
  else size = 12;

  if (size < MIN_FONT) size = MIN_FONT;
  el.style.fontSize = size + "px";
}

/* ✅ 입력 슬라이더 퍼센트 실시간 */
members.forEach((_, i) => {
  const r = document.getElementById(`range${i}`);
  const gPct = document.getElementById(`gPct${i}`);
  const sPct = document.getElementById(`sPct${i}`);

  const sync = () => {
    // step=10이라 사실상 스냅 필요 없지만 안전하게 유지
    let g = Math.round(Number(r.value) / STEP) * STEP;
    g = Math.max(0, Math.min(100, g));
    const s = 100 - g;

    gPct.textContent = `${g}%`;
    sPct.textContent = `${s}%`;
  };

  r.addEventListener("input", sync);
  sync();

  // 텍스트 입력도 즉시 100자 제한 (모바일 키보드/붙여넣기 대비)
  const t = document.getElementById(`text${i}`);
  t.addEventListener("input", () => {
    if (t.value.length > MAX_CHARS) t.value = t.value.slice(0, MAX_CHARS);
  });
});

/* ✅ 모바일/좁은 화면에서 결과 자동 축소 */
function applyPreviewScale(){
  const preview = document.getElementById("preview");
  const root = document.documentElement;

  // 좌우 padding 16px * 2 고려
  const available = Math.max(320, window.innerWidth - 32);
  const scale = Math.min(1, available / CANVAS_W);

  root.style.setProperty("--previewScale", String(scale));
  if (preview) preview.style.height = (CANVAS_H * scale) + "px";
}

window.addEventListener("resize", () => {
  // 결과 화면에서만 적용하면 됨
  if (document.getElementById("result").style.display === "block") {
    applyPreviewScale();
  }
});

/* 결과 생성 */
function generate() {
  members.forEach((_, i) => {
    const r = document.getElementById(`range${i}`);
    let g = Math.round(Number(r.value) / STEP) * STEP;
    g = Math.max(0, Math.min(100, g));
    r.value = g;

    const s = 100 - g;

    // 입력 퍼센트 동기화
    document.getElementById(`gPct${i}`).textContent = `${g}%`;
    document.getElementById(`sPct${i}`).textContent = `${s}%`;

    // ✅ 결과 바: 길이 고정 + 위치만 이동
    const bar = document.getElementById(`bar${i}`);

    /*
      FIXED_WIDTH=50%일 때
      g=100 -> left=0
      g=50  -> left=25 (가운데)
      g=0   -> left=50
    */
    const left = (100 - g) / 2;

    bar.style.width = FIXED_WIDTH + "%";
    bar.style.left = left + "%";

    // 텍스트 반영 + 폰트 자동 축소
    const text = (document.getElementById(`text${i}`).value || " ").slice(0, MAX_CHARS);
    const out = document.getElementById(`resultText${i}`);
    out.innerText = text;
    applyAutoFont(out, text);
  });

  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";

  // ✅ 결과가 뜬 다음에 축소 스케일 적용 (모바일 정방형 문제 해결)
  applyPreviewScale();

  // 스크롤 이동
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

/* 이미지 저장: ✅ 항상 1200x900으로 저장(용량 최소화) */
async function saveImage() {
  const root = document.documentElement;
  const preview = document.getElementById("preview");
  const capture = document.getElementById("capture");

  // 현재 미리보기 스케일 백업
  const prevScale = getComputedStyle(root).getPropertyValue("--previewScale").trim() || "1";
  const prevH = preview ? preview.style.height : "";

  // ✅ 저장할 때는 원본 크기(스케일 1)로 잠깐 변경
  root.style.setProperty("--previewScale", "1");
  if (preview) preview.style.height = CANVAS_H + "px";

  // 렌더 반영 대기 (안 하면 저장이 찌그러질 수 있음)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try{
    const canvas = await html2canvas(capture, {
      scale: 1,               // ✅ 1200x900 그대로
      width: CANVAS_W,
      height: CANVAS_H,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#fff"
    });

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "gong_su_1200x900.png";
    a.click();
  } catch (err){
    alert("이미지 저장 실패: 멤버 이미지가 캡처에서 막혔을 수 있어요(CORS).");
    console.error(err);
  } finally {
    // ✅ 다시 미리보기 스케일로 복구
    root.style.setProperty("--previewScale", prevScale);
    if (preview) preview.style.height = prevH || (CANVAS_H * Number(prevScale)) + "px";
  }
}
