module.exports = function roleGuard(...allowedRoles) {//allowedRoles bir dizi oluşturur ve rolleri tutar
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).redirect("/login");
        }

        const userRole = req.session.user.role;

        if (!allowedRoles.includes(userRole)) {//include metodu dizinin içinde burada uygun rol olup olmadığına bakar.
            return res.status(403).send("Bu işlem için yetkiniz bulunmamaktadır.");
        }
        next();
    };
};