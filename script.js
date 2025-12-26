const members = [
  { name: "신유", img: "https://i.imgur.com/5L6wDru.png" },
  { name: "도훈", img: "https://i.imgur.com/hPrDoAd.png" },
  { name: "영재", img: "https://i.imgur.com/jaBqdU9.png" },
  { name: "한진", img: "https://i.imgur.com/dlN47CT.png" },
  { name: "지훈", img: "https://i.imgur.com/3jElNXL.png" },
  { name: "경민", img: "https://i.imgur.com/0qLTCdv.png" }
];

const inputs = document.getElementById("inputs");
const resultList = document.getElementById("resultList");

/** ===== 텍스트 정책 =====
 * - 한글 기준(띄어쓰기 포함) 100자 제한
 * - 결과 박스에 넣을 때 폰트 12 -> 최소 10까지 자동 축소
 */
const MAX_CHARS = 100;
const FONT_MAX = 12;
const FONT_MIN = 10;

function clampTextToMaxChars(str, maxChars = MAX_CHARS) {
  // 한글/영문 모두 “글자 수” 기준으로 제한 (띄어쓰기 포함)
  if (!str) return "";
  return str.length > maxChars ? str.slice(0, maxChars) : str;
}

function fitTextFont(el, basePx = FONT_MAX, minPx = FONT_MIN) {
  // el: 결과 텍스트 박스(.result-text)
  // 내용이 박스 높이를 넘치면 폰트를 줄여서 맞춤 (최소 minPx)
  if (!el) return;

  // 일단 기본 폰트로 리셋
  el.style.fontSize = basePx + "px";

  // 스크롤이 생기면 넘친다는 뜻
  let size = basePx;
  // 레이아웃 계산을 위해 한번 강제 리플로우
  void el.offsetHeight;

  while (size > minPx && el.scrollHeight > el.clientHeight + 1) {
    size -= 1;
    el.style.fontSize = size + "px";
    void el.offsetHeight;
  }
}

/* 입력 UI 생성 */
members.forEach((m, i) => {
  inputs.innerHTML += `
    <div class="member-control">
      <div class="member-header">
        <img src="${m.img}" crossorigin="anonymous">
        <strong>${m.name}</strong>
      </div>

      <div class="range-row">
        <span class="side">공 <b id="gPct${i}">50%</b></span>
        <input type="range" min="0" max="100" value="50" step="10" id="range${i}" aria-label="${m.name} 공수 비율">
        <span class="side">수 <b id="sPct${i}">50%</b></span>
      </div>

      <textarea id="text${i}" placeholder="텍스트 작성" maxlength="${MAX_CHARS}"></textarea>
    </div>
  `;

  resultList.innerHTML += `
    <div class="card">
      <img src="${m.img}" crossorigin="anonymous">
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

/* 텍스트 입력: 100자 초과 방지(붙여넣기 포함) */
members.forEach((_, i) => {
  const ta = document.getElementById(`text${i}`);
  if (!ta) return;

  const enforce = () => {
    const fixed = clampTextToMaxChars(ta.value, MAX_CHARS);
    if (ta.value !== fixed) ta.value = fixed;
  };

  ta.addEventListener("input", enforce);
  ta.addEventListener("paste", () => setTimeout(enforce, 0));
});

/* 슬라이더 실시간 (10% 단위 유지) */
members.forEach((_, i) => {
  const r = document.getElementById(`range${i}`);
  const gPct = document.getElementById(`gPct${i}`);
  const sPct = document.getElementById(`sPct${i}`);

  const STEP = 10;

  const sync = () => {
    const snapped = Math.round(Number(r.value) / STEP) * STEP;
    const g = snapped;          // ✅ 왼쪽(공) 값 그대로
    const s = 100 - g;
    gPct.textContent = `${g}%`;
    sPct.textContent = `${s}%`;
  };

  r.addEventListener("input", sync);
  r.addEventListener("change", () => {
    r.value = Math.round(Number(r.value) / STEP) * STEP;
    sync();
  });

  sync();
});

/* 결과 생성 */
function generate() {
  const FIXED_WIDTH = 50; // 색칠된 바는 항상 50%
  const STEP = 10;        // 10% 단위 스냅

  members.forEach((_, i) => {
    const r = document.getElementById(`range${i}`);

    // 1) 슬라이더 값 스냅
    let g = Math.round(Number(r.value) / STEP) * STEP;
    g = Math.max(0, Math.min(100, g));
    r.value = g;

    const s = 100 - g;

    // 2) 입력쪽 퍼센트 반영
    const gPct = document.getElementById(`gPct${i}`);
    const sPct = document.getElementById(`sPct${i}`);
    if (gPct && sPct) {
      gPct.textContent = `${g}%`;
      sPct.textContent = `${s}%`;
    }

    // 3) 결과 바: 길이 고정 + 위치만 이동
    // 공 100 -> left 0 / 공 50 -> left 25 / 공 0 -> left 50
    const bar = document.getElementById(`bar${i}`);
    const left = (100 - g) / 2;

    bar.style.width = FIXED_WIDTH + "%";
    bar.style.left = left + "%";

    // 4) 텍스트: 100자 제한 + 자동 폰트 맞춤
    const ta = document.getElementById(`text${i}`);
    const out = document.getElementById(`resultText${i}`);

    const text = clampTextToMaxChars((ta?.value || "").trim(), MAX_CHARS);
    out.textContent = text || " ";

    // 폰트 자동 축소(12 -> 10)
    fitTextFont(out, FONT_MAX, FONT_MIN);
  });

  // 5) 화면 전환
  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

/* 이미지 저장 */
function saveImage() {
  html2canvas(document.getElementById("capture"), {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#fff"
  }).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "gong_su_4x3.png";
    a.click();
  }).catch(err => {
    alert("이미지 저장 실패: 멤버 이미지가 캡처에서 막혔을 수 있어요(CORS).");
    console.error(err);
  });
}
