const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/engilog");
        console.log("✅ MongoDB bağlantısı başarılı");
    } catch (err) {
        console.error("❌ MongoDB bağlantı hatası:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
