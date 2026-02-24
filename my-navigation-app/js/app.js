import { fetchLocations, sendNavigationGoal, sendFloorUpdate } from './api.js';

let allLocations = [];
let currentFloor = 1;
let pendingLocation = null; // ✅ ตัวแปรเก็บสถานที่ที่เลือกรอไว้

const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
const floorButtons = document.querySelectorAll('.floor-btn');
const alertPopup = document.getElementById('alert-popup');

// ✅ ตัวแปร DOM สำหรับ Avatar Modal
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
                
                // ✅ แทนที่จะส่ง API เลย ให้เก็บข้อมูลไว้และเปิด Popup Avatar
                pendingLocation = loc;
                avatarModalOverlay.classList.add('show');
            });
            
            resultsList.appendChild(div);
        });
    }
});

// --- 2. Avatar Selection Logic ---
// เมื่อผู้ใช้กดเลือก Avatar
avatarCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedAvatarId = card.dataset.avatar;
        
        // ปิด Popup
        avatarModalOverlay.classList.remove('show');
        
        // ส่ง API พร้อมสถานที่ที่ทดไว้ + Avatar ที่เลือก
        if (pendingLocation) {
            sendNavigationGoal(pendingLocation, selectedAvatarId);
            pendingLocation = null; // ล้างค่า
        }
    });
});

// เมือกดปุ่มยกเลิกการเลือก Avatar
cancelAvatarBtn.addEventListener('click', () => {
    avatarModalOverlay.classList.remove('show');
    pendingLocation = null;
    searchInput.value = ''; // ล้างช่องค้นหา
});

// --- 3. Floor Selection Logic ---
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

// --- 4. Arrival / Popup Logic ---
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