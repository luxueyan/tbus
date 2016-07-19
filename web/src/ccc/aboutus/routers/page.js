'use strict';
module.exports = function (router) {
    router.get('/', function (req,res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
                delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.CMSggtd = req.uest(
            '/api/v2/cms/category/INTRODUCTION/name/' + encodeURIComponent('高管团队'))
            .end()
            .get('body')
            .then(function (data) {
            console.log("_____data")
            console.log(data)
                return data;
            });
        res.locals.title = '关于我们_太合汇平台';
        res.render('aboutus');
    });
}
