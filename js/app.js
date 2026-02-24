import { fetchLocations, sendNavigationGoal, sendFloorUpdate } from './api.js';

let allLocations = [];
let currentFloor = 1;
let pendingLocation = null; 
let pendingStartNode = null; // ✅ ตัวแปรเก็บตำแหน่งลิฟต์ชั้นเริ่มต้น

const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
const floorButtons = document.querySelectorAll('.floor-btn');
const alertPopup = document.getElementById('alert-popup');

// ✅ ตัวแปร DOM สำหรับ Modal เลือกชั้นปัจจุบัน
const startFloorModalOverlay = document.getElementById('start-floor-modal-overlay');
const startFloorBtns = document.querySelectorAll('.start-floor-btn');
const cancelStartFloorBtn = document.getElementById('cancel-start-floor-btn');

// ตัวแปร DOM สำหรับ Avatar Modal
const avatarModalOverlay = document.getElementById('avatar-modal-overlay');
const avatarCards = document.querySelectorAll('.avatar-card');
const cancelAvatarBtn = document.getElementById('cancel-avatar-btn');

async function initApp() {
    allLocations = await fetchLocations();
}

// --- 1. Search Logic ---
searchInput.addEventListener('keyup', (e) => {
    const query = e.target.value.toLowerCase();
    resultsList.innerHTML = ''; 

    if (query.length === 0) {
        resultsList.style.display = 'none';
        return;
    }

    const filtered = allLocations.filter(loc => {
        const th = loc.name_th ? loc.name_th.toLowerCase() : "";
        return th.includes(query);
    });

    if (filtered.length > 0) {
        resultsList.style.display = 'block';
        filtered.forEach(loc => {
            const div = document.createElement('div');
            div.classList.add('result-item');
            div.innerHTML = `<strong>${loc.name_th}</strong> <small>ชั้น ${loc.floor}</small>`;
            
            div.addEventListener('click', () => {
                searchInput.value = loc.name_th;
                resultsList.style.display = 'none';
                
                // ✅ ขั้นที่ 1: พักข้อมูล แล้วเปิด Popup ให้เลือก "ชั้นเริ่มต้น"
                pendingLocation = loc;
                startFloorModalOverlay.classList.add('show');
            });
            
            resultsList.appendChild(div);
        });
    }
});

// --- 2. Start Floor Selection Logic ---
startFloorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const floorSelected = parseInt(btn.dataset.floor);
        // แปลงเลขชั้นเป็น Node ของลิฟต์ (เช่น ชั้น 1 = 100, ชั้น 6 = 600)
        pendingStartNode = floorSelected * 100; 

        // ✅ ขั้นที่ 2: ปิด Popup เลือกชั้น แล้วเปิด Popup "Avatar"
        startFloorModalOverlay.classList.remove('show');
        avatarModalOverlay.classList.add('show');
    });
});

cancelStartFloorBtn.addEventListener('click', () => {
    startFloorModalOverlay.classList.remove('show');
    pendingLocation = null;
    searchInput.value = ''; 
});

// --- 3. Avatar Selection Logic ---
avatarCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedAvatarId = card.dataset.avatar;
        
        avatarModalOverlay.classList.remove('show');
        
        // ✅ ขั้นที่ 3: ส่ง API (จุดเริ่มต้น + ปลายทาง + Avatar)
        if (pendingLocation && pendingStartNode) {
            sendNavigationGoal(pendingLocation, selectedAvatarId, pendingStartNode);
            
            // ล้างค่าหลังจากส่งเสร็จ
            pendingLocation = null;
            pendingStartNode = null;
        }
    });
});

cancelAvatarBtn.addEventListener('click', () => {
    avatarModalOverlay.classList.remove('show');
    pendingLocation = null;
    pendingStartNode = null;
    searchInput.value = ''; 
});

// --- 4. Floor Selection & Arrival Logic ---
floorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedFloor = btn.dataset.floor;
        if (currentFloor == selectedFloor) return;
        changeFloor(selectedFloor);
    });
});

function changeFloor(floorId) {
    currentFloor = floorId;
    floorButtons.forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.floor-btn[data-floor="${floorId}"]`);
    if(targetBtn) targetBtn.classList.add('active');

    sendFloorUpdate(floorId);
}

function showArrivalAlert(title, message) {
    const content = alertPopup.querySelector('.alert-content');
    content.innerHTML = `<strong>${title}</strong><small>${message}</small>`;
    alertPopup.classList.add('show');
    setTimeout(() => { alertPopup.classList.remove('show'); }, 4000);
}

// ปิด Dropdown เมื่อกดข้างนอก
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) resultsList.style.display = 'none';
});

initApp();