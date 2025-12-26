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

members.forEach((m, i) => {
  inputs.innerHTML += `
    <div class="member-control">
      <div class="member-header">
        <img src="${m.img}" alt="${m.name}">
        <span>${m.name}</span>
      </div>
      <div class="range-row">
        공
        <input type="range" min="0" max="100" value="50" id="range${i}">
        <span id="value${i}">50%</span>
      </div>
      <textarea id="text${i}" placeholder="텍스트 입력"></textarea>
    </div>
  `;

  resultList.innerHTML += `
    <div class="card">
      <img src="${m.img}" alt="${m.name}">
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

/* 슬라이더 실시간 % */
members.forEach((_, i) => {
  const range = document.getElementById(`range${i}`);
  const value = document.getElementById(`value${i}`);
  range.addEventListener("input", () => {
    value.innerText = range.value + "%";
  });
});

function generate() {
  members.forEach((_, i) => {
    const g = document.getElementById(`range${i}`).value;
    document.getElementById(`bar${i}`).style.width = g + "%";
    document.getElementById(`resultText${i}`).innerText =
      document.getElementById(`text${i}`).value || " ";
  });

  document.getElementById("controls").style.display = "none";
  document.getElementById("result").style.display = "block";
}

function saveImage() {
  html2canvas(document.getElementById("result"), { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "twsrps.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
function saveImage() {
  const target = document.getElementById("result");

  html2canvas(target, {
    scale: 1,
    width: 360,        // 기준 레이아웃 폭
    windowWidth: 360,  // 모바일 기준
  }).then(canvas => {
    const resized = document.createElement("canvas");
    const ctx = resized.getContext("2d");

    const ratio = 1080 / canvas.width;
    resized.width = 1080;
    resized.height = canvas.height * ratio;

    ctx.drawImage(
      canvas,
      0, 0,
      resized.width,
      resized.height
    );

    const link = document.createElement("a");
    link.download = "gong_su_mobile.png";
    link.href = resized.toDataURL("image/png");
    link.click();
  });
}
