const mongoose = require("mongoose");


const SorunSchema = new mongoose.Schema(
    {
        baslik: { type: String, required: true },
        slug: {
            type: String,
            unique: true,  // Slug benzersiz olmalı
            sparse: true   // null değerlere izin ver (eski kayıtlar için)
        },
        kategori: { type: String, required: true },
        aciklama: { type: String, required: true },
        resim: { type: String, default: null },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        goruntulenme: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Sorun", SorunSchema);
