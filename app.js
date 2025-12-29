const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");



app.set('trust proxy', true);

const connectDB = require("./config/db");
const User = require("./models/userModel");
const visitorTracker = require("./middlewares/visitorTracker");
const activityLogger = require("./middlewares/activityLogger");
const { addOnlineUser, removeOnlineUser, getOnlineUserCount } = require("./utils/onlineUsers");


app.use(session({//burada session ayarlarını yapmamızın amacı csrf koruması için gereklidir.
    secret: "engilog-secret-key",
    resave: false,
    saveUninitialized: false
}));


app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});


//Body parser session'dan sonra gelmelidir (csrf için gerekli)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// IP bazlı ziyaretçi sayacı (2 saatlik kural ile)

app.use(visitorTracker);

app.use(express.static(path.join(__dirname, "public")));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(activityLogger);

app.use("/", require("./routes/homeRoutes"));
app.use("/", require("./routes/authRoutes"));
app.use("/", require("./routes/sitemapRoutes")); // Sitemap route'u eklendi (/sitemap.xml)
app.use("/sorunlar", require("./routes/sorunRoutes"));
app.use("/duyurular", require("./routes/duyuruRoutes"));
app.use("/admin", require("./routes/adminRoutes"));


app.use((err, req, res, next) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
        console.error(' CSRF validation failed:', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            err: err.message
        });

        // Eğer istek JSON bekliyorsa JSON döndür
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
            return res.status(403).json({ error: 'Form süresi doldu, lütfen sayfayı yenileyip tekrar deneyin.' });
        }

        // HTML istekleri için kullanıcı dostu bir sayfa göster
        return res.status(403).render('csrf-error', { message: 'Form süresi doldu, lütfen sayfayı yenileyip tekrar deneyin.' });
    }

    next(err);
});


const createDefaultUsers = async () => {//burada varsayılan admin ve uzman kullanıcıları oluşturuluyor.bunu yapmamızdaki amaç uygulama ilk kez çalıştığında bu kullanıcıların eksik olmamasını sağlamaktır.
    const admin = await User.findOne({ email: "admin@engilog.com" });
    if (!admin) {
        await User.create({
            ad: "Admin",
            email: "admin@engilog.com",
            sifre: "123456",
            role: "admin"
        });
        console.log("✅ Admin kullanıcı oluşturuldu");
    }

    const uzman = await User.findOne({ email: "uzman@engilog.com" });
    if (!uzman) {
        await User.create({
            ad: "Uzman Mühendis",
            email: "uzman@engilog.com",
            sifre: "123456",
            role: "uzman"
        });
        console.log("✅ Uzman kullanıcı oluşturuldu");
    }
};


//HTTP sunucusu oluştur (Socket.io için gerekli)
const server = http.createServer(app);

//Socket.io sunucusu oluştur
const io = new Server(server, {
    cors: {
        origin: "*", // Tüm origin'lere izin ver (production'da kısıtlanabilir)
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
  
    const socketId = socket.id;
    const newCount = addOnlineUser(socketId);
    
    console.log(`[Socket.IO] Yeni bağlantı: ${socketId} | Toplam online: ${newCount}`);
    
    // Yeni bağlanan kullanıcıya mevcut online sayısını gönder
    socket.emit('onlineCount', newCount);
    
    // Tüm bağlı kullanıcılara yeni sayıyı bildir
    io.emit('onlineCountUpdate', newCount);

    //Her 30 saniyede bir heartbeat gönder
    //Eğer heartbeat gelmezse, kullanıcı çıkmış sayılır
    const heartbeatInterval = setInterval(() => {
        socket.emit('ping');
    }, 30000); // 30 saniye


    socket.on('pong', () => {
        //Kullanıcı hala aktif, bir şey yapmaya gerek yok
    });


    socket.on('disconnect', () => {
        //Heartbeat interval'ini temizle
        clearInterval(heartbeatInterval);
        
        //Online kullanıcı sayısını azalt
        const newCount = removeOnlineUser(socketId);
        
        console.log(`[Socket.IO] Bağlantı koptu: ${socketId} | Toplam online: ${newCount}`);
        
        //Tüm bağlı kullanıcılara yeni sayıyı bildir
        io.emit('onlineCountUpdate', newCount);
    });
});


(async () => {
    try {
        await connectDB(); //MongoDB bağlantısı
        await createDefaultUsers(); //Seed işlemlerinin açıklaması şudur: uygulama ilk kez çalıştığında admin ve uzman kullanıcılarını oluşturur.

        //HTTP sunucusunu başlat (Socket.io ile birlikte)
        server.listen(3000, () => {
            console.log("🚀 Sunucu 3000 portunda çalışıyor");
            console.log("📡 Socket.IO aktif");
        });
    } catch (err) {
        console.error("Uygulama başlatılamadı:", err);
        process.exit(1);
    }
})();

//Socket.io'yu diğer dosyalarda kullanmak için export et
module.exports = { io };
