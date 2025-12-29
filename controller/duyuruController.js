const Duyuru = require("../models/duyuruModel");
const { createUniqueSlug } = require("../utils/slugify");
const fs = require("fs");//dosya işlemleri
const path = require("path");


exports.liste = async (req, res) => {
    try {
        const duyurular = await Duyuru.find().sort({ createdAt: -1 });
        res.render("duyurular", { duyurular });
    } catch (err) {
        console.error("Duyuru listeleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.detay = async (req, res) => {
    try {
        const slugOrId = req.params.slug;

        let duyuru = await Duyuru.findOne({ slug: slugOrId });
        if (!duyuru && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {//burayı yapmamızdaki amaç slug ile bulunamazsa id ile de arama yapabilmek
            duyuru = await Duyuru.findById(slugOrId);
        }

        if (!duyuru) {
            return res.status(404).send("Duyuru bulunamadı");
        }

        res.render("duyuru-detay", { duyuru });
    } catch (err) {
        console.error("Duyuru detay hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.guncelleForm = async (req, res) => {
    try {
       
        if (!req.session.user || req.session.user.role !== "admin") {
            return res.status(403).send("Yetkisiz işlem");
        }

       
        const id = req.params.id;

       
        const duyuru = await Duyuru.findById(id);

        if (!duyuru) {
            return res.status(404).send("Duyuru bulunamadı");
        }

        res.render("duyuru-guncelle", { duyuru });
    } catch (err) {
        console.error("Duyuru güncelleme form hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.guncelle = async (req, res) => {
    try {
      
        if (!req.session.user || req.session.user.role !== "admin") {
            return res.status(403).send("Yetkisiz işlem");
        }

  
        const id = req.params.id;
        const { baslik, icerik } = req.body;

        
        const duyuru = await Duyuru.findById(id);

        if (!duyuru) {
            return res.status(404).send("Duyuru bulunamadı");
        }

      
        if (baslik && baslik !== duyuru.baslik) {
            const checkSlugExists = async (s) => {
                const existing = await Duyuru.findOne({ slug: s });
                
                return existing && existing._id.toString() !== duyuru._id.toString();
            };
            duyuru.slug = await createUniqueSlug(baslik, checkSlugExists);
        } else if (!duyuru.slug) {
           
            const checkSlugExists = async (s) => {
                const existing = await Duyuru.findOne({ slug: s });
                return existing && existing._id.toString() !== duyuru._id.toString();
            };
            duyuru.slug = await createUniqueSlug(duyuru.baslik, checkSlugExists);
        }

        duyuru.baslik = baslik;
        duyuru.icerik = icerik;

        // Eski resim varsa tam dosya yolunu döndüren yardımcı fonksiyon
        const getFullPath = (resimUrl) => {
            // resimUrl örn: '/uploads/resim.jpg' veya '/uploads/duyurular/resim.jpg'
            if (!resimUrl) return null;
            return path.join(__dirname, '..', 'public', resimUrl.replace(/^\//, ''));
        };

        // Eğer admin 'resmiSil' checkbox'ını işaretlediyse eski resmi sil ve alanı null yap
        if (req.body.resmiSil) {
            if (duyuru.resim) {
                const fullOld = getFullPath(duyuru.resim);
                try {
                    if (fs.existsSync(fullOld)) fs.unlinkSync(fullOld); // eski dosyayı güvenli sil
                } catch (e) {
                    console.error("Eski resim silinirken hata:", e);
                }
            }
            duyuru.resim = null; // DB'de resmi kaldır
        }

        // Eğer yeni resim yüklendiyse yeni dosyayı 'duyurular' alt klasörüne taşı ve eskiyi sil
        if (req.file) {
            try {
                const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
                const targetDir = path.join(uploadsDir, 'duyurular');
                // Hedef klasör yoksa oluştur
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const oldPath = req.file.path; // multer tarafından kaydedilen geçici yol
                const newFilename = req.file.filename;
                const newPath = path.join(targetDir, newFilename);

                // Eğer aynı yerde değilse taşı
                if (oldPath !== newPath) {
                    fs.renameSync(oldPath, newPath);
                }

                // Yeni resim kaydedilmeden önce eski resmi sil (varsa)
                if (duyuru.resim) {
                    const fullOld = getFullPath(duyuru.resim);
                    try {
                        if (fs.existsSync(fullOld)) fs.unlinkSync(fullOld);
                    } catch (e) {
                        console.error("Eski resim silinirken hata:", e);
                    }
                }

                // Yeni resmi DB'ye yaz (frontend için public yolu)
                duyuru.resim = `/uploads/duyurular/${newFilename}`;
            } catch (e) {
                console.error("Yeni resim işlerken hata:", e);
            }
        }

        // Eğer checkbox işaretlenmedi ve yeni resim yoksa mevcut resim korunur (hiçbir işlem yapılmaz)

        await duyuru.save();

        // Güncelleme sonrası kullanıcıyı duyuru detay sayfasına yönlendir
        const redirectTarget = duyuru.slug || duyuru._id;
        res.redirect(`/duyurular/${redirectTarget}`);
    } catch (err) {
        console.error("Duyuru güncelleme hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


