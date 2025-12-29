const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true,
            unique: true  // Her IP sadece bir kez kaydedilir (benzersiz)
        },
        lastVisit: {
            type: Date,
            required: true,
            default: Date.now  // Varsayılan: Şu anki zaman
        },
        visitCount: {
            type: Number,
            default: 1  // İlk ziyaret = 1, sonra 2 saat sonra tekrar gelirse +1
        }
    },
    { timestamps: true }  // createdAt ve updatedAt otomatik eklenir
);

module.exports = mongoose.model("Visitor", VisitorSchema);

