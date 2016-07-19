'use strict';
module.exports = function (router) {
router.get('/', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '安全保障_太合汇平台';
    res.locals.keywords = '理财指南、新手引导、新手必读、用户须知、新手帮助';
    res.locals.description = '太合汇理财平台针对新注册用户给予更高的收益和奖券激励。';
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
