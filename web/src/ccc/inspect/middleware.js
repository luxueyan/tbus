'use strict';
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.expose(process.env.NODE_ENV || 'development', 'NODE_ENV');
        res.expose(process.env.NODE_APP_INSTANCE, 'NODE_APP_INSTANCE');
        next();
    });
};
