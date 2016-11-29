'use strict';
module.exports = function (router) {
    var utils = require('ccc/global/js/lib/utils');

    router.get('/', function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }

        res.expose(user, 'user');

        // var productKey = ['XSZX', 'HDZX', 'LCZQ'];
        // res.locals.products = [];
        // req.uest('/api/v2/loan/getLoanProduct/productKey/' + productKey[0])
        //     .end()
        //     .then(function (r) {
        //         res.locals.products.push(r.body);
        //         req.uest('/api/v2/loan/getLoanProduct/productKey/' + productKey[1])
        //             .end()
        //             .then(function (r) {
        //                 console.log(r.body);
        //                 res.locals.products.push(r.body);
        //                 req.uest('/api/v2/loan/getLoanProduct/productKey/' + productKey[2])
        //                     .end()
        //                     .then(function (r) {
        //                         res.locals.products.push(r.body);
        //                         res.render('invest/list');
        //                     });
        //             });
        //     });

        res.render();
    });
};
