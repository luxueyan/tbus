/**
 * @file 首页数据交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

function showError(error) {
    alert(error);
}

exports.loanService = {
    getLoanProof: function (requestId, next) {
        request
        //            .get('/loan/' + requestId + '/proof')
            .get('/api/v2/loan/request/' + requestId + '/proofs')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getCareerProof: function (userId, next) {
        request
            .get('/api/v2/user/' + CC.user.id + '/certificates/proofs')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    creditPay: function (userId, creditAssignId, principalAmount) {
        request.post("/api/v2/creditassign/autoAssign/MYSELF")
            .type("form")
            .send({
                userId: userId,
                creditAssignId: creditAssignId,
                principalAmount: principalAmount
            })
            .end(function (res) {
                console.log(res);
                var returnMap = {
                    'CREDIT_ASSIGN_DISABLED': "没有开启债权转让功能",
                    'NOT_FOUND': "债转不存在",
                    'SUCCESSFUL': "转让成功",
                    'PARTLY_SUCCESSFUL': "转让部分成功",
                    'ASSIGN_NOT_OPEN': "转让没有开始,或者已经结束",
                    'ASSIGN_NO_BALANCE': "转让已满",
                    'SELF_ASSIGN_FORBIDDEN': "不能承接自己的转让",
                    'BORROWER_ASSIGN_FORBIDDEN': "标的借款人不能承接转让",
                    'PARTLY_ASSIGN_FORBIDDEN': "必须全额承接",
                    'FEE_EXCEED_LIMIT': "费率超过上限",
                    'ILLEGAL_AMOUNT': "金额错误",
                    'ASSIGN_REDUNDANT': "重复的转让返回"
                };
                alert(returnMap[res]);
                window.location.href = "/invest";
            });
    },
    getMyCoupon: function (amount, months, next) {
        var sendObj = {
            amount: amount,
            months: months
        };
        request('POST', '/api/v2/coupon/MYSELF/listCoupon')
            .type('form')
            .send(sendObj)
            .end()
            .then(function (r) {
                next(r.body);
            })
    },
    sendAutoAssign: function (params, next) {
        request('POST', '/api/v2/creditassign/autoAssign/' + CC.user.id)
            .type('form')
            .send(params)
            .end()
            .then(function(r){
                next(r);
            });

    }
};
