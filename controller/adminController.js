const Duyuru = require("../models/duyuruModel");
const Sorun = require("../models/sorunModel");
const Cozum = require("../models/cozumModel");
const User = require("../models/userModel");
const Visitor = require("../models/visitorModel");
const UserActivity = require("../models/userActivityModel");
const { createUniqueSlug } = require("../utils/slugify");
const fs = require("fs");
const path = require("path");


exports.panel = async (req, res) => {
    try {
        //Bugünün başlangıcını hesaplıyoruz
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // İstatistikler ve verileri paralel olarak getir
        const [sorunSayisi, cozumSayisi, kullaniciSayisi, duyuruSayisi, toplamZiyaretci, bugunkuZiyaretci, kullanıcılar, sonSorunlar, sonCozumler, duyurular] =
            await Promise.all([
                Sorun.countDocuments(),
                Cozum.countDocuments(),
                User.countDocuments(),
                Duyuru.countDocuments(),
                //Toplam ziyaretçi sayısı 
                Visitor.aggregate([
                    { $group: { _id: null, total: { $sum: "$visitCount" } } }//visitCount alanlarını toplayarak toplam ziyaretçi sayısını hesaplıyoruz
                ]).then(result => result[0]?.total || 0),
                //Bugünkü ziyaretçi sayısı 
                Visitor.countDocuments({
                    $or: [
                        { createdAt: { $gte: todayStart } },
                        { updatedAt: { $gte: todayStart } }
                    ]
                }),
                //Tüm kullanıcıları getir şifre hariç
                User.find().select("-sifre").sort({ createdAt: -1 }),
                //Son eklenen 10 sorunu getir
                Sorun.find().sort({ createdAt: -1 }).limit(10),
                //Son eklenen 10 çözümü getir
                Cozum.find().sort({ createdAt: -1 }).limit(10).populate("sorun", "baslik slug"),
                //Tüm duyuruları getir
                Duyuru.find().sort({ createdAt: -1 })
            ]);

            //Son 50 kullanıcı aktivitesini getir 
            //En son ziyaret edilenler en üstte olacak şekilde tarihe göre sıralanır.
            const aktiviteler = await UserActivity.find()
                .sort({ date: -1 })
                .limit(50)
                .populate('userId', 'ad email role');

        const successMessage = req.query.success;

        res.render("admin-panel", {
            session: req.session,
            sorunSayisi,
            cozumSayisi,
            kullaniciSayisi,
            duyuruSayisi,
            toplamZiyaretci,
            bugunkuZiyaretci,
            kullanıcılar,
            sonSorunlar,
            sonCozumler,
            duyurular,
            aktiviteler,
            //CSRF token yalnızca render anında üretilir ve view'a geçirilir.
            //`req.csrfToken()` burada güvenli şekilde çağrılır çünkü route-level
            //`csurf` middleware GET isteğinde çalışmıştır.
            csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
            successMessage
        });
        //Güvenlik: admin panel GET isteğinde csurf middleware çalıştığı için
        //req.csrfToken()` mevcut olacaktır. Token, sadece bu render sırasında
        //view'a doğrudan veriliyor (res.locals kullanılmıyor) — bu sayede
        //aynı oturumdaki birden fazla form token çakışması yaşamaz.
    } catch (err) {
        console.error("Admin panel hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.duyuruEkle = async (req, res) => {
    try {
        const { baslik, icerik } = req.body;

        // Boş alan kontrolü
        if (!baslik || !icerik) {
            return res.status(400).send("Başlık ve içerik alanları zorunludur");
        }

        // Trim kontrolü
        const temizBaslik = baslik.trim();
        const temizIcerik = icerik.trim();

        if (!temizBaslik || !temizIcerik) {
            return res.status(400).send("Başlık ve içerik boş olamaz");
        }

        // Admin adını session'dan al
        const ekleyenAd = req.session.user?.ad || "Admin";

        // Slug oluştur
        const checkSlugExists = async (slug) => {
            const existing = await Duyuru.findOne({ slug });
            return !!existing;
        };
        const slug = await createUniqueSlug(temizBaslik, checkSlugExists);

        // Resim varsa önce hedef klasöre taşı ve DB'ye kaydedilecek path'i belirle
        let resimPath = null;
        if (req.file) {
            // Multer dosyayı public/uploads içine koyar, biz onu public/uploads/duyurular altına taşıyacağız
            try {
                const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
                const targetDir = path.join(uploadsDir, 'duyurular');
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const oldPath = req.file.path; // örn: .../public/uploads/12345-name.jpg
                const newPath = path.join(targetDir, req.file.filename);

                // Taşı
                if (oldPath !== newPath) fs.renameSync(oldPath, newPath);

                // Public erişim yolu olarak kaydet
                resimPath = `/uploads/duyurular/${req.file.filename}`;
            } catch (e) {
                console.error('Duyuru resmini taşırken hata:', e);
            }
        }

        //Duyuruyu oluştur (resimPath isteğe bağlı)
        await Duyuru.create({
            baslik: temizBaslik,
            slug,
            icerik: temizIcerik,
            ekleyen: ekleyenAd,
            resim: resimPath
        });

        //Başarılıysa admin panele yönlendir
        res.redirect("/admin");
    } catch (err) {
        console.error("Duyuru ekleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};

exports.sorunSil = async (req, res) => {
    try {
        const sorunId = req.params.id;

        // Sorun var mı kontrol et
        const sorun = await Sorun.findById(sorunId);
        if (!sorun) {
            return res.status(404).send("Sorun bulunamadı");
        }

        // Önce bağlı çözümleri sil
        await Cozum.deleteMany({ sorun: sorunId });

        // Sonra sorunu sil
        await Sorun.findByIdAndDelete(sorunId);

        res.redirect("/admin");
    } catch (err) {
        console.error("Sorun silme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.cozumSil = async (req, res) => {
    try {
        const cozumId = req.params.id;

        // Çözüm var mı kontrol et
        const cozum = await Cozum.findById(cozumId);
        if (!cozum) {
            return res.status(404).send("Çözüm bulunamadı");
        }

        // Çözümü sil
        await Cozum.findByIdAndDelete(cozumId);

        res.redirect("/admin");
    } catch (err) {
        console.error("Çözüm silme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.duyuruSil = async (req, res) => {
    try {
        const duyuruId = req.params.id;

        // Duyuru var mı kontrol et
        const duyuru = await Duyuru.findById(duyuruId);
        if (!duyuru) {
            return res.status(404).send("Duyuru bulunamadı");
        }

        // Duyuruyu sil
        await Duyuru.findByIdAndDelete(duyuruId);

        res.redirect("/admin");
    } catch (err) {
        console.error("Duyuru silme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.kullaniciRolGuncelle = async (req, res) => {
    try {
        const kullaniciId = req.params.id;
        const { yeniRol } = req.body;

       
        const gecerliRoller = ["user", "uzman", "admin"];
        if (!gecerliRoller.includes(yeniRol)) {
            return res.status(400).send("Geçersiz rol");
        }

        
        const kullanici = await User.findById(kullaniciId);
        if (!kullanici) {
            return res.status(404).send("Kullanıcı bulunamadı");
        }

        
        if (kullaniciId === req.session.user.id.toString()) {
            return res.status(403).send("Kendi rolünüzü değiştiremezsiniz");
        }

       
        kullanici.role = yeniRol;
        await kullanici.save();

        res.redirect("/admin");
    } catch (err) {
        console.error("Kullanıcı rol güncelleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.uzmanYap = async (req, res) => {
    try {
        const kullaniciId = req.params.id;

        
        const kullanici = await User.findById(kullaniciId);
        if (!kullanici) {
            return res.status(404).send("Kullanıcı bulunamadı");
        }

        
        if (kullaniciId === req.session.user.id.toString()) {
            return res.status(403).send("Kendi rolünüzü değiştiremezsiniz");
        }

        
        if (kullanici.role === "uzman" || kullanici.role === "admin") {
            return res.status(400).send("Kullanıcı zaten uzman veya admin");
        }

        
        kullanici.role = "uzman";
        await kullanici.save();

        res.redirect("/admin?success=uzman_yapildi");
    } catch (err) {
        console.error("Uzman yapma hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.uzmanKaldir = async (req, res) => {
    try {
        const kullaniciId = req.params.id;

        
        const kullanici = await User.findById(kullaniciId);
        if (!kullanici) {
            return res.status(404).send("Kullanıcı bulunamadı");
        }

        
        if (kullaniciId === req.session.user.id.toString()) {
            return res.status(403).send("Kendi rolünüzü değiştiremezsiniz");
        }

        
        if (kullanici.role !== "uzman") {
            return res.status(400).send("Kullanıcı uzman değil");
        }

        
        kullanici.role = "user";
        await kullanici.save();

        res.redirect("/admin?success=uzman_kaldirildi");
    } catch (err) {
        console.error("Uzman kaldırma hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};

