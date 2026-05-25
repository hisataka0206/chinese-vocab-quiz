// Pinyin Trainer - 発音可視化アプリ
// Pitch detection (autocorrelation) + ideal tone overlay
// 苦手62語プリセット (2026-05-25 分析より抽出)

const WEAK_WORDS = [
  // [2-1]
  { w: "直播", p: "zhí bō", m: "PodCast、ブロードキャスト", tones: [2,1] },
  { w: "衔接", p: "xián jiē", m: "つなぎめ、接続", tones: [2,1] },
  { w: "提高", p: "tí gāo", m: "高める、増やす", tones: [2,1] },
  { w: "航天", p: "háng tiān", m: "宇宙航行", tones: [2,1] },
  { w: "核心", p: "hé xīn", m: "コア", tones: [2,1] },
  { w: "龙头", p: "lóng tóu", m: "リーダー、トップ", tones: [2,2] },
  // [2-4]
  { w: "头部", p: "tóu bù", m: "頭部", tones: [2,4] },
  { w: "甚至", p: "shèn zhì", m: "even、〜すらも", tones: [4,4] }, // actually 4-4
  { w: "迭代", p: "dié dài", m: "繰り返し、イテレート", tones: [2,4] },
  { w: "劳动", p: "láo dòng", m: "労働", tones: [2,4] },
  { w: "零售", p: "líng shòu", m: "小売、リテール", tones: [2,4] },
  { w: "行业", p: "háng yè", m: "業界", tones: [2,4] },
  // [1-3]
  { w: "缩短", p: "suō duǎn", m: "短縮する", tones: [1,3] },
  { w: "编程", p: "biān chéng", m: "プログラム", tones: [1,2] }, // actually 1-2
  { w: "风险", p: "fēng xiǎn", m: "リスク", tones: [1,3] },
  { w: "分拣", p: "fēn jiǎn", m: "分類", tones: [1,3] },
  { w: "污染", p: "wū rǎn", m: "汚染", tones: [1,3] },
  { w: "抓取", p: "zhuā qǔ", m: "掴み取る", tones: [1,3] },
  // [1-4]
  { w: "关键", p: "guān jiàn", m: "キー、ポイント", tones: [1,4] },
  { w: "监测", p: "jiān cè", m: "モニターする", tones: [1,4] },
  { w: "追溯", p: "zhuī sù", m: "トレーサビリティ", tones: [1,4] },
  { w: "医药", p: "yī yào", m: "医薬", tones: [1,4] },
  { w: "家电", p: "jiā diàn", m: "家電", tones: [1,4] },
  { w: "操作", p: "cāo zuò", m: "操作", tones: [1,4] },
  // [3-4]
  { w: "主站", p: "zhǔ zhàn", m: "マスター", tones: [3,4] },
  { w: "挑战", p: "tiǎo zhàn", m: "挑戦", tones: [3,4] },
  { w: "准确", p: "zhǔn què", m: "正確な", tones: [3,4] },
  { w: "冷链", p: "lěng liàn", m: "コールドチェーン", tones: [3,4] },
  { w: "检测", p: "jiǎn cè", m: "ディテクト", tones: [3,4] },
  // [4-1]
  { w: "聚焦", p: "jù jiāo", m: "フォーカス", tones: [4,1] },
  { w: "滞销", p: "zhì xiāo", m: "デッドストック", tones: [4,1] },
  { w: "订单", p: "dìng dān", m: "注文", tones: [4,1] },
  { w: "弹夹", p: "dàn jiā", m: "マガジン", tones: [4,1] },
  { w: "化工", p: "huà gōng", m: "化学工業", tones: [4,1] },
  // [4-4]
  { w: "换线", p: "huàn xiàn", m: "生産ライン切替", tones: [4,4] },
  { w: "碰撞", p: "pèng zhuàng", m: "衝突", tones: [4,4] },
  { w: "设备", p: "shè bèi", m: "設備", tones: [4,4] },
  { w: "构建", p: "gòu jiàn", m: "構築", tones: [4,4] },
  // [3-3]
  { w: "扭矩", p: "niǔ jǔ", m: "トルク", tones: [3,3] },
  { w: "主板", p: "zhǔ bǎn", m: "メインボード", tones: [3,3] },
  // [3-1]
  { w: "指挥", p: "zhǐ huī", m: "指示、命令", tones: [3,1] },
  { w: "手机", p: "shǒu jī", m: "スマホ", tones: [3,1] },
  // [2-2]
  { w: "环节", p: "huán jié", m: "プロセス", tones: [2,2] },
  // [4-2]
  { w: "远程", p: "yuǎn chéng", m: "遠隔", tones: [3,2] }, // yuǎn=3
  { w: "库存", p: "kù cún", m: "在庫", tones: [4,2] },
  // [4-3]
  { w: "代码", p: "dài mǎ", m: "コード", tones: [4,3] },
  // [3-2]
  { w: "冷凝", p: "lěng níng", m: "凝固", tones: [3,2] },
  // 3 syllables
  { w: "新能源", p: "xīn néng yuán", m: "新エネルギー", tones: [1,2,2] },
  { w: "灵活性", p: "líng huó xìng", m: "柔軟性", tones: [2,2,4] },
  { w: "核电站", p: "hé diàn zhàn", m: "原発", tones: [2,4,4] },
  { w: "锂电池", p: "lǐ diàn chí", m: "リチウム電池", tones: [3,4,2] },
  { w: "履带式", p: "lǚ dài shì", m: "キャタピラ式", tones: [3,4,4] },
  { w: "供应链", p: "gōng yìng liàn", m: "サプライチェーン", tones: [1,4,4] },
  { w: "半导体", p: "bàn dǎo tǐ", m: "半導体", tones: [4,3,3] },
  { w: "开关室", p: "kāi guān shì", m: "開閉室", tones: [1,1,4] },
  { w: "控制器", p: "kòng zhì qì", m: "コントローラー", tones: [4,4,4] },
  // singletons
  { w: "整机", p: "zhěng jī", m: "完成品、コンプリート", tones: [3,1] },
  { w: "维护", p: "wéi hù", m: "守る", tones: [2,4] },
  { w: "卡", p: "kǎ", m: "カード", tones: [3] },
  { w: "键", p: "jiàn", m: "鍵、キー", tones: [4] },
  // additional from 2-2-4 etc
  { w: "感知", p: "gǎn zhī", m: "認識", tones: [3,1] },
  { w: "决策", p: "jué cè", m: "意思決定", tones: [2,4] },
  { w: "执行", p: "zhí xíng", m: "実行", tones: [2,2] },
];

