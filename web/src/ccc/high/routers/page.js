'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.title = '太合汇';
        res.locals.keywords = '理财产品、投资、理财投资、个人理财、理财新品、活动专享、新手专享';
        res.locals.description =
            '太合汇为您提供了多种理财产品，每种理财产品都有不同的特点，满足您的投资需求。理财产品有：新手专享、活动专享、新能宝等。';

        res.locals.bottomAd = req.uest(
            '/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财列表页广告栏'))
            .end()
            .get('body').then( function(data) {
                return data;
            });
        res.render('index');
    });
    
        
    router.get('/list/:key',function(req,res,next){
        if(req.params.key == 'GDLC'){
            res.expose('GDLC','key');
            res.locals.key = 'GDLC';
        }
        res.render('list');
    })


    router.get('/list', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.title = '太合汇';
        res.locals.keywords = '理财产品、投资、理财投资、个人理财、理财新品、活动专享、新手专享';
        res.locals.description =
            '太合汇为您提供了多种理财产品，每种理财产品都有不同的特点，满足您的投资需求。理财产品有：新手专享、活动专享、新能宝等。';

        res.locals.bottomAd = req.uest(
            '/api/v2/cms/category/IMAGE/name/' + encodeURIComponent('理财历史页广告栏'))
            .end()
            .get('body').then( function(data) {
                return data;
            });
        res.render('list');
    });

}
