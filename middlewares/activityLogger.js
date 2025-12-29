const UserActivity = require('../models/userActivityModel');


module.exports = async function activityLogger(req, res, next) {
    try {
       
        if (req.method !== 'GET') return next();

      
        const sessionUser = req.session?.user;
        if (!sessionUser) return next();

        
        const userId = sessionUser.id;
        const userEmail = sessionUser.email || '';
        const userRole = sessionUser.role || '';
        const url = req.originalUrl || req.url || '';

       
        const doc = new UserActivity({
            userId,
            userEmail,
            userRole,
            visitedUrl: url,
            date: new Date()
        });

        await doc.save();

        return next();
    } catch (err) {
       
        console.error('ActivityLogger hata:', err);
        return next();
    }
};
