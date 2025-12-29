const router = require("express").Router();
const duyuruController = require("../controller/duyuruController");


router.get("/", duyuruController.liste);

const upload = require("../middlewares/upload");
const authGuard = require("../middlewares/auth");


router.get("/:id/guncelle", authGuard, duyuruController.guncelleForm);//duyuru güncellem formu sadece adminin görebilmesi için authGuard middleware i ekledik.
router.post(
    "/:id/guncelle",
    authGuard,
    upload.single("resim"),//resim alanını tekil olarak yüklemek için kullanılır.
    duyuruController.guncelle
);


router.get("/:slug", duyuruController.detay);

module.exports = router;
