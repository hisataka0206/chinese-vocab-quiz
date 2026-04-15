const startScreen = document.getElementById('start-screen');
const reviewScreen = document.getElementById('review-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const btnStart = document.getElementById('btn-start');
const btnGotoReview = document.getElementById('btn-goto-review');
const btnReviewStart = document.getElementById('btn-review-start');
const btnReviewBack = document.getElementById('btn-review-back');
const btnNext = document.getElementById('btn-next');
const btnRestart = document.getElementById('btn-restart');
const btnHome = document.getElementById('btn-home');
const countBtns = document.querySelectorAll('.count-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const reviewCountBtns = document.querySelectorAll('.review-count-btn');
const statusText = document.getElementById('local-status');
const setupPanel = document.getElementById('setup-panel');
const playerNameInput = document.getElementById('player-name');
const logStatusEl = document.getElementById('log-status');
const reviewStatusEl = document.getElementById('review-status');
const reviewPanel = document.getElementById('review-panel');
const reviewPoolInfo = document.getElementById('review-pool-info');

let fullVocabList = [];
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedCount = 10;
let playerName = '';
let quizStartTs = 0;
let details = []; // per-question log

// Review-mode state
let reviewRecords = [];         // raw fetched records from GAS
let reviewLatestByWord = {};    // word -> {isCorrect, timestamp} (most recent per word)
let reviewMode = 'wrong';       // 'wrong' | 'correct'
let reviewSelectedCount = 10;

// Utility: Array Shuffle (Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Init
async function loadVocab() {
    try {
        statusText.innerText = "辞書データを読み込み中...";
        // Fetch static json file
        const res = await fetch('local_vocab.json');
        if (!res.ok) throw new Error("JSON Fetch Failed");

        fullVocabList = await res.json();

        if (fullVocabList.length >= 4) {
            statusText.innerText = `読み込み完了: ${fullVocabList.length} 件の単語が登録されています。`;
            setupPanel.classList.remove('hidden');
        } else {
            statusText.innerText = `エラー: 辞書データが不足しています（最低4単語必要です）。`;
        }
    } catch (e) {
        console.error("Vocabulary Load Error:", e);
        statusText.innerText = "辞書データの読み込みに失敗しました。GitHub Actionsでの初回デプロイをお待ちください。";
    }
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Handle question count selection (start screen)
countBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        countBtns.forEach(b => b.classList.remove('active-count'));
        e.target.classList.add('active-count');
        selectedCount = parseInt(e.target.getAttribute('data-count'));
    });
});

// Handle mode selection (review screen)
modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active-count'));
        e.target.classList.add('active-count');
        reviewMode = e.target.getAttribute('data-mode');
        updateReviewPoolInfo();
    });
});

// Handle count selection (review screen)
reviewCountBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        reviewCountBtns.forEach(b => b.classList.remove('active-count'));
        e.target.classList.add('active-count');
        reviewSelectedCount = parseInt(e.target.getAttribute('data-count'));
        updateReviewPoolInfo();
    });
});

// Build a quiz from the given pool of target words (must be entries of fullVocabList shape)
function startQuizWithPool(pool) {
    // Capture player name and start timestamp; reset per-question log
    playerName = (playerNameInput && playerNameInput.value || '').trim();
    quizStartTs = Date.now();
    details = [];

    const shuffledPool = shuffle([...pool]);
    const targetWords = shuffledPool; // caller already sliced to desired size

    questions = targetWords.map(target => {
        const correctMeaning = target.meaning;

        // Find distractors from FULL vocab list (not from pool) so review quizzes still have enough variety
        let uniqueMeanings = [...new Set(fullVocabList.filter(v => v.meaning !== correctMeaning).map(v => v.meaning))];
        let distractors = [];

        if (uniqueMeanings.length >= 3) {
            distractors = shuffle(uniqueMeanings).slice(0, 3);
        } else {
            let flatList = fullVocabList.filter(v => v.meaning !== correctMeaning).map(v => v.meaning);
            distractors = shuffle(flatList).slice(0, 3);
        }

        let choices = [...distractors, correctMeaning];
        choices = shuffle(choices);

        return {
            word: target.word,
            choices: choices,
            correct_idx: choices.indexOf(correctMeaning),
            pinyin: target.pinyin,
            context_cn: target.context_cn,
            meaning: correctMeaning
        };
    });

    currentQuestionIndex = 0;
    score = 0;
    renderQuestion();
    showScreen(quizScreen);
}

// Start Quiz logic (normal mode - random from full vocab)
btnStart.addEventListener('click', () => {
    const qCount = Math.min(selectedCount, fullVocabList.length);
    if (qCount < 4) return alert("データが足りません");

    const pool = shuffle([...fullVocabList]).slice(0, qCount);
    startQuizWithPool(pool);
});

