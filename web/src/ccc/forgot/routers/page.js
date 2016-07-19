'use strict';
module.exports = function (router) {
router.get('/', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '忘记密码_太合汇平台';
    res.render();
});
}
