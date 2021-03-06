'use strict';
module.exports = function (router) {
    router.get('/', function (req, res) {
        var user = res.locals.user;
        res.expose(user, 'user');
        res.render();
        if (user && user.idNumber) {
            delete user.idNumber;
        }
    });
};
