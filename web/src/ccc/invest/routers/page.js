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
        res.locals.listPicture = req.uest(encodeURI('/api/v2/cms/category/IMAGE/name/理财列表页广告栏'))
            .end()
            .get('body')
            .then(function(data){
                return data;
            });

        //var productKey = ['XNB', 'FB', 'XJB'];
		var productKey = ['SBTZ', 'HOT','LHB','DCB','NEW'];
        res.locals.products = [];
        var productKeySBTZ=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[0]).end().get('body');
        var productKeyHOT=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[1]).end().get('body');
        var productKeyLHB=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[2]).end().get('body');
        var productKeyDCB=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[3]).end().get('body');
        var productKeyNEW=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[4]).end().get('body');
        res.locals.products.push(productKeySBTZ);
        res.locals.products.push(productKeyHOT);
        res.locals.products.push(productKeyLHB);
        res.locals.products.push(productKeyDCB);
        res.locals.products.push(productKeyNEW);
        res.expose('', 'product');
        res.render();
        return false;
    });
router.get('/:product', async function (req, res) {
        var user = res.locals.user;
        if (user && user.idNumber) {
            delete user.idNumber;
        }
        res.expose(user, 'user');
        res.locals.title = '理财_自金网平台';
        res.locals.keywords = '网络投资|P2P理财|个人理财|bank投资理财|';
        res.locals.description =
            '718bank理财平台为您提供了多种理财产品，每种理财产品都有不同的特点，满足您的投资需求。理财产品有：新手专享、活动专享、新能宝等。';

        //var productKey = ['XNB', 'FB', 'XJB'];
		var productKey = ['SBTZ', 'HOT','LHB','DCB','NEW'];
        res.locals.products = [];
        var productKeySBTZ=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[0]).end().get('body');
        var productKeyHOT=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[1]).end().get('body');
        var productKeyLHB=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[2]).end().get('body');
        var productKeyDCB=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[3]).end().get('body');
        var productKeyNEW=await req.uest('/api/v2/loan/getLoanProduct/productKey/'+productKey[4]).end().get('body');
        res.locals.products.push(productKeySBTZ);
        res.locals.products.push(productKeyHOT);
        res.locals.products.push(productKeyLHB);
        res.locals.products.push(productKeyDCB);
        res.locals.products.push(productKeyNEW);
        res.expose(req.params.product, 'product')
        res.render('index');
        return false;
    });
}
