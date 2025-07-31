document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadTransfers();
  loadNews();
  loadVideos();
  loadTournaments();
});

// 1. تحميل المباريات
async function loadMatches() {
  const container = document.getElementById("home-matches-container");
  try {
    const res = await fetch("https://yanb8.bassamnetflix2.workers.dev/https://www.yanb8.com/api/matches/?date=today&time=3:00");
    const json = await res.json();
    const matches = json["STING-WEB-Matches"].slice(0, 5);

    matches.forEach(match => {
      const card = createMatchCard(match);
      container.appendChild(card);
    });
const section = container.parentElement; // جايب السكشن الأب
    const moreWrapper = document.createElement("div");
    moreWrapper.className = "w-full flex justify-center mt-4";
    moreWrapper.appendChild(createMoreCard("عرض المزيد", "matches-view")); 
    section.appendChild(moreWrapper);

  } catch (err) {
    container.innerHTML = `<p class="text-red-500">فشل تحميل المباريات</p>`;
    console.error("Matches Error:", err);
  }
}

// 2. تحميل الانتقالات
async function loadTransfers() {
  const container = document.getElementById("home-transfers-container");
  try {
    const res = await fetch("https://ko.best-goal.live/transation.php");
    const json = await res.json();
    const transfers = json.data.slice(0, 8);

    transfers.forEach(transfer => {
      const card = createTransferCard(transfer);
      container.appendChild(card);
    });
const section = container.parentElement; // جايب السكشن الأب
    const moreWrapper = document.createElement("div");
    moreWrapper.className = "w-full flex justify-center mt-4";
     moreWrapper.appendChild(createMoreCard("عرض المزيد", "transfers-view"));
    section.appendChild(moreWrapper);
   
  } catch (err) {
    container.innerHTML = `<p class="text-red-500">فشل تحميل الانتقالات</p>`;
    console.error("Transfers Error:", err);
  }
}

// 3. تحميل الأخبار
async function loadNews() {
  const container = document.getElementById("home-news-container");
  try {
    const res = await fetch("https://ko.best-goal.live/news.php");
    const data = await res.json();
    const news = data.slice(0, 8);

    news.forEach(article => {
      const card = createNewsCard(article);
      container.appendChild(card);
    });
const section = container.parentElement; // جايب السكشن الأب
    const moreWrapper = document.createElement("div");
    moreWrapper.className = "w-full flex justify-center mt-4";
    moreWrapper.appendChild(createMoreCard("عرض المزيد", "news-view"));
    section.appendChild(moreWrapper);
  } catch (err) {
    container.innerHTML = `<p class="text-red-500">فشل تحميل الأخبار</p>`;
    console.error("News Error:", err);
  }
}

// 4. تحميل الفيديوهات
async function loadVideos() {
  const container = document.getElementById("home-videos-container");
  try {
    const res = await fetch("https://ko.best-goal.live/videos.php");
    const data = await res.json();
    const videos = data.slice(0, 8);

    videos.forEach(video => {
      const card = createVideoCard(video);
      container.appendChild(card);
    });
const section = container.parentElement; // جايب السكشن الأب
    const moreWrapper = document.createElement("div");
    moreWrapper.className = "w-full flex justify-center mt-4";
    moreWrapper.appendChild(createMoreCard("عرض المزيد", "videos-view"));
    section.appendChild(moreWrapper);

  } catch (err) {
    container.innerHTML = `<p class="text-red-500">فشل تحميل الفيديوهات</p>`;
    console.error("Videos Error:", err);
  }
}

// 5. تحميل البطولات
async function loadTournaments() {
  const container = document.getElementById("home-tournaments-container");
  try {
    const res = await fetch("https://ko.best-goal.live/get.php");
    const json = await res.json();
    const tournaments = json.data.slice(0, 8);

    tournaments.forEach(tournament => {
      const card = createTournamentCard(tournament);
      container.appendChild(card);
    });
const section = container.parentElement; // جايب السكشن الأب
    const moreWrapper = document.createElement("div");
    moreWrapper.className = "w-full flex justify-center mt-4";
    moreWrapper.appendChild(createMoreCard("عرض المزيد", "tournaments-view")); 
    section.appendChild(moreWrapper);

  } catch (err) {
    container.innerHTML = `<p class="text-red-500">فشل تحميل البطولات</p>`;
    console.error("Tournaments Error:", err);
  }
}

