// FINAL STABLE VERSION - PART 1 of 4
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDocs, addDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIG & GLOBAL VARS ---
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
const ADMIN_PASSWORD = "Vbnb123@";
const API_DOMAIN = 'https://yanb8.bassamnetflix2.workers.dev/https://www.yanb8.com';
let allMatchesData = [];
let currentDate = new Date();
let allTournamentsData = [];
let longPressTimer;
let currentMatchDetailsCache = null;

// --- DOM ELEMENT SELECTORS ---
const mainNav = document.getElementById('main-nav');
const views = document.querySelectorAll('.view');
const matchesContainer = document.getElementById('matches-container');
const matchesLoadingSpinner = document.getElementById('matches-loading-spinner');
const datePicker = document.getElementById('datePicker');
const todayBtn = document.getElementById('todayBtn');
const yesterdayBtn = document.getElementById('yesterdayBtn');
const tomorrowBtn = document.getElementById('tomorrowBtn');
const matchDetailsModal = document.getElementById('matchDetailsModal');
const detailsTabsContainer = document.getElementById('details-tabs-container');
const modalMatchCard = document.getElementById('modalMatchCard');
const tabContentContainer = document.getElementById('tab-content-container');
const detailsTabsDrawerBtn = document.getElementById('details-tabs-drawer-btn');
const activeTabTitle = document.getElementById('active-tab-title');
const detailsTabsMenu = document.getElementById('details-tabs-menu');
const newsContainer = document.getElementById('news-container');
const newsLoadingSpinner = document.getElementById('news-loading-spinner');
const videosContainer = document.getElementById('videos-container');
const videosLoadingSpinner = document.getElementById('videos-loading-spinner');
const videoPlayerModal = document.getElementById('videoPlayerModal');
const videoPlayerIframe = document.getElementById('videoPlayerIframe');
const tournamentsLoadingSpinner = document.getElementById('tournaments-loading-spinner');
const tournamentsGridContainer = document.getElementById('tournaments-grid-container');
const standingsDisplayContainer = document.getElementById('standings-display-container');
const tournamentsGrid = document.getElementById('tournaments-grid');
const transfersContainer = document.getElementById('transfers-container');
const transfersLoadingSpinner = document.getElementById('transfers-loading-spinner');
const drawerToggle = document.getElementById('drawer-toggle');
const adminModal = document.getElementById('adminModal');
const adminPasswordSection = document.getElementById('admin-password-section');
const adminContentSection = document.getElementById('admin-content-section');
const addStreamForm = document.getElementById('add-stream-form');
const streamTypeSelect = document.getElementById('stream-type');
const drmFields = document.getElementById('drm-fields');
const currentStreamsList = document.getElementById('current-streams-list');
const formTitle = document.getElementById('form-title');
const saveStreamBtn = document.getElementById('save-stream-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
// --- RENDER & DISPLAY FUNCTIONS (These build the HTML) ---
function displayMatches(matches) {
    if (!matches || matches.length === 0) {
        matchesContainer.innerHTML = `<p style="text-align:center;">لا توجد مباريات في هذا اليوم.</p>`;
        return;
    }
    const matchesByCup = matches.reduce((acc, match) => {
        (acc[match['Cup-id']] = acc[match['Cup-id']] || {
            cupInfo: match,
            matches: []
        }).matches.push(match);
        return acc;
    }, {});
    matchesContainer.innerHTML = Object.values(matchesByCup).map(cupData => `
        <div class="match-card">
            <div class="cup-header"><img src="${API_DOMAIN}${cupData.cupInfo['Cup-Logo']}" alt="" class="cup-logo"><h2 class="cup-name">${cupData.cupInfo['Cup-Name']}</h2></div>
            ${cupData.matches.map(match => {
                const detailsContent = (match['Match-Status'] === 'لم تبدأ' || match['Match-Status'] === 'مؤجلة') ?
                    `<div class="match-time">${new Date(match['Time-Start']).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</div>` :
                    `<div class="match-result">${match['Team-Left']['Goal']} - ${match['Team-Right']['Goal']}</div>`;
                let statusClass = 'status-not-started';
                if (match['Match-Status'] === 'انتهت') statusClass = 'status-finished';
                else if (match['Match-Status'] === 'مؤجلة') statusClass = 'status-postponed';
                else if (match['Match-Status'] !== 'لم تبدأ') statusClass = 'status-live';
                return `<div class="match-body" data-match-id="${match['Match-id']}"><div class="team"><img src="${API_DOMAIN}${match['Team-Left']['Logo']}" alt="${match['Team-Left']['Name']}" class="team-logo"><h3 class="team-name">${match['Team-Left']['Name']}</h3></div><div class="match-details-preview">${detailsContent}<span class="match-status ${statusClass}">${match['Match-Status']}</span></div><div class="team"><img src="${API_DOMAIN}${match['Team-Right']['Logo']}" alt="${match['Team-Right']['Name']}" class="team-logo"><h3 class="team-name">${match['Team-Right']['Name']}</h3></div></div>`;
            }).join('')}
        </div>`).join('');
}

function displayNews(newsItems) {
    newsContainer.innerHTML = newsItems.map(item => `<div class="news-card"><img src="${item.image}" alt="${item.title}" class="news-image"><div class="news-content"><h2 class="news-title">${item.title}</h2><p class="news-summary">${item.sub_link}</p><p class="news-time">${item.time}</p></div></div>`).join('');
}

function displayVideos(videoItems) {
    videosContainer.innerHTML = videoItems.map(item => `<div class="video-card" data-m3u8-url="${item.m3u8_url}"><div class="video-thumbnail-wrapper"><img src="${item.imageurl}" alt="${item.title}" class="video-thumbnail"><div class="play-icon"></div></div><div class="video-content"><h2 class="video-title">${item.title}</h2><p class="video-category">${item.category}</p></div></div>`).join('');
}

function displayTournamentsGrid(tournaments) {
    tournamentsGrid.innerHTML = tournaments.map((tour, index) => `<div class="tournament-card" data-index="${index}"><img src="${tour.image}" alt="${tour.title}" class="tournament-card-image"><h3 class="tournament-card-title">${tour.title}</h3></div>`).join('');
}

function displayStandings(tournament) {
    window.scrollTo(0, 0);
    tournamentsGridContainer.style.display = 'none';
    standingsDisplayContainer.style.display = 'block';
    let tablesHTML = '';
    if (!tournament.standings || tournament.standings.length === 0) {
        tablesHTML = "<p style='text-align:center; margin-top: 20px;'>لا يوجد ترتيب لهذه البطولة حاليًا.</p>";
    } else {
        tournament.standings.forEach(group => {
            tablesHTML += `<h3 class="group-title">${group.group_name}</h3><div style="overflow-x:auto;"><table class="standings-table"><thead><tr><th>#</th><th style="text-align:right;">الفريق</th><th>لعب</th><th>ف</th><th>ت</th><th>خ</th><th>له/عليه</th><th>ف.أ</th><th>نقاط</th></tr></thead><tbody>${group.teams.map((team, index) => `<tr><td>${index + 1}</td><td class="team-cell"><img src="${team.logo}" alt="" class="team-logo"><span class="team-name">${team.name.split(/\\n|\\r\n|\r/)[0].trim()}</span></td><td>${team.played}</td><td>${team.win}</td><td>${team.draw}</td><td>${team.lose}</td><td>${team.goals}</td><td>${team.diff}</td><td><strong>${team.points}</strong></td></tr>`).join('')}</tbody></table></div>`;
        });
    }
    standingsDisplayContainer.innerHTML = `<div class="standings-header"><div class="standings-title-info"><img src="${tournament.image}" alt="${tournament.title}" class="standings-logo"><h1 class="standings-title">${tournament.title}</h1></div><button class="back-to-grid-btn">العودة للبطولات</button></div><div id="standings-tables-container">${tablesHTML}</div>`;
    standingsDisplayContainer.querySelector('.back-to-grid-btn').addEventListener('click', () => {
        standingsDisplayContainer.style.display = 'none';
        tournamentsGridContainer.style.display = 'block';
        window.scrollTo(0, 0);
    });
}

function displayTransfers(transfers) {
    if (!transfers || transfers.length === 0) {
        transfersContainer.innerHTML = `<p style="text-align:center;">لا توجد انتقالات حالياً.</p>`;
        return;
    }
    transfersContainer.innerHTML = transfers.map(item => {
        const priceOrType = item.transfer_price ? item.transfer_price : item.transfer_type;
        const badgeClass = item.transfer_type === 'انتقال حر' ? 'free' : '';
        return `
        <div class="transfer-card">
            <div class="transfer-player-section">
                <img src="${item.player_image}" alt="${item.player_name}" class="transfer-player-image">
                <div class="transfer-player-details">
                    <div class="transfer-player-name">${item.player_name}</div>
                    <div class="transfer-player-position">${item.player_position}</div>
                </div>
                <div class="transfer-badge ${badgeClass}">${priceOrType}</div>
            </div>
            <div class="transfer-clubs-section">
                <div class="transfer-club">
                    <img src="${item.from_club_logo}" alt="" class="transfer-club-logo">
                </div>
                <span class="transfer-arrow">&rarr;</span>
                <div class="transfer-club">
                    <img src="${item.to_club_logo}" alt="" class="transfer-club-logo">
                </div>
            </div>
            <div class="transfer-footer">
                عقد حتى: ${item.contract_until}
            </div>
        </div>
    `;
    }).join('');
}

function renderInfo(info, match) {
    const panel = document.getElementById('tab-info');
    if (!info || !match) { panel.innerHTML = "<p style='text-align:center;'>التفاصيل غير متاحة.</p>"; return; }
    const matchTime = new Date(match['Time-Start']);
    const formattedDateTime = matchTime.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
    panel.innerHTML = `<div class="info-container"><div class="info-item"><span class="info-label">البطولة:</span><span class="info-value">${match['Cup-Name']}</span></div><div class="info-item"><span class="info-label">التاريخ:</span><span class="info-value" style="direction: ltr; text-align: right;">${formattedDateTime}</span></div><div class="info-item"><span class="info-label">الحالة:</span><span class="info-value">${match['Match-Status']}</span></div><div class="info-item"><span class="info-label">الحكم:</span><span class="info-value">${info['Match-Referee'] || 'غير محدد'}</span></div><div class="info-item"><span class="info-label">الملعب:</span><span class="info-value">${info['Club-Name'] || 'غير محدد'}</span></div><div class="info-item"><span class="info-label">القناة:</span><span class="info-value">${info['Tv'] || 'غير متاح'}</span></div></div>`;
}

function renderLineup(lineup, match) {
    const panel = document.getElementById('tab-lineup');
    if (!lineup) { panel.innerHTML = "<p style='text-align:center;'>التشكيلة غير متاحة.</p>"; return; }
    const renderTeam = (teamData, teamInfo) => {
        const starters = teamData.Team.filter(p => p.Status === 'Starting');
        const substitutes = teamData.Team.filter(p => p.Status === 'Substitute');
        return `<div class="lineup-team"><div class="lineup-header"><img src="${API_DOMAIN}${teamInfo.Logo}" class="team-logo" alt=""><div><div class="lineup-team-name">${teamData['Team-Name']}</div><div class="lineup-formation">${teamData.Formation}</div></div></div><div class="lineup-section-title">التشكيلة الأساسية</div><ul class="player-list">${starters.map(p => `<li class="player-item"><img src="${API_DOMAIN}${p['Player-Logo']}" class="player-logo" alt=""><span class="player-name">${p['Player-Name']}</span></li>`).join('')}</ul><div class="lineup-section-title">الاحتياط</div><ul class="player-list">${substitutes.map(p => `<li class="player-item"><img src="${API_DOMAIN}${p['Player-Logo']}" class="player-logo" alt=""><span class="player-name">${p['Player-Name']}</span></li>`).join('')}</ul></div>`;
    };
    const currentMatch = allMatchesData.find(m => m['Match-id'] == matchDetailsModal.dataset.matchId);
    if (currentMatch) { panel.innerHTML = `<div class="lineup-container">${renderTeam(lineup['Away-Team'], currentMatch['Team-Left'])}${renderTeam(lineup['Home-Team'], currentMatch['Team-Right'])}</div>`; }
}

function renderEvents(events) {
    const panel = document.getElementById('tab-events');
    if (!events || events.length === 0) { panel.innerHTML = "<p style='text-align:center;'>لا توجد أحداث مسجلة.</p>"; return; }
    panel.innerHTML = `<div class="events-container"><div class="timeline-line"></div>${events.map(event => {
        let extraPlayerHTML = '';
        if (event['Event-Player'].Extra.length > 0) {
            const prefix = event['Event-Name'] === 'هدف' ? 'صناعة: ' : '';
            extraPlayerHTML = `<div class="event-assist">${prefix}${event['Event-Player'].Extra[0].Name}</div>`;
        }
        return `<div class="event-item ${event.Place}"><div class="event-details"><img src="${event['Event-Logo']}" class="event-icon" alt=""><div><div class="player-name">${event['Event-Player'].Name}</div>${extraPlayerHTML}</div></div><div class="event-time">${event['Event-Time']}</div></div>`.replace(/^<div class="event-item right">/, '<div class="event-item right"><div style="width:45%"></div>').replace(/<\/div>$/, `${event.Place === 'left' ? '<div style="width:45%"></div>' : ''}</div>`);
    }).join('')}</div>`;
}

function renderStats(statsRight, statsLeft) {
    const panel = document.getElementById('tab-stats');
    if (!statsRight || !statsLeft) { panel.innerHTML = "<p style='text-align:center;'>لا توجد إحصائيات متاحة.</p>"; return; }
    const combinedStats = statsRight.map((statRight, index) => ({ name: statRight.Name, valueRight: statRight.Value, valueLeft: (statsLeft[index] || { Value: '0' }).Value }));
    const maxValues = {};
    combinedStats.forEach(stat => {
        const pRight = parseFloat(stat.valueRight) || 0;
        const pLeft = parseFloat(stat.valueLeft) || 0;
        maxValues[stat.name] = Math.max(pRight, pLeft, 1);
    });
    panel.innerHTML = `<div class="stats-container">${combinedStats.map(stat => {
        const pRight = parseFloat(stat.valueRight) || 0;
        const pLeft = parseFloat(stat.valueLeft) || 0;
        const maxWidth = maxValues[stat.name];
        const widthRight = (pRight / maxWidth) * 100;
        const widthLeft = (pLeft / maxWidth) * 100;
        return `<div class="stat-row"><div class="stat-team-display team-right"><span class="stat-value">${stat.valueRight}</span><div class="stat-bar-wrapper"><div class="stat-bar team-right-bar" style="width: ${widthRight}%;"></div></div></div><span class="stat-name">${stat.name}</span><div class="stat-team-display"><div class="stat-bar-wrapper"><div class="stat-bar team-left-bar" style="width: ${widthLeft}%;"></div></div><span class="stat-value">${stat.valueLeft}</span></div></div>`;
    }).join('')}</div>`;
}
// --- FETCH FUNCTIONS (These get data from APIs) ---
async function fetchMatches(dateString) {
    matchesLoadingSpinner.style.display = 'flex';
    matchesContainer.innerHTML = '';
    datePicker.value = dateString;
    const apiUrl = `${API_DOMAIN}/api/matches/?date=${dateString}&time=3:00`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        allMatchesData = data?.['STING-WEB-Matches'] || [];
        displayMatches(allMatchesData);
    } catch (error) {
        console.error("Fetch Matches Error:", error);
        matchesContainer.innerHTML = `<p style="text-align:center; color:red;">حدث خطأ في تحميل المباريات.</p>`;
    } finally {
        matchesLoadingSpinner.style.display = 'none';
    }
}
async function fetchNews() {
    newsLoadingSpinner.style.display = 'flex';
    newsContainer.innerHTML = '';
    try {
        const response = await fetch('https://ko.best-goal.live/news.php');
        const newsData = await response.json();
        if (Array.isArray(newsData)) displayNews(newsData);
    } catch (error) {
        console.error("Fetch News Error:", error);
        newsContainer.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ في تحميل الأخبار.</p>';
    } finally {
        newsLoadingSpinner.style.display = 'none';
    }
}
async function fetchVideos() {
    videosLoadingSpinner.style.display = 'flex';
    videosContainer.innerHTML = '';
    try {
        const response = await fetch('https://ko.best-goal.live/videos.php');
        const videosData = await response.json();
        if (Array.isArray(videosData)) displayVideos(videosData);
    } catch (error) {
        console.error("Fetch Videos Error:", error);
        videosContainer.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ في تحميل الفيديوهات.</p>';
    } finally {
        videosLoadingSpinner.style.display = 'none';
    }
}
async function fetchTournaments() {
    tournamentsLoadingSpinner.style.display = 'flex';
    tournamentsGridContainer.style.display = 'none';
    try {
        const apiUrl = 'https://ko.best-goal.live/get.php';
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API Error for Tournaments');
        const responseData = await response.json();
        if (responseData && responseData.success === true) {
            allTournamentsData = responseData.data || [];
            displayTournamentsGrid(allTournamentsData);
        } else {
            throw new Error("API did not return success for tournaments");
        }
    } catch (error) {
        console.error("Fetch Tournaments Error:", error);
        tournamentsGridContainer.innerHTML = '<p style="text-align:center; color:red;">فشل تحميل البطولات. قد يكون المصدر محمي أو غير متاح حاليًا.</p>';
    } finally {
        tournamentsLoadingSpinner.style.display = 'none';
        tournamentsGridContainer.style.display = 'block';
    }
}
async function fetchTransfers() {
    transfersLoadingSpinner.style.display = 'flex';
    transfersContainer.innerHTML = '';
    try {
        const response = await fetch('https://ko.best-goal.live/transation.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const responseData = await response.json();
        if (responseData && responseData.success) {
            displayTransfers(responseData.data);
        } else {
            throw new Error('Failed to fetch transfers');
        }
    } catch (error) {
        console.error("Fetch Transfers Error:", error);
        transfersContainer.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ في تحميل الانتقالات.</p>';
    } finally {
        transfersLoadingSpinner.style.display = 'none';
    }
}
async function fetchEventsAndLineup(match) {
    ['#tab-info', '#tab-lineup', '#tab-events'].forEach(s => document.querySelector(s).innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>');
    const apiUrl = `${API_DOMAIN}/api/matches/events/?MatchID=${match['Match-id']}&time=%2B03%3A00`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const details = data['STING-WEB-Match-Details'];
        await fetchAndDisplayStreams(match); 
        renderInfo(details['Match-Info'], match);
        renderLineup(details['Match-Lineup'], match);
        renderEvents(details['Match-Events']);
    } catch (e) {
        console.error("Fetch Details Error:", e);
        document.querySelector('#tab-info').innerHTML = '<p style="text-align:center; color:red;">فشل تحميل التفاصيل</p>';
        document.querySelector('#tab-lineup').innerHTML = '<p style="text-align:center; color:red;">فشل تحميل التشكيلة</p>';
        document.querySelector('#tab-events').innerHTML = '<p style="text-align:center; color:red;">فشل تحميل الأحداث</p>';
    }
}
async function fetchStats(matchId) {
    document.querySelector('#tab-stats').innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
    const apiUrl = `${API_DOMAIN}/api/matches/stats/?MatchID=${matchId}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        renderStats(data['Statistics-1'], data['Statistics-2']);
    } catch (e) {
        console.error("Fetch Stats Error:", e);
        document.querySelector('#tab-stats').innerHTML = '<p style="text-align:center; color:red;">فشل تحميل الإحصائيات</p>';
    }
}
async function fetchAndDisplayStreams(match) {
    const matchId = match['Match-id'].toString();
    const streamsRef = collection(db, "matches", matchId, "streams");
    
    document.querySelectorAll('.dynamic-tab, .dynamic-panel').forEach(el => el.remove());

    try {
        const querySnapshot = await getDocs(streamsRef);
        if (!querySnapshot.empty) {
            const streams = [];
            querySnapshot.forEach((doc) => {
                streams.push({ id: doc.id, ...doc.data() });
            });
            
            detailsTabsContainer.insertAdjacentHTML('beforeend', `<button class="tab-btn dynamic-tab" data-tab="live">البث المباشر</button>`);
            detailsTabsMenu.insertAdjacentHTML('beforeend', `<button class="tab-btn dynamic-tab" data-tab="live">البث المباشر</button>`);
            tabContentContainer.insertAdjacentHTML('beforeend', `<div id="tab-live" class="tab-panel dynamic-panel"><div id="live-stream-buttons"></div></div>`);

            const liveStreamButtonsContainer = document.getElementById('live-stream-buttons');
            liveStreamButtonsContainer.innerHTML = streams.map(stream => 
                `<button class="stream-button" 
                    data-url="${stream.streamUrl}" 
                    data-type="${stream.streamType}" 
                    data-keyid="${stream.keyId || ''}" 
                    data-key="${stream.key || ''}">
                    ${stream.channelName}
                </button>`
            ).join('');
        }
    } catch (error) {
        console.error("Error fetching streams from Firebase:", error);
    }
}
// --- FIREBASE ADMIN FUNCTIONS ---
async function saveStream(matchId, streamId, streamData) {
    try {
        const docRef = streamId ? doc(db, "matches", matchId, "streams", streamId) : doc(collection(db, "matches", matchId, "streams"));
        await setDoc(docRef, streamData);
    } catch (e) {
        console.error("Error writing document: ", e);
        alert('حدث خطأ أثناء حفظ السيرفر.');
    }
}

async function deleteStream(matchId, streamId) {
    try {
        await deleteDoc(doc(db, "matches", matchId, "streams", streamId));
    } catch (e) {
        console.error("Error deleting document: ", e);
        alert('حدث خطأ أثناء الحذف.');
    }
}

async function refreshAdminStreamList(matchId) {
    currentStreamsList.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
    const streamsRef = collection(db, "matches", matchId, "streams");
    try {
        const querySnapshot = await getDocs(streamsRef);
        if (querySnapshot.empty) {
            currentStreamsList.innerHTML = 'لا توجد سيرفرات حاليًا.';
            return;
        }
        let html = '';
        querySnapshot.forEach((doc) => {
            const stream = doc.data();
            html += `<div class="current-stream-item"><span>${stream.channelName} (${stream.streamType})</span><div class="stream-actions"><button class="edit-stream-btn" data-id="${doc.id}">تعديل</button><button class="delete-stream-btn" data-id="${doc.id}">حذف</button></div></div>`;
        });
        currentStreamsList.innerHTML = html;
    } catch (error) {
        currentStreamsList.innerHTML = "<p style='color:red'>فشل تحميل قائمة السيرفرات.</p>";
    }
}

async function openAdminModal(matchId) {
    adminPasswordSection.style.display = 'block';
    adminContentSection.style.display = 'none';
    document.getElementById('admin-password-input').value = '';
    adminModal.style.display = 'flex';
    adminModal.dataset.currentMatchId = matchId;
}


// --- UI LOGIC & EVENT LISTENERS ---
function openMatchDetails(match) {
    modalMatchCard.innerHTML = `<div class="modal-team"><img src="${API_DOMAIN}${match['Team-Left']['Logo']}" class="modal-team-logo"><span class="modal-team-name">${match['Team-Left']['Name']}</span></div><div class="modal-match-score">${match['Team-Left']['Goal']} - ${match['Team-Right']['Goal']}</div><div class="modal-team right"><span class="modal-team-name">${match['Team-Right']['Name']}</span><img src="${API_DOMAIN}${match['Team-Right']['Logo']}" class="modal-team-logo"></div>`;
    
    // Reset tabs and content
    detailsTabsContainer.innerHTML = '<button class="tab-btn" data-tab="info">التفاصيل</button><button class="tab-btn" data-tab="lineup">التشكيلة</button><button class="tab-btn" data-tab="events">الأحداث</button><button class="tab-btn" data-tab="stats">الإحصائيات</button>';
    detailsTabsMenu.innerHTML = '<button class="tab-btn" data-tab="info">التفاصيل</button><button class="tab-btn" data-tab="lineup">التشكيلة</button><button class="tab-btn" data-tab="events">الأحداث</button><button class="tab-btn" data-tab="stats">الإحصائيات</button>';
    tabContentContainer.innerHTML = '<div id="tab-info" class="tab-panel"></div><div id="tab-lineup" class="tab-panel"></div><div id="tab-events" class="tab-panel"></div><div id="tab-stats" class="tab-panel"></div>';

    // Set default active tab
    document.querySelector('#details-tabs-container .tab-btn[data-tab="info"]').classList.add('active');
    document.querySelector('#details-tabs-menu .tab-btn[data-tab="info"]').classList.add('active');
    document.getElementById('tab-info').classList.add('active');
    activeTabTitle.textContent = "التفاصيل";
    
    matchDetailsModal.style.display = 'flex';
    matchDetailsModal.dataset.matchId = match['Match-id'];
    fetchEventsAndLineup(match);
}

mainNav.addEventListener('click', (e) => {
    if (e.target.matches('a.nav-link')) {
        e.preventDefault();
        window.scrollTo(0, 0);
        const targetViewId = e.target.dataset.view;
        mainNav.querySelector('.active')?.classList.remove('active');
        e.target.classList.add('active');
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(targetViewId).classList.add('active');
        
        if (targetViewId === 'news-view') fetchNews();
        if (targetViewId === 'videos-view') fetchVideos();
        if (targetViewId === 'tournaments-view') fetchTournaments();
        if (targetViewId === 'transfers-view') fetchTransfers();
        
        if(mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            drawerToggle.classList.remove('open');
        }
    }
});

drawerToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    drawerToggle.classList.toggle('open');
});

function formatDateToString(date) { return date.toISOString().split('T')[0]; }

todayBtn.addEventListener('click', () => { currentDate = new Date(); fetchMatches(formatDateToString(currentDate)); });
yesterdayBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); fetchMatches(formatDateToString(currentDate)); });
tomorrowBtn.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); fetchMatches(formatDateToString(currentDate)); });
datePicker.addEventListener('change', () => {
    const dateParts = datePicker.value.split('-').map(part => parseInt(part, 10));
    currentDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
    fetchMatches(datePicker.value);
});

matchesContainer.addEventListener('mousedown', (e) => {
    const matchBody = e.target.closest('.match-body');
    if (matchBody) {
        longPressTimer = setTimeout(() => {
            longPressTimer = null; // Prevent click from firing after long press
            openAdminModal(matchBody.dataset.matchId);
        }, 6000);
    }
});
matchesContainer.addEventListener('mouseup', () => clearTimeout(longPressTimer));
matchesContainer.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
matchesContainer.addEventListener('click', (e) => {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        const matchBody = e.target.closest('.match-body');
        if (matchBody) {
            const matchId = matchBody.dataset.matchId;
            const matchData = allMatchesData.find(m => m['Match-id'] == matchId);
            if (matchData) openMatchDetails(matchData);
        }
    }
});
matchesContainer.addEventListener('touchstart', (e) => {
    const matchBody = e.target.closest('.match-body');
    if (matchBody) {
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            openAdminModal(matchBody.dataset.matchId);
        }, 6000);
    }
}, { passive: true });
matchesContainer.addEventListener('touchend', () => clearTimeout(longPressTimer));

matchDetailsModal.querySelector('.modal-close-btn').addEventListener('click', () => { matchDetailsModal.style.display = 'none'; });
videoPlayerModal.querySelector('.modal-close-btn').addEventListener('click', () => {
    videoPlayerModal.style.display = 'none';
    videoPlayerIframe.srcdoc = 'about:blank';
});
adminModal.querySelector('.modal-close-btn').addEventListener('click', () => { adminModal.style.display = 'none'; });

function handleTabClick(e) {
    if (e.target.matches('button.tab-btn')) {
        const tabName = e.target.dataset.tab;
        [detailsTabsContainer, detailsTabsMenu].forEach(container => {
            container.querySelector('.active')?.classList.remove('active');
            container.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        });
        document.querySelector('#tab-content-container .tab-panel.active')?.classList.remove('active');
        const targetPanel = document.getElementById(`tab-${tabName}`);
        if(targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.scrollTop = 0;
        }
        activeTabTitle.textContent = e.target.textContent;
        detailsTabsMenu.classList.remove('open');
        
        const matchId = matchDetailsModal.dataset.matchId;
        const matchData = allMatchesData.find(m => m['Match-id'] == matchId);
        
        // Always re-fetch data for the clicked tab
        if (tabName === 'stats') {
            fetchStats(matchId);
        } else if (tabName !== 'live' && matchData) {
            // Re-fetch the main details bundle which contains info, lineup, events
            // but only render the specific part needed
            getMatchDetails(matchData).then(details => {
                if (tabName === 'info') renderInfo(details['Match-Info'], matchData);
                if (tabName === 'lineup') renderLineup(details['Match-Lineup'], matchData);
                if (tabName === 'events') renderEvents(details['Match-Events']);
            });
        }
    }
}
detailsTabsContainer.addEventListener('click', handleTabClick);
detailsTabsMenu.addEventListener('click', handleTabClick);
detailsTabsDrawerBtn.addEventListener('click', (e) => { e.stopPropagation(); detailsTabsMenu.classList.toggle('open'); });
document.body.addEventListener('click', () => detailsTabsMenu.classList.remove('open'), true);

videosContainer.addEventListener('click', (e) => {
    const videoCard = e.target.closest('.video-card');
    if (videoCard) {
        const m3u8Url = videoCard.dataset.m3u8Url;
        if (m3u8Url) {
            const playerHtml = `<!DOCTYPE html><html><head><style>body,html{margin:0;padding:0;height:100%;width:100%;background-color:#000;}#player{height:100%!important;width:100%!important;}</style><script src="https://ssl.p.jwpcdn.com/player/v/8.36.5/jwplayer.js"><\/script><script>jwplayer.key = 'XSuP4qMl+9tK17QNb+4+th2Pm9AWgMO/cYH8CI0HGGr7bdjo';<\/script></head><body><div id="player"></div><script>jwplayer("player").setup({file:"${m3u8Url}",type:'hls',width:"100%",height:"100%",autostart: true});<\/script></body></html>`;
            videoPlayerIframe.srcdoc = playerHtml;
            videoPlayerModal.style.display = 'flex';
        }
    }
});
tournamentsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.tournament-card');
    if (card) {
        const index = card.dataset.index;
        displayStandings(allTournamentsData[index]);
    }
});
tabContentContainer.addEventListener('click', (e) => {
    if(e.target.matches('.stream-button')) {
        const button = e.target;
        const setupConfig = {
            file: button.dataset.url,
            type: button.dataset.type === 'hls' ? 'hls' : 'dash',
            width: "100%",
            height: "100%",
            autostart: true
        };
        if(button.dataset.type === 'dash-drm') {
            setupConfig.drm = { "clearkey": { "keyId": button.dataset.keyid, "key": button.dataset.key } };
        }
        const playerHtml = `<!DOCTYPE html><html><head><link rel="stylesheet" href="jw_ako.css"><style>body,html{margin:0;padding:0;height:100%;width:100%;background-color:#000;}#player{height:100%!important;width:100%!important;}</style><script src="https://ssl.p.jwpcdn.com/player/v/8.36.5/jwplayer.js"><\/script><script>jwplayer.key = 'XSuP4qMl+9tK17QNb+4+th2Pm9AWgMO/cYH8CI0HGGr7bdjo';<\/script></head><body><div id="player"></div><script>jwplayer("player").setup(${JSON.stringify(setupConfig)});<\/script></body></html>`;
        videoPlayerIframe.srcdoc = playerHtml;
        videoPlayerModal.style.display = 'flex';
    }
});
document.getElementById('admin-login-btn').addEventListener('click', () => {
    const password = document.getElementById('admin-password-input').value;
    const matchId = adminModal.dataset.currentMatchId;
    if (password === ADMIN_PASSWORD) {
        adminPasswordSection.style.display = 'none';
        adminContentSection.style.display = 'block';
        refreshAdminStreamList(matchId);
    } else {
        alert('كلمة المرور خاطئة!');
    }
});
addStreamForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const matchId = adminModal.dataset.currentMatchId;
    const streamId = document.getElementById('stream-id').value;
    const streamData = {
        channelName: document.getElementById('stream-name').value,
        streamType: document.getElementById('stream-type').value,
        streamUrl: document.getElementById('stream-url').value,
        keyId: document.getElementById('stream-key-id').value || null,
        key: document.getElementById('stream-key').value || null,
    };
    saveStreamBtn.textContent = "جاري الحفظ...";
    saveStreamBtn.disabled = true;
    try {
        await saveStream(matchId, streamId || Date.now().toString(), streamData);
        alert('تم الحفظ بنجاح!');
        addStreamForm.reset();
        streamTypeSelect.dispatchEvent(new Event('change'));
        document.getElementById('stream-id').value = '';
        formTitle.textContent = "إضافة سيرفر جديد";
        saveStreamBtn.textContent = "حفظ السيرفر";
        cancelEditBtn.style.display = 'none';
        await refreshAdminStreamList(matchId);
    } catch (error) {
        alert('فشل الحفظ.');
    } finally {
        saveStreamBtn.disabled = false;
    }
});
streamTypeSelect.addEventListener('change', () => { drmFields.style.display = streamTypeSelect.value === 'dash-drm' ? 'flex' : 'none'; });
cancelEditBtn.addEventListener('click', () => {
    addStreamForm.reset();
    document.getElementById('stream-id').value = '';
    formTitle.textContent = "إضافة سيرفر جديد";
    saveStreamBtn.textContent = "حفظ السيرفر";
    cancelEditBtn.style.display = 'none';
    streamTypeSelect.dispatchEvent(new Event('change'));
});
currentStreamsList.addEventListener('click', async (e) => {
    const matchId = adminModal.dataset.currentMatchId;
    if (e.target.matches('.delete-stream-btn')) {
        const streamId = e.target.dataset.id;
        if (confirm('هل أنت متأكد من حذف هذا السيرفر؟')) {
            await deleteStream(matchId, streamId);
            await refreshAdminStreamList(matchId);
        }
    }
    if(e.target.matches('.edit-stream-btn')) {
        const streamId = e.target.dataset.id;
        const streamRef = doc(db, "matches", matchId, "streams", streamId);
        const docSnap = await getDoc(streamRef);
        if (docSnap.exists()) {
            const stream = docSnap.data();
            document.getElementById('stream-id').value = docSnap.id;
            document.getElementById('stream-name').value = stream.channelName;
            document.getElementById('stream-type').value = stream.streamType;
            document.getElementById('stream-url').value = stream.streamUrl;
            document.getElementById('stream-key-id').value = stream.keyId || '';
            document.getElementById('stream-key').value = stream.key || '';
            formTitle.textContent = "تعديل السيرفر";
            saveStreamBtn.textContent = "تحديث البيانات";
            cancelEditBtn.style.display = 'block';
            streamTypeSelect.dispatchEvent(new Event('change'));
            addStreamForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// --- INITIAL LOAD ---
fetchMatches(formatDateToString(new Date()));