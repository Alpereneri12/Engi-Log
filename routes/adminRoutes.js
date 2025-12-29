const router = require("express").Router();
const authGuard = require("../middlewares/auth");
const roleGuard = require("../middlewares/roleGuard");
const adminController = require("../controller/adminController");
const upload = require("../middlewares/upload");
const csrf = require('csurf');


const csrfProtection = csrf({ cookie: false });

router.get("/", authGuard, roleGuard("admin"), csrfProtection, adminController.panel);//burada admin paneli gösterilir


router.post("/duyuru-ekle", authGuard, roleGuard("admin"), upload.single('resim'), csrfProtection, adminController.duyuruEkle);


router.post("/sorun/:id/sil", authGuard, roleGuard("admin"), csrfProtection, adminController.sorunSil);//burada sadece sorunu adminin sildiğini roleGuard ile kontrol ediyoruz


router.post("/cozum/:id/sil", authGuard, roleGuard("admin"), csrfProtection, adminController.cozumSil);


router.post("/duyuru/:id/sil", authGuard, roleGuard("admin"), csrfProtection, adminController.duyuruSil);


router.post("/kullanici/:id/rol", authGuard, roleGuard("admin"), csrfProtection, adminController.kullaniciRolGuncelle);


router.post("/kullanici/:id/uzman-yap", authGuard, roleGuard("admin"), csrfProtection, adminController.uzmanYap);


router.post("/kullanici/:id/uzman-kaldir", authGuard, roleGuard("admin"), csrfProtection, adminController.uzmanKaldir);

module.exports = router;