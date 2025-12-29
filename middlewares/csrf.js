const csrf = require("csurf");

const csrfProtection = csrf({ cookie: false, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] });//CSRF token doğrulama kısmı


module.exports = (req, res, next) => {
    
    csrfProtection(req, res, (err) => {
        if (err) return next(err);

    
        try {
            if (typeof req.csrfToken === 'function') {
                res.locals.csrfToken = req.csrfToken();
            }
        } catch (e) {
            console.error('CSRF token generation failed:', e);
            res.locals.csrfToken = '';
        }
        next();
    });
};
