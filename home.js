document.addEventListener("DOMContentLoaded", () => {
    // تحميل كل الأقسام
    loadMatches();
    loadTransfers();
    loadNews();
    loadVideos();
    loadTournaments();

    // ربط أزرار عرض المزيد
    document.querySelectorAll("[data-view]").forEach(btn => {
        btn.addEventListener("click", () => {
            switchView(btn.dataset.view);
        });
    });
});

function switchView(viewId) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });
    document.getElementById(viewId).classList.add("active");
    window.scrollTo(0, 0);
}

// ---------------- مباريات ----------------
async function loadMatches() {
    try {
        const res = await fetch("https://ko.best-goal.live/matches.php");
        const data = await res.json();
        const matches = Array.isArray(data) ? data.slice(0, 3) : [];

        const container = document.getElementById("home-matches-list");
        container.innerHTML = "";

        matches.forEach(match => {
            container.innerHTML += createMatchCard(match);
        });

        container.innerHTML += `<div class="card show-more-card" data-view="matches-view">عرض المزيد</div>`;
    } catch (err) {
        console.error("Error loading matches:", err);
    }
}

function createMatchCard(match) {
    return `
    <div class="card match-card">
        <div>${match.team1} vs ${match.team2}</div>
        <div>${match.time || "الساعة غير متوفرة"}</div>
    </div>`;
}

// ---------------- انتقالات ----------------
async function loadTransfers() {
    try {
        const res = await fetch("https://ko.best-goal.live/transation.php");
        const data = await res.json();
        const transfers = Array.isArray(data) ? data.slice(0, 3) : [];

        const container = document.getElementById("home-transfers-list");
        container.innerHTML = "";

        transfers.forEach(item => {
            container.innerHTML += createTransferCard(item);
        });

        container.innerHTML += `<div class="card show-more-card" data-view="transfers-view">عرض المزيد</div>`;
    } catch (err) {
        console.error("Error loading transfers:", err);
    }
}

function createTransferCard(item) {
    return `
    <div class="card transfer-card">
        <div>${item.player_name || "لاعب غير معروف"} ➜ ${item.to_team}</div>
        <div>${item.transfer_fee || "مجانًا"}</div>
    </div>`;
}

// ---------------- أخبار ----------------
async function loadNews() {
    try {
        const res = await fetch("https://ko.best-goal.live/news.php");
        const data = await res.json();
        const news = Array.isArray(data) ? data.slice(0, 3) : [];

        const container = document.getElementById("home-news-list");
        container.innerHTML = "";

        news.forEach(item => {
            container.innerHTML += createNewsCard(item);
        });

        container.innerHTML += `<div class="card show-more-card" data-view="news-view">عرض المزيد</div>`;
    } catch (err) {
        console.error("Error loading news:", err);
    }
}

function createNewsCard(item) {
    return `
    <div class="card news-card">
        <img src="${item.image || 'default.jpg'}" alt="${item.title}">
        <div class="news-info">
            <h4>${item.title}</h4>
            <p>${item.description || ''}</p>
        </div>
    </div>`;
}

// ---------------- فيديوهات ----------------
async function loadVideos() {
    try {
        const res = await fetch("https://ko.best-goal.live/videos.php");
        const data = await res.json();
        const videos = Array.isArray(data) ? data.slice(0, 3) : [];

        const container = document.getElementById("home-videos-list");
        container.innerHTML = "";

        videos.forEach(item => {
            container.innerHTML += createVideoCard(item);
        });

        container.innerHTML += `<div class="card show-more-card" data-view="videos-view">عرض المزيد</div>`;
    } catch (err) {
        console.error("Error loading videos:", err);
    }
}

function createVideoCard(item) {
    return `
    <div class="card video-card">
        <iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>
        <div class="video-info">${item.title}</div>
    </div>`;
}

// ---------------- بطولات ----------------
async function loadTournaments() {
    try {
        const res = await fetch("https://ko.best-goal.live/tournaments.php");
        const data = await res.json();
        const tournaments = Array.isArray(data) ? data.slice(0, 3) : [];

        const container = document.getElementById("home-tournaments-list");
        container.innerHTML = "";

        tournaments.forEach(item => {
            container.innerHTML += createTournamentCard(item);
        });

        container.innerHTML += `<div class="card show-more-card" data-view="tournaments-view">عرض المزيد</div>`;
    } catch (err) {
        console.error("Error loading tournaments:", err);
    }
}

function createTournamentCard(item) {
    return `
    <div class="card tournament-card">
        <img src="${item.logo || 'default.png'}" alt="${item.name}">
        <div>${item.name}</div>
    </div>`;
}
