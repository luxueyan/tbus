'use strict';
module.exports = function (router) {
router.get('/applyloan', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '我要借款_自金网平台';
    res.locals.keywords = '安徽贷款|安徽网上贷款|安徽企业贷款|奇乐融网络贷款|';
    res.locals.description = '安徽借款上奇乐融，专注于中小企业贷款、安徽网上借款、债券转让等，专业的贷款服务，最快1天放款，快速帮您解决难题。';
    res.render('applyloan');
});
   
}
