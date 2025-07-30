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
        const matches = json["STING-WEB-Matches"].slice(0, 3);

        matches.forEach(match => {
            const card = createMatchCard(match);
            container.appendChild(card);
        });

        container.appendChild(createMoreCard("عرض المزيد", "matches-view"));
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
        const transfers = json.data.slice(0, 3);

        transfers.forEach(transfer => {
            const card = createTransferCard(transfer);
            container.appendChild(card);
        });

        container.appendChild(createMoreCard("عرض المزيد", "transfers-view"));
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
        const news = data.slice(0, 3);

        news.forEach(article => {
            const card = createNewsCard(article);
            container.appendChild(card);
        });

        container.appendChild(createMoreCard("عرض المزيد", "news-view"));
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
        const videos = data.slice(0, 3);

        videos.forEach(video => {
            const card = createVideoCard(video);
            container.appendChild(card);
        });

        container.appendChild(createMoreCard("عرض المزيد", "videos-view"));
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
        const tournaments = json.data.slice(0, 3);

        tournaments.forEach(tournament => {
            const card = createTournamentCard(tournament);
            container.appendChild(card);
        });

        container.appendChild(createMoreCard("عرض المزيد", "tournaments-view"));
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">فشل تحميل البطولات</p>`;
        console.error("Tournaments Error:", err);
    }
}

// ---------- الكروت ----------

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

function createNewsCard(article) {
    const div = document.createElement("div");
    div.className = "bg-white dark:bg-gray-800 p-4 rounded-lg shadow";
    div.innerHTML = `
  <div class="news-card" data-news-index="${index}"><img src="${article.image}" alt="${article.title}" class="news-image"><div class="news-content"><h2 class="news-title">${article.title}</h2><p class="news-summary">${article.sub_link}</p><p class="news-time">${article.time}</p></div></div>
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

function createTournamentCard(t) {
    const div = document.createElement("div");
    div.className = "text-center mt-4 p-4 rounded-lg shadow text-center";
    div.innerHTML = `
    <h3 class="btn btn-outline-info font-bold">${t.name}</h3>
  `;
    return div;
}

function createMoreCard(text, viewId) {
    const a = document.createElement("a");
    a.href = "#";
    a.dataset.view = viewId;
    a.className = "bg-gray-700 hover:bg-teal-700 transition text-center p-4 rounded-xl flex items-center justify-center text-teal-300 font-semibold";
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
