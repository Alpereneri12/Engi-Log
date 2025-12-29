const User = require("../models/userModel");


exports.registerForm = (req, res) => {
    res.render("register", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '' });//csrfToken burada sadece register view'ında kullanılacak şekilde veriliyor
};


exports.register = async (req, res) => {
    try {
        const { ad, email, sifre, sifreTekrar } = req.body;

        //Zorunlu alan kontrolü
        if (!ad || !email || !sifre || !sifreTekrar) {
            return res.status(400).render("register", {
                csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
                errorMessage: "Tüm alanlar zorunludur"
            });
        }

        //Şifre ve şifre tekrar eşleşme kontrolü
        if (sifre !== sifreTekrar) {
            // Kullanıcıya hata mesajı gösteriliyor (kullanıcı dostu, teknik detay yok)
            return res.status(400).render("register", {
                csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
                errorMessage: "Şifreler eşleşmiyor. Lütfen kontrol ediniz."
            });
        }

        
        const existing = await User.findOne({ email });
        if (existing) {
            //Kullanıcıya hata mesajı gösteriliyor (kullanıcı dostu, teknik detay yok)
            return res.status(400).render("register", {
                csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '',
                errorMessage: "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin."
            });
        }

        await User.create({
            ad,
            email,
            sifre, 
            role: "user"
        });

        res.redirect("/login");
    } catch (err) {
        console.error("Register hata:", err);
        res.status(500).send("Sunucu hatası");
    }
};


exports.loginForm = (req, res) => {
    res.render("login", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '' });
};


exports.login = async (req, res) => {
    try {
        const { email, sifre } = req.body;
       
        if (!email || !sifre) {
            
            return res.status(400).render("login", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '', error: "Tüm alanlar zorunludur" });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
          
            return res.status(400).render("login", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '', error: "Bu e-posta adresi kayıtlı değil" });
        }

       
        if (user.sifre !== sifre) {
            return res.status(400).render("login", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '', error: "Şifre hatalı" });
        }


        req.session.user = {
            id: user._id,
            ad: user.ad,
            email: user.email,
            role: user.role
        };

        // Eğer önceden saklanmış bir hedef URL varsa oraya yönlendir ve sonra temizle
        try {
            const redirectTo = req.session.returnTo || '/';
            // Temizle: tek kullanımlık hedef
            if (req.session.returnTo) delete req.session.returnTo;
            return res.redirect(redirectTo);
        } catch (e) {
            console.error('Redirect after login error:', e);
            return res.redirect('/');
        }
    } catch (err) {
        // Hata detaylarını sunucuda logla ancak kullanıcıya teknik bilgi gösterme
        console.error("Login hata:", err);
        return res.status(500).render("login", { csrfToken: typeof req.csrfToken === 'function' ? req.csrfToken() : '', error: "Sunucu hatası, lütfen daha sonra tekrar deneyin." });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};
