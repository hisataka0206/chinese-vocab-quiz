/**
 * Google Apps Script backend for chinese-vocab-quiz.
 *
 * Setup:
 *   1. Open the target Google Spreadsheet.
 *   2. Extensions → Apps Script. Paste this file's contents into Code.gs.
 *   3. Set SHARED_SECRET below to a random string and use the SAME value in docs/config.js.
 *   4. Deploy → New deployment → Type "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Copy the Web app URL into docs/config.js (gasUrl).
 *   5. When you edit this file later, create a NEW deployment (or "Manage deployments → Edit → New version").
 *
 * Behaviour:
 *   - Summary sheet receives every quiz result (always).
 *   - Details sheet receives per-question results only when the player name
 *     matches one of ALLOWED_DETAIL_USERS (case-insensitive).
 *   - Headers are auto-created on first write so you do not need to set them manually.
 *
 *   - Additionally supports action="fetch" for the review-mode UI:
 *       POST { secret, action: "fetch", name } -> { ok, records: [{word, isCorrect, timestamp}, ...] }
 *     Only names in ALLOWED_DETAIL_USERS can retrieve history (case-insensitive).
 */

const ALLOWED_DETAIL_USERS = ['shuasa', 'yoshira'];
// IMPORTANT: This value MUST match docs/config.js's `sharedSecret` exactly.
// If you paste this file into Apps Script, do NOT overwrite the value you already
// have set here. If you see 'invalid_secret' responses, the two values have drifted.
const SHARED_SECRET = 'REPLACE_WITH_A_RANDOM_STRING';
const SUMMARY_SHEET = 'Summary';
const DETAILS_SHEET = 'Details';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (!data || data.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'invalid_secret' });
    }

    if (data.action === 'fetch') {
      return _handleFetch(data);
    }
    return _handleLog(data);
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _handleLog(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = Session.getScriptTimeZone();
  const iso = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
  const name = String(data.name || '').trim();

  // Always append summary row
  const summary = _getOrCreateSheet(ss, SUMMARY_SHEET, [
    'Timestamp', 'Name', 'QuestionCount', 'CorrectCount', 'ScorePercent', 'DurationSec'
  ]);
  summary.appendRow([
    iso,
    name,
    Number(data.questionCount) || 0,
    Number(data.correctCount) || 0,
    Number(data.scorePercent) || 0,
    Number(data.durationSec) || 0
  ]);

  // Conditionally append per-question detail rows
  const loweredAllowed = ALLOWED_DETAIL_USERS.map(function (s) { return s.toLowerCase(); });
  const detailsAllowed = loweredAllowed.indexOf(name.toLowerCase()) !== -1;

  if (detailsAllowed && Array.isArray(data.details) && data.details.length > 0) {
    const details = _getOrCreateSheet(ss, DETAILS_SHEET, [
      'Timestamp', 'Name', 'Word', 'Pinyin', 'CorrectMeaning', 'SelectedMeaning', 'IsCorrect'
    ]);
    const rows = data.details.map(function (d) {
      return [
        iso,
        name,
        String(d.word || ''),
        String(d.pinyin || ''),
        String(d.correctMeaning || ''),
        String(d.selectedMeaning || ''),
        !!d.isCorrect
      ];
    });
    details.getRange(details.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }

  return _json({ ok: true, detailsLogged: detailsAllowed });
}

function _handleFetch(data) {
  const name = String(data.name || '').trim();
  if (!name) {
    return _json({ ok: false, error: 'missing_name' });
  }

  const loweredAllowed = ALLOWED_DETAIL_USERS.map(function (s) { return s.toLowerCase(); });
  if (loweredAllowed.indexOf(name.toLowerCase()) === -1) {
    return _json({ ok: false, error: 'not_allowed' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DETAILS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) {
    return _json({ ok: true, records: [] });
  }

  const values = sheet.getDataRange().getValues();
  // Expected header order: Timestamp, Name, Word, Pinyin, CorrectMeaning, SelectedMeaning, IsCorrect
  const header = values[0];
  const idx = {
    ts: header.indexOf('Timestamp'),
    name: header.indexOf('Name'),
    word: header.indexOf('Word'),
    ok: header.indexOf('IsCorrect')
  };
  if (idx.name === -1 || idx.word === -1 || idx.ok === -1) {
    return _json({ ok: false, error: 'bad_header' });
  }

  const wantedLower = name.toLowerCase();
  const records = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowName = String(row[idx.name] || '').trim().toLowerCase();
    if (rowName !== wantedLower) continue;
    const word = String(row[idx.word] || '');
    if (!word) continue;
    let ts = row[idx.ts];
    if (ts instanceof Date) ts = Utilities.formatDate(ts, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    records.push({
      word: word,
      isCorrect: row[idx.ok] === true || String(row[idx.ok]).toUpperCase() === 'TRUE',
      timestamp: String(ts || '')
    });
  }

  return _json({ ok: true, records: records });
}

function doGet() {
  return ContentService.createTextOutput('chinese-vocab-quiz backend is alive.');
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
