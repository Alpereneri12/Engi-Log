const Sorun = require("../models/sorunModel");
const Cozum = require("../models/cozumModel");
const { createUniqueSlug } = require("../utils/slugify");


exports.liste = async (req, res) => {
    try {
        const q = req.query.q ? req.query.q.trim() : "";//trim() baştaki ve sondaki boşlukları kaldırır.
        const kategori = req.query.kategori ? req.query.kategori.trim() : "";

        const filter = {};

        if (q) {
            filter.$or = [//burası arama yapılacak alanları belirtiyor
                { baslik: { $regex: q, $options: "i" } },
                { aciklama: { $regex: q, $options: "i" } }
            ];
        }

        else if (kategori) {
            filter.kategori = kategori;
        }

        const sorunlar = await Sorun.find(filter).sort({ createdAt: -1 });
        res.render("sorunlar", {
            sorunlar,
            q,
            kategori
        });
    } catch (err) {
        console.error("Sorun listeleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.ekleForm = (req, res) => {
    res.render("sorun-ekle", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '' });//CSRF token'ı forma ekle
};


exports.detay = async (req, res) => {
    try {
        const slugOrId = req.params.slug;

        let sorun = await Sorun.findOne({ slug: slugOrId });

        if (!sorun && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {//slug bulunmazsa id ile arama yapmak buradaki amaç
            sorun = await Sorun.findById(slugOrId);
        }

        if (!sorun) {
            return res.status(404).send("Sorun bulunamadı");
        }

        // Görüntülenme sayısını artır
        sorun.goruntulenme += 1;
        await sorun.save();

        //Çözümleri getirme
        const cozumler = await Cozum.find({ sorun: sorun._id }).sort({ createdAt: -1 });

        res.render("sorun-detay", {
            sorun,
            cozumler
        });
    } catch (err) {
        console.error("Sorun detay hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.ekle = async (req, res) => {
    try {
        const { baslik, kategori, aciklama } = req.body;

        if (!baslik || !kategori || !aciklama) {
            return res.status(400).send("Tüm alanlar zorunludur");
        }

        const checkSlugExists = async (slug) => {
            const existing = await Sorun.findOne({ slug });
            return !!existing;
        };

        const slug = await createUniqueSlug(baslik, checkSlugExists);

        const resimYolu = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        await Sorun.create({//Veritabanına yeni sorun ekleme
            baslik,
            slug, 
            kategori,
            aciklama,
            resim: resimYolu,
            userId: req.session.user ? req.session.user.id : null
        });

        res.redirect("/sorunlar");
    } catch (err) {
        console.error("Sorun ekleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};

exports.cozumEkleForm = async (req, res) => {
    try {
        const slugOrId = req.params.slug;

        // Önce slug ile ara, bulunamazsa ID ile ara (geriye dönük uyumluluk)
        let sorun = await Sorun.findOne({ slug: slugOrId });

        // Slug ile bulunamadıysa, ID ile dene
        if (!sorun && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
            sorun = await Sorun.findById(slugOrId);
        }

        if (!sorun) {
            return res.status(404).send("Sorun bulunamadı");
        }

        // CSRF token is provided by route-level csurf middleware; include it for the form
        res.render("cozum-ekle", { sorun, csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '' });
    } catch (err) {
        console.error("Çözüm ekle form hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.cozumEkle = async (req, res) => {
    try {
        const slugOrId = req.params.slug;
        const { aciklama } = req.body;

        // Boş alan kontrolü
        if (!aciklama || !aciklama.trim()) {
            return res.status(400).send("Çözüm açıklaması boş olamaz");
        }

        // Giriş kontrolü (authGuard zaten var ama ekstra güvenlik)
        if (!req.session.user) {
            return res.status(401).redirect("/login");
        }

        // Önce slug ile ara, bulunamazsa ID ile ara (geriye dönük uyumluluk)
        let sorun = await Sorun.findOne({ slug: slugOrId });

        // Slug ile bulunamadıysa, ID ile dene
        if (!sorun && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
            sorun = await Sorun.findById(slugOrId);
        }

        // İlgili sorun gerçekten var mı?
        if (!sorun) {
            return res.status(404).send("Sorun bulunamadı");
        }

        // Kullanıcı bilgilerini session'dan al
        const yazanAd = req.session.user.ad || "Anonim";
        const yazanRol = req.session.user.role || "user";

        // Uzmanlık kuralı: uzmanOnayli = (role === \"uzman\" veya \"admin\")
        const uzmanOnayli = yazanRol === "uzman" || yazanRol === "admin";

        // Resim yolu
        const resimYolu = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        await Cozum.create({
            sorun: sorun._id,  // Sorun objesinden _id kullan
            aciklama: aciklama.trim(),
            resim: resimYolu,
            yazan: yazanAd,
            yazanRol,
            uzmanOnayli,
            userId: req.session.user.id
        });

        // Slug varsa slug ile, yoksa ID ile redirect et
        const redirectUrl = sorun.slug || sorun._id;
        res.redirect(`/sorunlar/${redirectUrl}`);
    } catch (err) {
        console.error("Çözüm ekleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};