// ---------- الكروت ----------

function createMatchCard(match) {
  const API_DOMAIN = "https://www.yanb8.com";

  const isNotStarted = match['Match-Status'] === 'لم تبدأ' || match['Match-Status'] === 'مؤجلة';
  const statusClass = match['Match-Status'] === 'انتهت' ? 'status-finished'
    : match['Match-Status'] === 'مؤجلة' ? 'status-postponed'
    : match['Match-Status'] === 'لم تبدأ' ? 'status-not-started'
    : 'status-live';

  const matchTimeOrResult = isNotStarted
    ? `<div class="match-time">${new Date(match['Time-Start']).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>`
    : `<div class="match-result">${match['Team-Left']['Goal']} - ${match['Team-Right']['Goal']}</div>`;

  const div = document.createElement("div");
  div.className = "match-card";
  div.innerHTML = `
    <div class="match-body" data-match-id="${match['Match-id']}">
      <div class="team-logo-container"><img src="${API_DOMAIN}${match['Team-Left']['Logo']}" class="team-logo" alt="${match['Team-Left']['Name']}"></div>
      <div class="team-name">${match['Team-Left']['Name']}</div>

      <div class="match-details-preview">
        ${matchTimeOrResult}
        <span class="match-status ${statusClass}">${match['Match-Status']}</span>
      </div>

      <div class="team-name">${match['Team-Right']['Name']}</div>
      <div class="team-logo-container"><img src="${API_DOMAIN}${match['Team-Right']['Logo']}" class="team-logo" alt="${match['Team-Right']['Name']}"></div>
    </div>
  `;
  return div;
}


function createTransferCard(t) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center";
  div.innerHTML = `
    <img src="${t.player_image}" class="mx-auto w-16 h-16 rounded-full mb-2" />
    <p class="font-semibold">${t.player_name}</p>
    <p class="text-xs text-gray-400">${t.player_position}</p>
    <div class="flex justify-center items-center gap-2 mt-2">
      <img src="${t.from_club_logo}" class="w-8 h-8" />
      <span class="text-sm">→</span>
      <img src="${t.to_club_logo}" class="w-8 h-8" />
    </div>
  `;
  return div;
}
function createNewsCard(item, index = 0) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="news-card" data-news-index="${index}">
      <img src="${item.image}" alt="${item.title}" class="news-image">
      <div class="news-content">
        <h2 class="news-title">${item.title}</h2>
        <p class="news-summary">${item.sub_link}</p>
        <p class="news-time">${item.time}</p>
      </div>
    </div>
  `;
  return div;
}

function createVideoCard(item) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="video-card" data-m3u8-url="${item.m3u8_url}">
      <div class="video-thumbnail-wrapper">
        <img src="${item.imageurl}" alt="${item.title}" class="video-thumbnail">
        <div class="play-icon"></div>
      </div>
      <div class="video-content">
        <h2 class="video-title">${item.title}</h2>
        <p class="video-category">${item.category}</p>
      </div>
    </div>
  `;
  return div;
}


function createTournamentCard(tour, index = 0) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="tournament-card" data-index="${index}">
      <img src="${tour.image}" alt="${tour.title}" class="tournament-card-image">
      <h3 class="tournament-card-title">${tour.title}</h3>
    </div>
  `;
  return div;
}

function createMoreCard(text, viewId) {
  const a = document.createElement("a");
  a.href = "#";
  a.dataset.view = viewId;
  a.className = "btn btn-outline-info font-semibold text-center";
  a.textContent = text;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(viewId);
  });
  return a;
}


// ---------- التنقل بين الـ views ----------

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
}
