// home.js
document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadTransfers();
  loadNews();
  loadVideos();
  loadTournaments();
});

// 1. تحميل 3 مباريات رئيسية فقط
async function loadMatches() {
  const container = document.getElementById("home-matches-container");
  const res = await fetch("https://your-api.com/matches/today");
  const data = await res.json();

  const matches = data.slice(0, 3); // أول 3 مباريات
  matches.forEach(match => {
    const card = createMatchCard(match);
    container.appendChild(card);
  });

  const moreBtn = createMoreCard("عرض المزيد", "matches-view");
  container.appendChild(moreBtn);
}

// 2. تحميل 3 انتقالات
async function loadTransfers() {
  const container = document.getElementById("home-transfers-container");
  const res = await fetch("https://your-api.com/transfers");
  const data = await res.json();

  const transfers = data.slice(0, 3);
  transfers.forEach(transfer => {
    const card = createTransferCard(transfer);
    container.appendChild(card);
  });

  const moreBtn = createMoreCard("عرض المزيد", "transfers-view");
  container.appendChild(moreBtn);
}

// 3. تحميل 3 أخبار
async function loadNews() {
  const container = document.getElementById("home-news-container");
  const res = await fetch("https://your-api.com/news");
  const data = await res.json();

  const news = data.slice(0, 3);
  news.forEach(article => {
    const card = createNewsCard(article);
    container.appendChild(card);
  });

  const moreBtn = createMoreCard("عرض المزيد", "news-view");
  container.appendChild(moreBtn);
}

// 4. تحميل 3 فيديوهات
async function loadVideos() {
  const container = document.getElementById("home-videos-container");
  const res = await fetch("https://your-api.com/videos");
  const data = await res.json();

  const videos = data.slice(0, 3);
  videos.forEach(video => {
    const card = createVideoCard(video);
    container.appendChild(card);
  });

  const moreBtn = createMoreCard("عرض المزيد", "videos-view");
  container.appendChild(moreBtn);
}

// 5. تحميل 3 بطولات
async function loadTournaments() {
  const container = document.getElementById("home-tournaments-container");
  const res = await fetch("https://your-api.com/tournaments");
  const data = await res.json();

  const tournaments = data.slice(0, 3);
  tournaments.forEach(tournament => {
    const card = createTournamentCard(tournament);
    container.appendChild(card);
  });

  const moreBtn = createMoreCard("عرض المزيد", "tournaments-view");
  container.appendChild(moreBtn);
}

// ---------- الكروت ---------- //

function createMatchCard(match) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow";
  div.innerHTML = `
    <div class="flex justify-between items-center">
      <span>${match.homeTeam} vs ${match.awayTeam}</span>
      <span class="text-sm text-gray-500">${match.time}</span>
    </div>
  `;
  return div;
}

function createTransferCard(transfer) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow";
  div.innerHTML = `
    <p><strong>${transfer.player}</strong> من ${transfer.from} إلى ${transfer.to}</p>
  `;
  return div;
}

function createNewsCard(article) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow";
  div.innerHTML = `
    <h3 class="font-semibold">${article.title}</h3>
    <p class="text-sm text-gray-500">${article.date}</p>
  `;
  return div;
}

function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow";
  div.innerHTML = `
    <video controls src="${video.url}" class="w-full rounded"></video>
    <p class="mt-2">${video.title}</p>
  `;
  return div;
}

function createTournamentCard(tournament) {
  const div = document.createElement("div");
  div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center";
  div.innerHTML = `
    <h3 class="font-bold">${tournament.name}</h3>
  `;
  return div;
}

function createMoreCard(text, viewId) {
  const a = document.createElement("a");
  a.href = "#";
  a.dataset.view = viewId;
  a.className =
    "bg-gray-700 hover:bg-teal-700 transition text-center p-4 rounded-xl flex items-center justify-center text-teal-300 font-semibold";
  a.textContent = text;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(viewId);
  });
  return a;
}

// التنقل بين الـ views
function switchView(viewId) {
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
}
