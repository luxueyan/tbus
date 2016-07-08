'use strict';
module.exports = function (router) {
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
