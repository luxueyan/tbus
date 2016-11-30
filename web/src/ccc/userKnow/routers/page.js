'use strict';
module.exports = function (router) {
    router.get('/', async function (req, res, next) {
        res.locals.contents = await req.data.articles('category/OTHER', 'name/用户须知');
        res.render()
    });
};
