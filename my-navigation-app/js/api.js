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
export async function sendNavigationGoal(location, avatarId) {
    const payload = {
        "guest_id": CONFIG.CURRENT_USER_ID,
        "start_node": CONFIG.START_NODE_ID,
        "end_node": location.node_id,
        "mode": "gps",
        "location_name": location.name_th,
        "avatar_id": parseInt(avatarId) // ส่งข้อมูล Avatar ไปให้ Backend/3D
    };
    console.log("🚀 [API] Sending Goal with Avatar:", JSON.stringify(payload));
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