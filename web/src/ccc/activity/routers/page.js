'use strict';
module.exports = function (router) {
router.get('/', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '汇财富-卓越金融，财富人生';
    res.render('activity');
});
}
