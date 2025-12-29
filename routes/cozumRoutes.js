const router = require("express").Router();


router.get("/ekle", (req, res) => {
    res.render("cozum-ekle");
});

module.exports = router;
