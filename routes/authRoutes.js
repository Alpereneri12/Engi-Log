const router = require("express").Router();
const authController = require("../controller/authController");
const csrf = require('csurf');


const csrfProtection = csrf({ cookie: false });


router.get("/register", csrfProtection, authController.registerForm);//burada csrf koruması ekledik
router.post("/register", csrfProtection, authController.register);


router.get("/login", csrfProtection, authController.loginForm);
router.post("/login", csrfProtection, authController.login);

router.get("/logout", authController.logout);

module.exports = router;
