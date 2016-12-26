'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');

        res.locals.title = '高端理财-固定收益-定期理财-汇财富';
        res.locals.keywords = '高端理财，高收益理财产品，定期，汇鑫理财';
        res.locals.description = '高端理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

        res.locals.bottomAd = await req.uest('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财列表页广告栏'))
            .end()
            .get('body').then(function (data) {
                return data;
            });
        res.render('index');
    });

    router.get('/list/:key', function (req, res, next) {
        if (req.params.key == 'GDLC') {
            res.expose('GDLC', 'key');
            res.locals.key = 'GDLC';
            res.locals.title = '高端理财-固定收益-定期理财-汇财富';
            res.locals.keywords = '高端理财，高收益理财产品，定期，汇鑫理财';
            res.locals.description = '高端理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';
        }
        res.render('list');
    });

    router.get('/list', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');

        res.locals.title = '高端理财-固定收益-定期理财-汇财富';
        res.locals.keywords = '高端理财，高收益理财产品，定期，汇鑫理财';
        res.locals.description = '高端理财专注于固定收益理财产品，包括世界500强，优质上市公司和信用评级AA+以上等优质资产，帮助投资投者获得低风险的稳定收益。';

        res.locals.bottomAd = await req.uest('/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财历史页广告栏'))
            .end()
            .get('body').then(function (data) {
                return data;
            });
        res.render('list');
    });
};
