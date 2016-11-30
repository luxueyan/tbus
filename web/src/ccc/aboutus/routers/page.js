'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.CMSggtd = await req.uest('/api/v2/cms/category/INTRODUCTION/name/' + encodeURIComponent('高管团队'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });
        res.render('aboutus');
    });
};
