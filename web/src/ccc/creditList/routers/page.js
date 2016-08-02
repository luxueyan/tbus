'use strict';
module.exports = function (router) {
    var utils = require('ccc/global/js/lib/utils');

    router.get('/', function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');
        res.locals.title = '太合汇';
        res.locals.keywords = '网络投资|P2P理财|个人理财|投资理财|';
        res.locals.description =
            '理财平台为您提供了多种理财产品，每种理财产品都有不同的特点，满足您的投资需求。理财产品有：新手专享、活动专享、新能宝等。';

        //转让总金额和总笔数
        req.uest('/api/v2/creditassign/stat/total').end().then(function(r){
            console.log('====r.body')

            res.locals.total = r.body.data;
            var total = res.locals.total;
            console.log(total)
            total.totalDealAmount = utils.format.amount(1000000+total.totalDealAmount,2);
            total.totalNumber =  utils.format.amount(100+total.totalNumber,2);
            //list[i].balance = utils.format.amount(list[i].balance, 2);
            res.expose(total, 'total');
        });

        //转让成交记录
        req.uest('/api/v2/creditassign/stat/list').end().then(function(r){
            res.locals.record = r.body.data;
            var record = res.locals.record;
            res.expose(record, 'record');
        });


//        var productKey = ['XSZX', 'HDZX', 'LCZQ'];
//        res.locals.products = [];
//        req.uest('/api/v2/loan/getLoanProduct/productKey/' +
//                productKey[0])
//            .end()
//            .then(function (r) {
//                console.log("r.body======");
//                console.log(r.body);
//                res.locals.products.push(r.body);
//                req.uest(
//                        '/api/v2/loan/getLoanProduct/productKey/' +
//                        productKey[1])
//                    .end()
//                    .then(function (r) {
//                        console.log(r.body);
//                        res.locals.products.push(r.body);
//                        req.uest(
//                                '/api/v2/loan/getLoanProduct/productKey/' +
//                                productKey[2])
//                            .end()
//                            .then(function (r) {
//                                console.log(r.body);
//                                res.locals.products.push(
//                                    r.body);
//                                res.render(
//                                    'invest/list');
//                            });
//                    });
//            });
        res.render();
    });
}