// ---- Review mode ----

btnGotoReview.addEventListener('click', async () => {
    const name = (playerNameInput && playerNameInput.value || '').trim();
    if (!name) {
        alert('先にパスワードを入力してください。');
        return;
    }

    // Reset review state and show screen
    reviewRecords = [];
    reviewLatestByWord = {};
    reviewMode = 'wrong';
    reviewSelectedCount = 10;

    // Reset toggles visually to defaults
    modeBtns.forEach(b => b.classList.remove('active-count'));
    const defaultMode = document.querySelector('.mode-btn[data-mode="wrong"]');
    if (defaultMode) defaultMode.classList.add('active-count');

    reviewCountBtns.forEach(b => b.classList.remove('active-count'));
    const defaultCount = document.querySelector('.review-count-btn[data-count="10"]');
    if (defaultCount) defaultCount.classList.add('active-count');

    reviewPanel.classList.add('hidden');
    reviewPoolInfo.innerText = '';
    btnReviewStart.disabled = true;

    showScreen(reviewScreen);
    reviewStatusEl.innerText = '履歴を取得しています...';

    const cfg = window.QUIZ_CONFIG || {};
    if (!cfg.gasUrl) {
        reviewStatusEl.innerText = 'サーバー設定がないため復習モードは利用できません。';
        return;
    }

    try {
        const res = await fetch(cfg.gasUrl, {
            method: 'POST',
            body: JSON.stringify({
                secret: cfg.sharedSecret || '',
                action: 'fetch',
                name: name
            }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            redirect: 'follow'
        });
        const rawText = await res.text();
        let json;
        try { json = JSON.parse(rawText); }
        catch (_) { json = { ok: false, error: 'invalid_response', raw: rawText.slice(0, 200) }; }
        console.log('[review] GAS response:', json);
        if (!json.ok) {
            if (json.error === 'not_allowed') {
                reviewStatusEl.innerText = 'このパスワードでは履歴を参照できません。';
            } else {
                reviewStatusEl.innerText = '取得に失敗しました: ' + (json.error || 'unknown') + (json.raw ? ' / ' + json.raw : '');
            }
            return;
        }

        if (!('records' in json)) {
            reviewStatusEl.innerText = 'GAS 側の応答に records が含まれていません。新バージョンで再デプロイされているか確認してください。';
            return;
        }

        reviewRecords = Array.isArray(json.records) ? json.records : [];
        reviewLatestByWord = aggregateLatestByWord(reviewRecords);

        const totalWords = Object.keys(reviewLatestByWord).length;
        if (totalWords === 0) {
            reviewStatusEl.innerText = '履歴がまだありません。まずは通常モードで何問か解いてください。';
            return;
        }

        reviewStatusEl.innerText = `履歴 ${reviewRecords.length} 件 / ユニーク ${totalWords} 単語を取得しました。`;
        reviewPanel.classList.remove('hidden');
        updateReviewPoolInfo();
    } catch (err) {
        reviewStatusEl.innerText = '通信エラー: ' + err.message;
    }
});

btnReviewBack.addEventListener('click', () => {
    showScreen(startScreen);
});

btnReviewStart.addEventListener('click', () => {
    const pool = buildReviewPool();
    if (pool.length < 4) {
        alert('該当する単語が少なすぎます(4問未満)。別のモードをお試しください。');
        return;
    }
    const qCount = Math.min(reviewSelectedCount, pool.length);
    const trimmed = shuffle([...pool]).slice(0, qCount);
    startQuizWithPool(trimmed);
});

function aggregateLatestByWord(records) {
    const latest = {};
    records.forEach(r => {
        if (!r || !r.word) return;
        const prev = latest[r.word];
        if (!prev || String(r.timestamp || '') > String(prev.timestamp || '')) {
            latest[r.word] = { isCorrect: !!r.isCorrect, timestamp: r.timestamp || '' };
        }
    });
    return latest;
}

function buildReviewPool() {
    const wordByKey = {};
    fullVocabList.forEach(v => { wordByKey[v.word] = v; });

    const pool = [];
    Object.keys(reviewLatestByWord).forEach(word => {
        const rec = reviewLatestByWord[word];
        const matches = reviewMode === 'wrong' ? !rec.isCorrect : rec.isCorrect;
        if (!matches) return;
        const entry = wordByKey[word];
        if (entry) pool.push(entry); // skip words no longer in dictionary
    });
    return pool;
}

function updateReviewPoolInfo() {
    const pool = buildReviewPool();
    const label = reviewMode === 'wrong' ? '間違えた' : '正解した';
    if (pool.length === 0) {
        reviewPoolInfo.innerText = `最新の試行で${label}単語はありません。`;
        btnReviewStart.disabled = true;
        return;
    }
    const q = Math.min(reviewSelectedCount, pool.length);
    reviewPoolInfo.innerText = `最新の試行で${label}単語: ${pool.length} 件 / 出題 ${q} 問`;
    btnReviewStart.disabled = q < 4;
}

// ---- Quiz rendering (shared) ----

function renderQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById('question-counter').innerText = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('score-display').innerText = `Score: ${score}`;
    document.getElementById('target-word').innerText = q.word;

    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    document.getElementById('feedback-panel').classList.add('hidden');

    q.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice;
        btn.onclick = () => handleAnswer(index, btn, q);
        container.appendChild(btn);
    });
}

