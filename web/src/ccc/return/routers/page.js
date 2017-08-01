'use strict';

module.exports = function (router) {
    router.get('/', function (req, res) {
        res.render('return/authenticateEmail', {
            title: '土巴士'
        });
    });
};