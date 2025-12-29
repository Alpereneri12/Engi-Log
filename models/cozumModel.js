const mongoose = require("mongoose");


const CozumSchema = new mongoose.Schema(
    {
        sorun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sorun",
            required: true
        },
        aciklama: { type: String, required: true },
        resim: { type: String, default: null },
        yazan: { type: String, required: true },
        yazanRol: {
            type: String,
            enum: ["user", "uzman", "admin"],
            default: "user"
        },
        uzmanOnayli: { type: Boolean, default: false },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cozum", CozumSchema);