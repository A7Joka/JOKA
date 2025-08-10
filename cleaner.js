// cleaner.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getFirestore, collection, doc, getDocs, deleteDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// === عدل هنا بالـ firebaseConfig الخاص بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyB6ACvhgth3VXhoJJnNOZfIQBpXlTVWcGE",
  authDomain: "website-f388d.firebaseapp.com",
  projectId: "website-f388d",
  storageBucket: "website-f388d.appspot.com",
  messagingSenderId: "531820596793",
  appId: "1:531820596793:web:37dbfd0b9a3c7a3a0cc7e8",
  measurementId: "G-75KT28HL7H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== إعدادات التشغيل =====
const EXTERNAL_API_BASE = 'https://ko.best-goal.live/state.php?match_id='; // أو استبدل ببروكسي لو في CORS
const CONCURRENCY = 5;           // كم طلب API خارجي يشتغلوا مع بعض
const BATCH_SIZE = 400;          // بحد أقصى 500، خليه 400 للسلامة
const API_TIMEOUT_MS = 8000;     // مهلة طلب الـ API الخارجي

// ===== واجهة المستخدم =====
const btn = document.getElementById('startBtn');
const logEl = document.getElementById('log');
const statusEl = document.getElementById('status');
const dryRunCheckbox = document.getElementById('dryRun');

function log(msg){
  const t = new Date().toLocaleString();
  logEl.textContent = `[${t}] ${msg}\n` + logEl.textContent;
}
function setStatus(s){ statusEl.textContent = s; }

// ===== مساعدة fetch مع timeout =====
async function fetchWithTimeout(url, opts={}, timeout = API_TIMEOUT_MS){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(), timeout);
  try{
    const res = await fetch(url, {...opts, signal: controller.signal});
    clearTimeout(id);
    return res;
  } finally { clearTimeout(id); }
}

// ===== دالة فحص حالة مباراة عبر الـ API الخارجي =====
async function isMatchFinished(matchId){
  try{
    const url = EXTERNAL_API_BASE + encodeURIComponent(matchId);
    const res = await fetchWithTimeout(url);
    if(!res.ok) throw new Error(`API status ${res.status}`);
    const txt = await res.text();
    // API غير موحّد؟ افترض البحث عن "Match-Status" أو كلمات عربية:
    if(/انتهت المباراة|انتهت المباراة - ركلات الترجيح|Match-Status:\s*finished/i.test(txt)){
      return true;
    }
    return false;
  }catch(err){
    console.warn('API error for', matchId, err);
    // لاحقًا: retry policy ممكن نضيفها
    return false;
  }
}

// ===== حذف جميع doks في subcollection streams لمباراة محددة باستخدام batches =====
async function deleteStreamsForMatch(matchDocId, dryRun = true){
  const streamsColRef = collection(db, 'matches', matchDocId, 'streams');
  const snap = await getDocs(streamsColRef);
  if(snap.empty) {
    log(`> ${matchDocId} : لا يوجد streams`);
    return {deleted:0};
  }
  let deleted = 0;
  let batch = writeBatch(db);
  let ops = 0;

  for(const sdoc of snap.docs){
    const ref = sdoc.ref;
    if(!dryRun) batch.delete(ref);
    ops++;
    deleted++;
    if(ops >= BATCH_SIZE){
      if(!dryRun) await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }
  if(ops > 0 && !dryRun){
    await batch.commit();
  }
  log(`> ${matchDocId} : ${deleted} stream(s) ${dryRun ? '(dry-run - لم تُحذف)' : 'تم حذفها'}`);
  return {deleted};
}

// ===== ترتيب التنفيذ مع concurrency =====
async function processAllMatches(dryRun=true){
  setStatus('جلب مباريات من Firestore...');
  log('بدء جلب جميع مباريات collection matches...');
  const matchesRef = collection(db, 'matches');
  const matchesSnap = await getDocs(matchesRef);
  if(matchesSnap.empty){
    setStatus('لا توجد مباريات في قاعدة البيانات.');
    log('لا توجد مباريات في collection matches.');
    return;
  }

  const matchIds = matchesSnap.docs.map(d => d.id);
  setStatus(`فحص ${matchIds.length} مباراة...`);
  log(`مباريات مُسترجعة: ${matchIds.length}`);

  // نستخدم مجموعة من العاملين المحدودين concurrency
  let idx = 0;
  let totalDeleted = 0;
  const workers = Array.from({length: CONCURRENCY}, async () => {
    while(true){
      const i = idx++;
      if(i >= matchIds.length) break;
      const matchId = matchIds[i];
      setStatus(`فحص ${i+1}/${matchIds.length} → ${matchId}`);
      log(`فحص المباراة ${matchId} ...`);

      const finished = await isMatchFinished(matchId);
      if(finished){
        log(`✓ ${matchId} : انتهت — جاري حذف الـ streams...`);
        const res = await deleteStreamsForMatch(matchId, dryRun);
        totalDeleted += res.deleted;
      } else {
        log(`✗ ${matchId} : لم تنتهي — تخطى`);
      }
      // خيار: تأخير صغير لمنع حظر الـ API الخارجي
      await new Promise(r => setTimeout(r, 200));
    }
  });

  await Promise.all(workers);
  setStatus(`انتهى. مجموع السيرفرات المحذوفة: ${totalDeleted} ${dryRun ? '(dry-run)' : ''}`);
  log(`انتهى التشغيل — إجمالي سيرفرات ${dryRun ? 'المقترحة للحذف' : 'المحذوفة'}: ${totalDeleted}`);
}

// ===== زر التشغيل =====
btn.addEventListener('click', async () => {
  const dryRun = dryRunCheckbox.checked;
  btn.disabled = true;
  try{
    log(`تشغيل الأداة (dryRun=${dryRun})`);
    await processAllMatches(dryRun);
  }catch(err){
    log('خطأ عام: ' + (err.message || err));
    console.error(err);
    setStatus('حدث خطأ — تحقق من الكونسول أو السجل');
  } finally {
    btn.disabled = false;
  }
});
