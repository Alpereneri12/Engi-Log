

let onlineUserCount = 0;


const activeSockets = new Set();


function addOnlineUser(socketId) {//yeni bir online kullanıcı ekler
    if (activeSockets.has(socketId)) {
        return onlineUserCount;
    }
    
    activeSockets.add(socketId);
    onlineUserCount = activeSockets.size;
    
    console.log(`[Online Users] Kullanıcı eklendi. Toplam: ${onlineUserCount}`);
    
    return onlineUserCount;
}


function removeOnlineUser(socketId) {//bir online kullanıcı çıkarsa onu aktif socketlerden siler
    if (!activeSockets.has(socketId)) {
        return onlineUserCount;
    }
    
    activeSockets.delete(socketId);
    onlineUserCount = activeSockets.size;
    
    console.log(`[Online Users] Kullanıcı çıktı. Toplam: ${onlineUserCount}`);
    
    return onlineUserCount;
}


function getOnlineUserCount() {
    return onlineUserCount;
}


function clearAll() {//tüm online kullanıcıları temizler
    activeSockets.clear();
    onlineUserCount = 0;
    console.log('[Online Users] Tüm kullanıcılar temizlendi.');
}

module.exports = {
    addOnlineUser,
    removeOnlineUser,
    getOnlineUserCount,
    clearAll
};

