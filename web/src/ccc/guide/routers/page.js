'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res) {
        var user = res.locals.user;
        res.expose(user, 'user');

        res.render();

        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');

        res.locals.carousel = await req.uest('/api/v2/cms/category/HOMEPAGE/name/carousel')
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });

        res.locals.picture = await req.uest(encodeURI('/api/v2/cms/category/IMAGE/name/首页广告栏'))
            .end()
            .get('body')
            .then(function (data) {
                return data;
            });
    });

};
