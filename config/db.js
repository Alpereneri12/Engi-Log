const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/engilog";
    try {
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ MongoDB bağlantısı başarılı");
    } catch (err) {
        console.error("❌ MongoDB bağlantı hatası:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
