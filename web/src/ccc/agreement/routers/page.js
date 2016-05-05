'use strict';
module.exports = function (router) {

    router.get('/:param', function (req, res, next) {
        var param = req.params.param;

        var tabMap = {
            regist: '用户注册协议',
            assignInvest: '债权转让协议',
            noviceInvest: '新手专享协议',
            employeeInvest: '员工专享协议',
            net: '网络交易资金存管协议'
        };

        if (!tabMap[param]) {
            return next();
        }

        res.locals.contents = req.uest('/api/v2/cms/category/DECLARATION/name/'+encodeURIComponent(tabMap[param])).end().get('body').then(function (r) {
            var contents= r.length > 0 ? r : null;
            return contents;
        });
        res.render('index');
    });



    router.get('/mobile/:param', function (req, res, next) {
        var param = req.params.param;
        var cateMap = {
            regist:'DECLARATION',
           protocolltb:'DECLARATION',
           protocollxy:'DECLARATION',
           protocol:'DECLARATION',
           protocolxnb:'DECLARATION',
        };

        var tabMap = {
            regist: '华瑞金控用户注册协议',
           protocolltb: '新抵宝用户投资服务协议',
           protocollxy: '薪金宝用户投资服务协议',
           protocol:'用户投资服务协议',
           protocolxnb: '新能宝用户投资服务协议',
        };

        res.locals.contents = req.uest('/api/v2/cms/category/DECLARATION/name/'+encodeURIComponent(tabMap[param])).end().get('body').then(function (r) {
            var contents= r.length > 0 ? r : null;
            return contents;
        });
        res.render('mobile/' + param);
    });

};