function handleAnswer(selectedIndex, btn, q) {
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach(b => b.disabled = true); // lock answers

    const isCorrect = selectedIndex === q.correct_idx;
    if (isCorrect) {
        btn.classList.add('correct');
        score++;
        document.getElementById('score-display').innerText = `Score: ${score}`;
    } else {
        btn.classList.add('incorrect');
        allBtns[q.correct_idx].classList.add('correct');
    }

    // Record per-question detail for optional server-side logging
    details.push({
        word: q.word,
        pinyin: q.pinyin || '',
        correctMeaning: q.meaning,
        selectedMeaning: q.choices[selectedIndex],
        isCorrect: isCorrect
    });

    showFeedback(isCorrect, q);
}

function showFeedback(isCorrect, q) {
    const panel = document.getElementById('feedback-panel');
    panel.classList.remove('hidden', 'correct-bg', 'incorrect-bg');
    panel.classList.add(isCorrect ? 'correct-bg' : 'incorrect-bg');

    document.getElementById('feedback-title').innerText = isCorrect ? '🎉 正解！' : '❌ 不正解...';
    document.getElementById('feedback-meaning').innerText = q.meaning;
    document.getElementById('feedback-pinyin').innerText = q.pinyin || '-';
    document.getElementById('feedback-context').innerText = q.context_cn || '-';
}

btnNext.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    document.getElementById('final-score').innerText = score;
    const total = questions.length;
    document.querySelector('.total').innerText = `/${total}`;

    const msg = document.getElementById('result-message');
    if (score === total) msg.innerText = "パーフェクト！素晴らしいです🎉";
    else if (score >= total * 0.8) msg.innerText = "よくできました！👍";
    else msg.innerText = "さらに復習して定着させましょう！💪";

    // Update circle degree
    const circle = document.querySelector('.score-circle');
    const deg = (score / total) * 360;
    circle.style.background = `conic-gradient(var(--primary) ${deg}deg, rgba(255,255,255,0.1) 0)`;

    showScreen(resultsScreen);

    // Reset log indicator before sending
    if (logStatusEl) {
        logStatusEl.classList.remove('success', 'error');
        logStatusEl.classList.add('hidden');
        logStatusEl.innerText = '';
    }

    // Fire-and-forget log upload to GAS backend (if configured)
    sendLog(total).catch(err => console.error('log error:', err));
}

function setLogStatus(text, kind) {
    if (!logStatusEl) return;
    logStatusEl.classList.remove('hidden', 'success', 'error');
    if (kind) logStatusEl.classList.add(kind);
    logStatusEl.innerText = text;
}

async function sendLog(total) {
    const cfg = window.QUIZ_CONFIG || {};
    if (!cfg.gasUrl) {
        // Logging disabled (no backend configured). Silent.
        if (logStatusEl) logStatusEl.classList.add('hidden');
        return;
    }

    const durationSec = quizStartTs > 0 ? Math.round((Date.now() - quizStartTs) / 1000) : 0;
    const payload = {
        secret: cfg.sharedSecret || '',
        name: playerName,
        questionCount: total,
        correctCount: score,
        scorePercent: total > 0 ? Math.round((score / total) * 100) : 0,
        durationSec: durationSec,
        details: details
    };

    setLogStatus('記録を送信中...', null);
    try {
        // Use text/plain to avoid CORS preflight. GAS parses e.postData.contents as JSON.
        const res = await fetch(cfg.gasUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            redirect: 'follow'
        });
        const json = await res.json().catch(() => ({ ok: false, error: 'invalid_response' }));
        if (json.ok) {
            setLogStatus(json.detailsLogged ? '記録しました(詳細含む)' : '記録しました', 'success');
        } else {
            setLogStatus('記録に失敗しました: ' + (json.error || 'unknown'), 'error');
        }
    } catch (err) {
        setLogStatus('送信エラー: ' + err.message, 'error');
    }
}

btnRestart.addEventListener('click', () => {
    showScreen(startScreen);
});
btnHome.addEventListener('click', () => {
    showScreen(startScreen);
});

// Initialize on load
loadVocab();
