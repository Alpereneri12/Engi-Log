const router = require("express").Router();
const Visitor = require("../models/visitorModel");


router.get("/", async (req, res) => {
    try {
        //Toplam ziyaretçi sayısı
        const toplamZiyaretci = await Visitor.aggregate([
            { $group: { _id: null, total: { $sum: "$visitCount" } } }
        ]);

        const ziyaretciSayisi = toplamZiyaretci[0]?.total || 0;

        res.render("index", {
            ziyaretciSayisi
        });
    } catch (err) {
        console.error("Ana sayfa hata:", err);
        res.render("index", {
            ziyaretciSayisi: 0
        });
    }
});

module.exports = router;
