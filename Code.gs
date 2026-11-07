/** Google Apps Script: прив'язати до нової Google Таблиці. */
const SHEET_NAME = 'Результати';
// ВКАЖІТЬ ПІДТВЕРДЖЕНУ АДРЕСУ GMAIL (з @), потім розгорніть вебзастосунок.
const TEACHER_EMAIL = 'natkaj81@gmail.com';
const HEADERS = ['Дата', 'Час', 'Прізвище та ім’я', 'Клас', 'Варіант', 'Вправа 1 / 12', 'Вправа 2 / 12', 'Вправа 3 / 12', 'Підсумкова оцінка', 'Спроб: вправа 1', 'Спроб: вправа 2', 'Спроб: вправа 3', 'Отримано сервером'];
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse(e.postData.contents || '{}');
    const name = String(d.name || '').trim().slice(0,100);
    const klass = String(d.className || '').trim().slice(0,30);
    const variant = Number(d.variant);
    const scores = [d.score1,d.score2,d.score3].map(Number);
    const tries = [d.attempt1,d.attempt2,d.attempt3].map(Number);
    if (!name || !klass || !Number.isInteger(variant) || variant < 1 || variant > 5 ||
        scores.some(v => !Number.isInteger(v) || v < 0 || v > 12) ||
        tries.some(v => !Number.isInteger(v) || v < 0 || v > 100000)) throw new Error('Некоректні дані');
    const now = new Date();
    const tz = Session.getScriptTimeZone();
    const date = Utilities.formatDate(now,tz,'dd.MM.yyyy');
    const time = Utilities.formatDate(now,tz,'HH:mm:ss');
    const average = Math.round(scores.reduce((a,b)=>a+b,0)/3);
    // Не дозволяємо формули в комірках, введені учнями.
    const safe = v => /^[=+\-@]/.test(v) ? "'" + v : v;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    sh.appendRow([date,time,safe(name),safe(klass),variant,...scores,average,...tries,now]);
    if (TEACHER_EMAIL.includes('@') && !TEACHER_EMAIL.startsWith('ВСТАВТЕ')) {
      MailApp.sendEmail({to:TEACHER_EMAIL,subject:'Python з нуля — результат: '+name,
        body:'Учень: '+name+'\nКлас: '+klass+'\nВаріант: '+variant+'\nДата: '+date+'\nЧас: '+time+'\nВправа 1: '+scores[0]+'/12 (спроб: '+tries[0]+')\nВправа 2: '+scores[1]+'/12 (спроб: '+tries[1]+')\nВправа 3: '+scores[2]+'/12 (спроб: '+tries[2]+')\nПідсумкова оцінка: '+average+'/12'});
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}
