'use strict';
module.exports = function (router) {

    router.get('/', function (req, res, next) /*data, locals, params, redirect)*/ {
        res.locals.title = '用户须知_718金融理财平台';
        res.locals.keywords = '理财指南、新手引导、新手必读、用户须知、新手帮助、投资风险、风险控制、风控、安全保障、投资安全、安全机制';
        res.locals.description = '718金融理财平台与各大投资公司的战略合作以及多年的风险控制经验使得投资理财有了安全保障，拥有成熟完善的安全保障机制。718金融理财平台针对新注册用户给予更高的收益和奖券激励。';
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
