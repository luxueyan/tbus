/**
 * @file 首页数据交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

exports.loanService = {
    getLoanProof: function (requestId, next) {
        request
            .get('/api/v2/loan/request/' + requestId + '/proofs')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getCareerProof: function (userId, next) {
        request
            .get('/api/v2/user/' + userId + '/certificates/proofs')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getMyCoupon: function (amount, months, next) {
        var sendObj = {
            amount: amount,
            months: months
        };
        request('GET', '/api/v2/rebateCounpon/listUserCouponPlacement/' + CC.user.userId) //获取可用红包
            .type('form')
            .send(sendObj)
            .end()
            .then(function (r) {
                next(r.body);
            })

    },
    getMyCouponlist: function (amount, totalMonths, next) {
        var sendObj = {
            amount: amount,
            months: totalMonths
        };
        request('POST', '/api/v2/coupon/MYSELF/listCoupon')
            .type('form')
            .send(sendObj)
            .end()
            .then(function (r) {
                next(r.body);
            })
    }
};