module.exports = function authGuard(req, res, next) {
    if (!req.session || !req.session.user) {//kullanıcının oturumu olup olmadığını kontrol eder yoksa login sayfasına yönlendirme yapar.
        // Sadece GET istekleri için gidecek hedefi sakla (form POST'larını veya API çağrılarını etkileme)
        // Ayrıca login/register/logout rotalarına tekrar yönlendirmeyi engelle
        try {
            if (req.method === 'GET') {
                const path = req.originalUrl || req.url || '/';
                if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/logout')) {
                    req.session.returnTo = path;
                    // Eğer session store asenkron ise, kaydedip sonra redirect edelim
                    if (typeof req.session.save === 'function') {
                        return req.session.save((err) => {
                            if (err) console.error('session save error:', err);
                            return res.redirect('/login');
                        });
                    }
                }
            }
        } catch (e) {
            // session veya req.originalUrl yoksa sessiyon hata verirse uygulama akışını bozmayalım
            console.error('returnTo set error:', e);
        }

        return res.redirect("/login");
    }
    next();
};
