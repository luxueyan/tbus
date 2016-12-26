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

        res.locals.title = '我的理财-固定收益-定期理财-汇财富';
        res.locals.keywords = '固定收益,银行理财,定期理财,汇利精选';
        res.locals.description = '汇财富-我的理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

        res.render('index');
    });

    router.get('/list/:key', function (req, res, next) {
        if (req.params.key == 'GDSY') {
            res.expose('GDSY', 'key');
            res.locals.key = 'GDSY';

            res.locals.title = '我的理财-固定收益-定期理财-汇财富';
            res.locals.keywords = '固定收益,银行理财,定期理财,汇利精选';
            res.locals.description = '汇财富-我的理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

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

        res.locals.title = '我的理财-固定收益-定期理财-汇财富';
        res.locals.keywords = '固定收益,银行理财,定期理财,汇利精选';
        res.locals.description = '汇财富-我的理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

        res.render('list');
    });
};