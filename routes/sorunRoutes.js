const router = require("express").Router();
const sorunController = require("../controller/sorunController");
const upload = require("../middlewares/upload");
const authGuard = require("../middlewares/auth"); 
const csrf = require('csurf');


const csrfProtection = csrf({ cookie: false });


router.get("/", sorunController.liste);


router.get("/ekle", authGuard, csrfProtection, sorunController.ekleForm);//sorun ekleme formunu göster 


router.post(
    "/ekle",
    authGuard,
    upload.single("resim"),    
    csrfProtection,
    sorunController.ekle
);

router.get(//burada ve aşağılarda :slug kullanılmasının sebebi sorun detaya basınca ismini vermek
    "/:slug/cozum-ekle",
    authGuard,
    csrfProtection,
    sorunController.cozumEkleForm
);

router.post(
    "/:slug/cozum-ekle",
    authGuard,                 
    upload.single("resim"),
    csrfProtection,
    sorunController.cozumEkle
);

router.get("/:slug", sorunController.detay);

module.exports = router;
