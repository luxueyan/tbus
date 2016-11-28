'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');

        res.locals.bottomAd = await req.uest('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财列表页广告栏'))
            .end()
            .get('body').then(function (data) {
                return data;
            });
        res.render('index');
    });

    router.get('/list/:key', function (req, res, next) {
        if (req.params.key == 'GDSY') {
            res.expose('GDSY', 'key');
            res.locals.key = 'GDSY';
        } else if (req.params.key == 'FDSY') {
            res.expose('FDSY', 'key');
            res.locals.key = 'FDSY';
        }
        res.render('list');
    });

    router.get('/list', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.bottomAd = await req.uest('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财历史页广告栏'))
            .end()
            .get('body').then(function (data) {
                return data;
            });
        res.render('list');
    });
};