'use strict';
exports.sayHello = function (req, res, next) {
    res.locals.name = 'CCFE';
    console.log('hhh');
    next();
};