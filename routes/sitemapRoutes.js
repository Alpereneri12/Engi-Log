const router = require("express").Router();
const sitemapController = require("../controller/sitemapController");

router.get("/sitemap.xml", sitemapController.generateSitemap);
// GET /sitemap.xml → sitemapController.generateSitemap fonksiyonunu çağır

module.exports = router;
// Router'ı export et (app.js'de kullanılacak)