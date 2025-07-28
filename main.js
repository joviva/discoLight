const discoBall = document.getElementById("discoBall");
const btn = document.getElementById("toggleLightBtn");

let state = 0; // 0: off, 1: on, 2: blink, 3: disco
let blinkInterval = null;
let discoInterval = null;
let stream = null;
let track = null;
let torchOn = false;
let requesting = false;

async function getTorchTrack() {
  if (track && stream) return track;
  if (requesting) return null;
  requesting = true;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    track = stream.getVideoTracks()[0];
    requesting = false;
    return track;
  } catch (e) {
    requesting = false;
    return null;
  }
}

async function turnOnTorch(on, color) {
  if (!("mediaDevices" in navigator)) return;
  if (on) {
    const t = await getTorchTrack();
    if (t && ("torch" in t.getSettings() || "torch" in t.getCapabilities())) {
      try {
        await t.applyConstraints({ advanced: [{ torch: true }] });
        torchOn = true;
      } catch (e) {}
    }
  } else {
    if (track) {
      try {
        track.applyConstraints({ advanced: [{ torch: false }] });
      } catch (e) {}
      // Do not stop the stream, just turn off torch
      torchOn = false;
    }
  }
}

function setDiscoBallColor(color) {
  discoBall.style.boxShadow = `0 0 40px 10px ${color}, 0 0 80px 20px #0ff, 0 0 120px 40px #f0f`;
  discoBall.style.background = `radial-gradient(circle at 60% 40%, ${color} 60%, #ccc 100%)`;
}

function resetDiscoBall() {
  discoBall.style.boxShadow = "";
  discoBall.style.background = "";
}

btn.addEventListener("click", () => {
  state = (state + 1) % 4;
  clearInterval(blinkInterval);
  clearInterval(discoInterval);
  blinkInterval = null;
  discoInterval = null;
  turnOnTorch(false);
  resetDiscoBall();
  if (state === 1) {
    // ON
    turnOnTorch(true);
    setDiscoBallColor("#fff");
    btn.textContent = "Blink Light";
  } else if (state === 2) {
    // BLINK
    let on = false;
    blinkInterval = setInterval(() => {
      on = !on;
      turnOnTorch(on);
      setDiscoBallColor(on ? "#fff" : "#222");
    }, 400);
    btn.textContent = "Disco Light";
  } else if (state === 3) {
    // DISCO
    const colors = ["#ff0", "#0ff", "#f0f", "#0f0", "#f00", "#00f", "#fff"];
    let i = 0;
    discoInterval = setInterval(() => {
      turnOnTorch(true);
      setDiscoBallColor(colors[i % colors.length]);
      i++;
    }, 200);
    btn.textContent = "Turn Off";
  } else {
    // OFF
    turnOnTorch(false);
    resetDiscoBall();
    btn.textContent = "Turn On Light";
  }
});

// Initial state
btn.textContent = "Turn On Light";
