const mongoose = require('mongoose');


const userActivitySchema = new mongoose.Schema({
    // Kullanıcı referansı
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Kayıt anında kullanıcının e-posta ve rol bilgisi (gösterim için yedek)
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },

    // Ziyaret edilen URL (her ziyaret için yeni kayıt)
    visitedUrl: { type: String, required: true },

    // Ziyaret zamanı
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
