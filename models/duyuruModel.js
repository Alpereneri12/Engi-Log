const mongoose = require("mongoose");


const DuyuruSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            unique: true,
            sparse: true
        },
        baslik: { type: String, required: true },
        icerik: { type: String, required: true },
        resim: { type: String, default: null },
        ekleyen: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Duyuru", DuyuruSchema);
