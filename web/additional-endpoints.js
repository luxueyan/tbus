'use strict';
module.exports = function (router, auth) {
    router.get('/api/v2/user/:userId/paymentPasswordHasSet', auth.owner());
};
