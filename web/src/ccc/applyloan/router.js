'use strict';
module.exports = function (router) {
router.get('/applyloan', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.render('applyloan');
});
   
}
