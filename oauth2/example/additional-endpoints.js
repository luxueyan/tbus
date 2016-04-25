'use strict';
module.exports = function (router, auth) {
    router.get('/additional', auth.pass());
};
