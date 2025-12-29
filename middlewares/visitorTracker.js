const Visitor = require("../models/visitorModel");


module.exports = async (req, res, next) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';//burada ip adresini alıyoruz
        
        if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {//localhost ip adreslerini saymıyoruz
            return next();
        }

        const cleanIp = ip.replace('::ffff:', '');//ıpv6 yı ıpv4 e çeviriyoruz çünkü mongodb de kayıtlar ıpv4 formatında tutuluyor

        let visitor = await Visitor.findOne({ ip: cleanIp });//veritabanında ilgili ip ye ait kayıt var mı diye kontrol ediyoruz.

        if (!visitor) {
            visitor = await Visitor.create({
                ip: cleanIp,
                lastVisit: new Date(), 
                visitCount: 1 
            });
            return next();
        }


        const now = new Date();
        const lastVisitTime = new Date(visitor.lastVisit); 
        
        
        const twoHoursInMs = 2 * 60 * 60 * 1000;//2 saat
        
       
        const timeDifference = now - lastVisitTime;

        if (timeDifference >= twoHoursInMs) {
            visitor.visitCount += 1;        
            visitor.lastVisit = now;        
            await visitor.save();           
        }

        next();
    } catch (err) {
        console.error("Ziyaretçi takip hatası:", err);
        next();
    }
};