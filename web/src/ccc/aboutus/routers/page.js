'use strict';
module.exports = function (router) {
    router.get('/', function (req,res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
                delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.title = '关于我们_自金网';
        res.render('aboutus');
    });
}
