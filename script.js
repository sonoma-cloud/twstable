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
  
  <input type="range" min="0" max="100" value="50" id="range${i}" aria-label="${m.name} 공수 비율">

  <span class="side">수 <b id="sPct${i}">50%</b></span>
</div>

      <textarea id="text${i}" placeholder="텍스트 작성"></textarea>
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

/* 슬라이더 실시간 */
members.forEach((_, i) => {
  const r = document.getElementById(`range${i}`);
  const gPct = document.getElementById(`gPct${i}`);
  const sPct = document.getElementById(`sPct${i}`);

  const STEP = 10;

const sync = () => {
  const snapped = Math.round(Number(r.value) / STEP) * STEP;
  const g = 100 - snapped;   // ✅ 방향 반전
  const s = 100 - g;
  gPct.textContent = `${g}%`;
  sPct.textContent = `${s}%`;
};

  r.addEventListener("input", sync);
  r.addEventListener("change", () => {
    // 손 떼면 슬라이더 값 자체도 스냅
    r.value = Math.round(Number(r.value) / STEP) * STEP;
    sync();
  });

  sync();
});

/* 결과 생성 */
function generate() {
  const FIXED_WIDTH = 50; // 항상 50% 길이
  const STEP = 10;        // 10% 단위 스냅

  members.forEach((_, i) => {
    const r = document.getElementById(`range${i}`);

    // 1️⃣ 슬라이더 값 → 10% 단위로 스냅
    let g = Math.round(Number(r.value) / STEP) * STEP;
    g = Math.max(0, Math.min(100, g));
    r.value = g;

    const s = 100 - g;

    // 2️⃣ 입력 화면 퍼센트 동기화
    const gPct = document.getElementById(`gPct${i}`);
    const sPct = document.getElementById(`sPct${i}`);
    if (gPct && sPct) {
      gPct.textContent = `${g}%`;
      sPct.textContent = `${s}%`;
    }

    // 3️⃣ 결과 바 위치 계산
    const bar = document.getElementById(`bar${i}`);

    /*
      기준:
      - bar width = 50%
      - left 범위 = 0 ~ 50

      공 100 → left = 0
      공 50  → left = 25
      공 0   → left = 50
    */
    const left = (100 - g) / 2;

    bar.style.width = FIXED_WIDTH + "%";
    bar.style.left = left + "%";

    // 4️⃣ 텍스트 반영
    document.getElementById(`resultText${i}`).innerText =
      document.getElementById(`text${i}`).value || " ";
  });

  // 5️⃣ 화면 전환
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




