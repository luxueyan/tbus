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
        var api = '/api/v2/loan/summaryTotal';
        if(req.params.key == 'GDSY'){
            res.expose('GDSY','key');
            res.locals.key = 'GDSY';
            req.uest.get(api+'?product=GDSY')
                .end()
                .then(function(r){
                    console.log('11@@@@@@@@@@@!!!!!!!!!!!!')
                    console.log(r.body)
                    console.log('11@@@@@@@@@@@!!!!!!!!!!!!')
                    res.expose(r.body,'num');
                });


        }else if(req.params.key == 'XELC'){
            res.expose('XELC','key');
            res.locals.key = 'XELC';
            req.uest.get(api+'?product=XELC')
                .end()
                .then(function(r){
                    console.log('221@@@@@@@@@@@!!!!!!!!!!!!')
                    console.log(r.body)
                    console.log('22211@@@@@@@@@@@!!!!!!!!!!!!')
                    res.expose(r.body,'num');
                    //res.expose(res.locals.num,'num');
                });

        }
        //req.uest.get('/api/v2/loan/summaryTotal')
        //    .end()
        //    .then(function(r){
        //    console.log('@@@@@@@@@@@!!!!!!!!!!!!')
        //    console.log(r.body)
        //    console.log('@@@@@@@@@@@!!!!!!!!!!!!')
        //    res.locals.num = r.body;
        //})
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
