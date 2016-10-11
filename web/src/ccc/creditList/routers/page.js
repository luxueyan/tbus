'use strict';
module.exports = function (router) {
    var utils = require('ccc/global/js/lib/utils');

    router.get('/', function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');
        res.locals.title = '汇财富';
        res.locals.keywords = '太合汇、汇财富、互金交易平台、理财平台、汇利精选、汇盈理财、高端理财、财富管理';
        res.locals.description =
            '太合汇·汇财富是由太合汇资本倾力打造的互联网金融资产交易服务平台，专门为白领、中产精英等高潜力人群提供专业、可信赖的财富管理服务，实现财富增值。';


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
