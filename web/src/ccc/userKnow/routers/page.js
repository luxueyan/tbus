'use strict';
module.exports = function (router) {

    router.get('/', function (req, res, next) /*data, locals, params, redirect)*/ {
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
