'use strict';
module.exports = function (router) {
router.get('/applyloan', function (req,res) {
    var user = res.locals.user;
    res.expose(user, 'user');
    res.locals.title = '汇财富-卓越金融，财富人生';
    res.locals.keywords = '太合汇、汇财富、互金交易平台、理财平台、汇利精选、汇盈理财、高端理财、财富管理';
    res.locals.description = '太合汇·汇财富是由太合汇资本倾力打造的互联网金融资产交易服务平台，专门为白领、中产精英等高潜力人群提供专业、可信赖的财富管理服务，实现财富增值。';
    res.render('applyloan');
});
   
}
