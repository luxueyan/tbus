'use strict';
module.exports = function (router) {

    router.get('/:param', function (req, res, next) {
        var param = req.params.param;
        console.log('*************');
        console.log(param);
        var tabMap = {
            regist: '网站注册协议',
            protocol:'服务协议',
            assign: '金融资产转让协议',
            risk:'风险提示书',
            pay:'支付服务协议',
            assignBuy:'转让方购买金融资产时签署的购买协议',
            protocolBuy:'产品购买协议',
        };

        if (!tabMap[param]) {
            return next();
        }

        res.locals.contents = req.uest('/api/v2/cms/category/DECLARATION/name/'+encodeURIComponent(tabMap[param]))
            .end()
            .get('body')
            .then(function (r) {
                var contents= r.length > 0 ? r : null;
                return contents;
            });
        res.render();
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
