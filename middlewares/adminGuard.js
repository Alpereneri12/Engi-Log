module.exports = function adminGuard(req, res, next) {
    // Önce giriş kontrolü
    if (!req.session || !req.session.user) {
        return res.status(401).redirect("/login");//401 yetkisiz giriş 
    }

    // Admin kontrolü
    if (req.session.user.role !== "admin") {
        return res.status(403).send("Bu işlem için admin yetkisi gereklidir.");//403 yasaklanmış erişim 
    }

    next();
};




