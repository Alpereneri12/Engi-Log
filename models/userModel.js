const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    ad: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    sifre: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "uzman", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
