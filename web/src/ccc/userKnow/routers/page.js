'use strict';
module.exports = function (router) {

    router.get('/', function (req, res, next) /*data, locals, params, redirect)*/ {
        res.locals.title = '汇财富-卓越金融，财富人生';
        res.locals.keywords = '太合汇、汇财富、互金交易平台、理财平台、汇利精选、汇盈理财、高端理财、财富管理';
        res.locals.description = '太合汇·汇财富是由太合汇资本倾力打造的互联网金融资产交易服务平台，专门为白领、中产精英等高潜力人群提供专业、可信赖的财富管理服务，实现财富增值。';
        // res.locals.latestOne = req.uest(encodeURI('/api/v2/cms/category/OTHER/name/用户须知'))
        // .end()
        // .get('body')
        // .then( function(data){
        //
        //       _.assign(res.locals,{contents:data});
        // });
        // req.data.articles('category/OTHER','name/用户须知').then(function(r){
        //   // res.expose(r,'contents');
        //   res.locals.contents=r;
        // });
        // res.expose(req.data.articles('category/OTHER','name/用户须知'),'contents');
        res.locals.contents=req.data.articles('category/OTHER','name/用户须知');
res.render()
    });

};
