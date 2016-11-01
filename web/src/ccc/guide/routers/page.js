'use strict';
module.exports = function (router) {
router.get('/', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '汇财富-卓越金融，财富人生';
    res.locals.keywords = '太合汇、汇财富、互金交易平台、理财平台、汇利精选、汇盈理财、高端理财、财富管理';
    res.locals.description = '太合汇·汇财富是由太合汇资本倾力打造的互联网金融资产交易服务平台，专门为白领、中产精英等高潜力人群提供专业、可信赖的财富管理服务，实现财富增值。';
    res.render();
    if (user && user.idNumber) {
        delete user.idNumber;
    }

    res.expose(user, 'user');
    res.locals.carousel = req.uest(
//        '/api/v2/cms/carousel_detail')
        '/api/v2/cms/category/HOMEPAGE/name/carousel')
        .end()
        .get('body')
        .then(function(data){
            return data;
        });
    res.locals.picture = req.uest(encodeURI('/api/v2/cms/category/IMAGE/name/首页广告栏'))
        .end()
        .get('body')
        .then(function(data){
            return data;
        });
});

}
