const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/engilog";

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(mongoUri);
            console.log("✅ MongoDB bağlantısı başarılı");
            return;
        } catch (err) {
            console.error(`❌ MongoDB bağlantı hatası (deneme ${attempt}/${retries}):`, err.message);
            if (attempt < retries) {
                console.log(`Tekrar deneniyor ${delay / 1000}s sonra...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error("MongoDB'ye bağlanılamadı. Lütfen aşağıdakileri kontrol edin:");
                console.error("- .env veya ortam değişkenlerinde doğru 'MONGO_URI' değerinin bulunduğundan emin olun");
                console.error("- Yerel MongoDB kullanıyorsanız servis çalışıyor mu (mongod)");
                console.error("Örnek MONGO_URI: mongodb+srv://user:password@cluster.mongodb.net/engilog?retryWrites=true&w=majority");
                process.exit(1);
            }
        }
    }
};

module.exports = connectDB;
