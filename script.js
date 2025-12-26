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

  const sync = () => {
    const g = Number(r.value);
    const s = 100 - g;
    gPct.textContent = `${g}%`;
    sPct.textContent = `${s}%`;
  };

  r.addEventListener("input", sync);
  sync(); // 초기값도 즉시 반영
});

/* 결과 생성 */
function generate() {
  members.forEach((_, i) => {
    const g = Number(document.getElementById(`range${i}`).value);
    const s = 100 - g;

    const bar = document.getElementById(`bar${i}`);

const FIXED_WIDTH = 50; // 색칠된 바는 항상 50%
const STEP = 10;       // 10% 단위 이동

// 50을 기준으로 얼마나 차이 나는지
const delta = Math.round((g - 50) / STEP) * STEP;

// 중앙 기준 left 값
let left = 25 - delta / 2;

// 안전장치 (범위 벗어나지 않게)
left = Math.max(0, Math.min(50, left));

bar.style.width = FIXED_WIDTH + "%";
bar.style.left = left + "%";


    // 중앙 기준 이동
    // g > s → 왼쪽, s > g → 오른쪽
    let left;
    if (g === s) {
      left = 50 - width / 2;
    } else if (g > s) {
      left = 50 - width;
    } else {
      left = 50;
    }

    bar.style.width = width + "%";
    bar.style.left = left + "%";

    document.getElementById(`resultText${i}`).innerText =
      document.getElementById(`text${i}`).value || " ";
  });

  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";
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