// =============================================================
// State
// =============================================================
const state = {
  currentIdx: 0,
  filter: 'ALL',
  filtered: [...WEAK_WORDS],
  audioCtx: null,
  mediaStream: null,
  recording: false,
  pitchTrack: [], // {t: seconds, hz: number}
  recordStartTime: 0,
  recordDuration: 3.0, // seconds (recording window upper bound)
  voicedStart: null,   // sec from recordStart, populated after finalize
  voicedEnd: null,
  finalized: false,    // when true, drawUser uses voiced range; else uses [0, recordDuration]
  loopMode: false,
};

// =============================================================
// DOM
// =============================================================
const $ = (id) => document.getElementById(id);
const comboFilter = $('combo-filter');
const wordSelect = $('word-select');
const wordCn = $('word-cn');
const wordPy = $('word-py');
const wordMeaning = $('word-meaning');
const wordCombo = $('word-combo');
const btnPlay = $('btn-play');
const btnRecord = $('btn-record');
const btnLoop = $('btn-loop');
const btnPrev = $('btn-prev');
const btnNext = $('btn-next');
const btnRandom = $('btn-random');
const statusEl = $('status');
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = $('score');
const toneScoresEl = $('tone-scores');

// =============================================================
// Initialization
// =============================================================
function init() {
  // Build combo filter
  const combos = new Map();
  WEAK_WORDS.forEach((w) => {
    const k = w.tones.join('-');
    combos.set(k, (combos.get(k) || 0) + 1);
  });
  const sortedCombos = [...combos.entries()].sort((a, b) => b[1] - a[1]);
  sortedCombos.forEach(([k, n]) => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${k}声 (${n}語)`;
    comboFilter.appendChild(o);
  });

  comboFilter.addEventListener('change', () => {
    state.filter = comboFilter.value;
    state.filtered = state.filter === 'ALL'
      ? [...WEAK_WORDS]
      : WEAK_WORDS.filter((w) => w.tones.join('-') === state.filter);
    state.currentIdx = 0;
    rebuildWordSelect();
    showCurrent();
  });

  wordSelect.addEventListener('change', () => {
    state.currentIdx = parseInt(wordSelect.value, 10);
    showCurrent();
  });

  btnPrev.addEventListener('click', () => {
    state.currentIdx = (state.currentIdx - 1 + state.filtered.length) % state.filtered.length;
    showCurrent();
  });
  btnNext.addEventListener('click', () => {
    state.currentIdx = (state.currentIdx + 1) % state.filtered.length;
    showCurrent();
  });
  btnRandom.addEventListener('click', () => {
    state.currentIdx = Math.floor(Math.random() * state.filtered.length);
    showCurrent();
  });

  btnPlay.addEventListener('click', playReference);
  btnRecord.addEventListener('click', toggleRecord);
  btnLoop.addEventListener('click', () => {
    state.loopMode = !state.loopMode;
    btnLoop.textContent = state.loopMode ? '🔁 連続練習: ON' : '🔁 連続練習';
    statusEl.textContent = state.loopMode
      ? '連続練習モード: 録音→次の単語へ自動遷移'
      : 'マイクの許可を求められたら「許可」を押してください';
  });

  rebuildWordSelect();
  showCurrent();
  drawIdeal();

  window.addEventListener('resize', () => {
    drawIdeal();
    if (state.pitchTrack.length > 0) drawUser();
  });
}

function rebuildWordSelect() {
  wordSelect.innerHTML = '';
  state.filtered.forEach((w, i) => {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = `${w.w} (${w.p})`;
    wordSelect.appendChild(o);
  });
}

function showCurrent() {
  const w = state.filtered[state.currentIdx];
  if (!w) return;
  wordCn.textContent = w.w;
  wordPy.textContent = w.p;
  wordMeaning.textContent = w.m;
  wordCombo.textContent = `${w.tones.join('-')}声 コンビ`;
  wordSelect.value = String(state.currentIdx);
  state.pitchTrack = [];
  state.voicedStart = null;
  state.voicedEnd = null;
  state.finalized = false;
  scoreEl.textContent = '--';
  toneScoresEl.innerHTML = '';
  drawIdeal();
}

// =============================================================
// TTS reference playback
// =============================================================
function playReference() {
  const w = state.filtered[state.currentIdx];
  if (!w) return;
  if (!('speechSynthesis' in window)) {
    statusEl.textContent = '⚠️ お使いのブラウザはTTS非対応です';
    return;
  }
  const u = new SpeechSynthesisUtterance(w.w);
  u.lang = 'zh-CN';
  u.rate = 0.75;
  u.pitch = 1.0;
  // try to pick a Chinese voice
  const voices = speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => /zh[-_]?CN/i.test(v.lang)) ||
                  voices.find((v) => /^zh/i.test(v.lang));
  if (zhVoice) u.voice = zhVoice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  statusEl.textContent = '🔊 お手本を再生中...';
  u.onend = () => { statusEl.textContent = 'お手本完了。録音ボタンで自分の声を録音してください'; };
}

// =============================================================
// Recording & pitch detection
// =============================================================
async function toggleRecord() {
  if (state.recording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioCtx.state === 'suspended') await state.audioCtx.resume();
    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const source = state.audioCtx.createMediaStreamSource(state.mediaStream);
    const analyser = state.audioCtx.createAnalyser();
    analyser.fftSize = 4096;
    source.connect(analyser);
    state.pitchTrack = [];
    state.voicedStart = null;
    state.voicedEnd = null;
    state.finalized = false;
    state.recording = true;
    state.recordStartTime = state.audioCtx.currentTime;
    btnRecord.classList.add('active');
    btnRecord.textContent = '⏹ 停止 (' + state.recordDuration.toFixed(1) + 's)';
    statusEl.textContent = '🎙 録音中... ' + state.filtered[state.currentIdx].w + ' を発音してください';
    drawIdeal();
    pitchLoop(analyser);
    setTimeout(() => { if (state.recording) stopRecording(); }, state.recordDuration * 1000);
  } catch (e) {
    statusEl.textContent = '⚠️ マイクへのアクセスが拒否されました: ' + e.message;
    state.recording = false;
  }
}

function stopRecording() {
  state.recording = false;
  btnRecord.classList.remove('active');
  btnRecord.textContent = '⏺ 録音';
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach((t) => t.stop());
    state.mediaStream = null;
  }
  statusEl.textContent = '録音完了。分析中...';
  finalizeAnalysis();
  if (state.loopMode) {
    setTimeout(() => {
      state.currentIdx = (state.currentIdx + 1) % state.filtered.length;
      showCurrent();
      setTimeout(() => playReference(), 300);
      setTimeout(() => startRecording(), 2000);
    }, 1500);
  }
}

function pitchLoop(analyser) {
  if (!state.recording) return;
  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  const hz = autoCorrelate(buf, state.audioCtx.sampleRate);
  const t = state.audioCtx.currentTime - state.recordStartTime;
  if (hz > 60 && hz < 600) {
    state.pitchTrack.push({ t, hz });
  } else {
    // silence/unvoiced - still record gap marker
    state.pitchTrack.push({ t, hz: null });
  }
  drawUser();
  requestAnimationFrame(() => pitchLoop(analyser));
}

// Autocorrelation pitch detection (simplified)
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  // RMS to check volume
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }
  const trimmed = buf.slice(r1, r2);
  const TRIMSIZE = trimmed.length;
  const c = new Array(TRIMSIZE).fill(0);
  for (let i = 0; i < TRIMSIZE; i++) {
    for (let j = 0; j < TRIMSIZE - i; j++) {
      c[i] = c[i] + trimmed[j] * trimmed[j + i];
    }
  }
  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < TRIMSIZE; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  let T0 = maxpos;
  // parabolic interpolation
  const x1 = c[T0 - 1] || 0, x2 = c[T0] || 0, x3 = c[T0 + 1] || 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);
  return sampleRate / T0;
}

// =============================================================
// Visualization
// =============================================================
function fitCanvas() {
  const w = canvas.clientWidth;
  const h = 320;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

// Draw the ideal tone overlay & background grid
function drawIdeal() {
  const { w, h } = fitCanvas();
  ctx.clearRect(0, 0, w, h);

  // Background grid
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 0, w, h);

  const padX = 40, padY = 30;
  const plotW = w - padX * 2, plotH = h - padY * 2;

  // Horizontal pitch-level lines (5 levels)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.font = '11px Outfit, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let lv = 1; lv <= 5; lv++) {
    const y = padY + plotH * (1 - (lv - 1) / 4);
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();
    ctx.fillText('Lv ' + lv, 6, y + 4);
  }

  // Get current word
  const word = state.filtered[state.currentIdx];
  if (!word) return;
  const tones = word.tones;
  const nSyl = tones.length;

  // Draw syllable dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.setLineDash([4, 4]);
  for (let i = 1; i < nSyl; i++) {
    const x = padX + plotW * (i / nSyl);
    ctx.beginPath();
    ctx.moveTo(x, padY);
    ctx.lineTo(x, h - padY);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Draw ideal tone curves per syllable
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(236,72,153,0.5)';
  ctx.shadowBlur = 10;
  for (let i = 0; i < nSyl; i++) {
    const x0 = padX + plotW * (i / nSyl) + 8;
    const x1 = padX + plotW * ((i + 1) / nSyl) - 8;
    drawIdealTone(tones[i], x0, x1, padY, plotH);
  }
  ctx.shadowBlur = 0;

  // Labels: pinyin per syllable
  ctx.fillStyle = '#a5b4fc';
  ctx.font = '14px Outfit, sans-serif';
  const pinyinParts = word.p.split(/\s+/);
  for (let i = 0; i < nSyl; i++) {
    const xc = padX + plotW * ((i + 0.5) / nSyl);
    const label = (pinyinParts[i] || '') + ' (' + tones[i] + '声)';
    ctx.textAlign = 'center';
    ctx.fillText(label, xc, h - 8);
  }
  ctx.textAlign = 'start';
}

function drawIdealTone(tone, x0, x1, padY, plotH) {
  // Map tone level (1-5) to canvas y (inverted)
  const yOf = (lv) => padY + plotH * (1 - (lv - 1) / 4);
  ctx.beginPath();
  let points;
  switch (tone) {
    case 1: // flat high (5-5)
      points = [[0, 5], [1, 5]]; break;
    case 2: // rising (3-5)
      points = [[0, 3], [1, 5]]; break;
    case 3: // dipping (2-1-4)
      points = [[0, 2.5], [0.45, 1.2], [1, 3.5]]; break;
    case 4: // falling (5-1)
      points = [[0, 5], [1, 1]]; break;
    case 0: // neutral
      points = [[0, 3], [1, 3]]; break;
    default:
      points = [[0, 3], [1, 3]];
  }
  for (let i = 0; i < points.length; i++) {
    const [u, lv] = points[i];
    const x = x0 + (x1 - x0) * u;
    const y = yOf(lv);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Convert recorded pitch (Hz) to relative level 1-5 based on session min/max
function normalizePitch() {
  const voiced = state.pitchTrack.filter((p) => p.hz !== null);
  if (voiced.length < 5) return null;
  const hzs = voiced.map((p) => p.hz);
  hzs.sort((a, b) => a - b);
  // robust min/max: 10th and 90th percentile
  const lo = hzs[Math.floor(hzs.length * 0.1)];
  const hi = hzs[Math.floor(hzs.length * 0.9)];
  const range = Math.max(hi - lo, 30); // semitones equivalent
  return state.pitchTrack.map((p) => {
    if (p.hz === null) return { t: p.t, lv: null };
    const lv = 1 + 4 * ((p.hz - lo) / range);
    return { t: p.t, lv: Math.max(1, Math.min(5, lv)) };
  });
}

function drawUser() {
  drawIdeal();
  const { w, h } = { w: canvas.clientWidth, h: 320 };
  const padX = 40, padY = 30;
  const plotW = w - padX * 2, plotH = h - padY * 2;
  const norm = normalizePitch();
  if (!norm || norm.length === 0) return;

  // Determine time window for X-axis mapping.
  // - finalized=false (live recording): use [0, recordDuration] so the line grows from left
  // - finalized=true: use [voicedStart, voicedEnd] so the user's actual utterance fills the canvas
  let tStart, tEnd;
  if (state.finalized && state.voicedStart !== null && state.voicedEnd !== null) {
    tStart = state.voicedStart;
    tEnd = state.voicedEnd;
  } else {
    tStart = 0;
    tEnd = state.recordDuration;
  }
  const totalDur = Math.max(tEnd - tStart, 0.05);

  const yOf = (lv) => padY + plotH * (1 - (lv - 1) / 4);

  // Draw the user's pitch line
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(6,182,212,0.5)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i < norm.length; i++) {
    const p = norm[i];
    if (p.t < tStart - 0.001 || p.t > tEnd + 0.001) { pen = false; continue; }
    const x = padX + plotW * ((p.t - tStart) / totalDur);
    if (p.lv === null) {
      pen = false;
    } else {
      const y = yOf(p.lv);
      if (!pen) { ctx.moveTo(x, y); pen = true; }
      else ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Duration label at top-right
  ctx.fillStyle = '#a8a8c8';
  ctx.font = '12px Outfit, sans-serif';
  ctx.textAlign = 'right';
  const durLabel = state.finalized
    ? `発声長: ${totalDur.toFixed(2)}秒 (有声区間にフィット)`
    : `録音窓: ${totalDur.toFixed(1)}秒`;
  ctx.fillText(durLabel, w - 6, 16);
  ctx.textAlign = 'start';
}

// =============================================================
// Scoring
// =============================================================
function finalizeAnalysis() {
  // Detect voiced range with hysteresis: trim leading/trailing silence,
  // but tolerate brief unvoiced gaps inside the utterance (between syllables).
  const track = state.pitchTrack;
  let firstVoiced = -1, lastVoiced = -1;
  for (let i = 0; i < track.length; i++) {
    if (track[i].hz !== null) {
      if (firstVoiced === -1) firstVoiced = i;
      lastVoiced = i;
    }
  }
  if (firstVoiced === -1 || lastVoiced - firstVoiced < 3) {
    scoreEl.textContent = '--';
    toneScoresEl.innerHTML = '';
    statusEl.textContent = '⚠️ 音声が検出できませんでした。マイク音量を確認してもう一度お試しください';
    state.finalized = false;
    drawIdeal();
    return;
  }
  // Add a tiny padding so the line doesn't kiss the canvas edges
  const PAD = 0.04; // 40ms
  state.voicedStart = Math.max(0, track[firstVoiced].t - PAD);
  state.voicedEnd = Math.min(state.recordDuration, track[lastVoiced].t + PAD);
  state.finalized = true;
  drawUser();
  computeScore();
}

function computeScore() {
  const word = state.filtered[state.currentIdx];
  if (!word) return;
  const norm = normalizePitch();
  if (!norm || norm.length < 10) {
    scoreEl.textContent = '--';
    statusEl.textContent = '⚠️ 音声が検出できませんでした。もう一度お試しください';
    return;
  }
  const voiced = norm.filter((p) => p.lv !== null);
  if (voiced.length < 10) {
    scoreEl.textContent = '--';
    statusEl.textContent = '⚠️ 有声フレームが少なすぎます。マイク音量を確認してください';
    return;
  }
  const minT = voiced[0].t;
  const maxT = voiced[voiced.length - 1].t;
  const durFrame = Math.max(maxT - minT, 0.2);
  const nSyl = word.tones.length;

  // Per-syllable score
  const perSyl = [];
  for (let i = 0; i < nSyl; i++) {
    const a = minT + durFrame * (i / nSyl);
    const b = minT + durFrame * ((i + 1) / nSyl);
    const segPoints = voiced.filter((p) => p.t >= a && p.t < b);
    if (segPoints.length < 3) {
      perSyl.push({ score: 0, n: segPoints.length });
      continue;
    }
    // Compare to ideal
    const idealPts = getIdealPoints(word.tones[i], 10);
    // Resample segment to 10 points
    const userPts = resample(segPoints.map((p) => p.lv), 10);
    let err = 0;
    for (let k = 0; k < 10; k++) err += Math.abs(userPts[k] - idealPts[k]);
    err /= 10;
    // Convert error to score: 0 error = 100, error 4 = 0
    const score = Math.max(0, Math.min(100, 100 - err * 25));
    perSyl.push({ score, n: segPoints.length });
  }
  const totalScore = Math.round(perSyl.reduce((s, x) => s + x.score, 0) / nSyl);
  scoreEl.textContent = String(totalScore);
  scoreEl.style.color = totalScore >= 75 ? '#10b981' : totalScore >= 50 ? '#f59e0b' : '#ef4444';

  toneScoresEl.innerHTML = '';
  const pinyinParts = word.p.split(/\s+/);
  for (let i = 0; i < nSyl; i++) {
    const div = document.createElement('div');
    div.className = 'tone-score';
    div.innerHTML = `${pinyinParts[i] || ''} (${word.tones[i]}声) <span class="v" style="color:${perSyl[i].score >= 75 ? '#10b981' : perSyl[i].score >= 50 ? '#f59e0b' : '#ef4444'}">${Math.round(perSyl[i].score)}</span>`;
    toneScoresEl.appendChild(div);
  }
  statusEl.textContent = `分析完了 - 総合スコア ${totalScore}/100`;
}

function getIdealPoints(tone, n) {
  let pts;
  switch (tone) {
    case 1: pts = [[0, 5], [1, 5]]; break;
    case 2: pts = [[0, 3], [1, 5]]; break;
    case 3: pts = [[0, 2.5], [0.45, 1.2], [1, 3.5]]; break;
    case 4: pts = [[0, 5], [1, 1]]; break;
    default: pts = [[0, 3], [1, 3]];
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    // piecewise linear interpolation
    let val = pts[0][1];
    for (let k = 0; k < pts.length - 1; k++) {
      if (u >= pts[k][0] && u <= pts[k + 1][0]) {
        const denom = pts[k + 1][0] - pts[k][0];
        const f = denom > 0 ? (u - pts[k][0]) / denom : 0;
        val = pts[k][1] + f * (pts[k + 1][1] - pts[k][1]);
        break;
      }
      val = pts[k + 1][1];
    }
    out.push(val);
  }
  return out;
}

function resample(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const idx = u * (arr.length - 1);
    const lo = Math.floor(idx), hi = Math.min(lo + 1, arr.length - 1);
    const f = idx - lo;
    out.push(arr[lo] * (1 - f) + arr[hi] * f);
  }
  return out;
}

// =============================================================
// Boot
// =============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Pre-load voices for TTS
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {};
  speechSynthesis.getVoices();
}
