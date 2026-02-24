import { CONFIG } from './config.js';

export async function fetchLocations() {
    try {
        const response = await fetch(CONFIG.DATA_SOURCE_URL);
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return [];
    }
}

// ✅ แก้ไข: เพิ่ม parameter (avatarId) เข้ามา
// ✅ เพิ่ม parameter 'startNode' เข้ามาเป็นตัวที่ 3
export async function sendNavigationGoal(location, avatarId, startNode) {
    const payload = {
        "guest_id": CONFIG.CURRENT_USER_ID,
        "start_node": parseInt(startNode),   // ใช้ค่าชั้นที่ผู้ใช้เลือก
        "end_node": location.node_id,
        "mode": "gps",
        "location_name": location.name_th,
        "avatar_id": parseInt(avatarId) 
    };
    console.log("🚀 [API] Sending Goal (Start->End):", JSON.stringify(payload));
    return payload;
}

export async function sendFloorUpdate(floorId) {
    const payload = {
        "guest_id": CONFIG.CURRENT_USER_ID,
        "floor_id": parseInt(floorId)
    };
    console.log("📡 [API] Sending Floor Update:", JSON.stringify(payload));
    return payload;
}