/**
 * @file 首页数据交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';
// var request = require('cc-superagent-promise');

exports.InvestListService = {
    getSummaryData: function (next) {
        request
            .get('/api/v2/loans/summary')
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getLoanListWithCondition: function (params, next) {
        try {
            return request
                .get('/api/v2/loans/getLoanWithPage?' + params)
                .end()
                .then(function (res) {
                    next(res.body);
                });
        } catch (e) {
            next({
                totalSize: 0,
                results: []
            });
        }
    },
    getCreditassignData: function(next) {
        request.get('/api/v2/creditassign/list').end().then(function(res){next(res.body)});
    },
//    getProductKey:function(next,params){
//         request
//            .get('/api/v2/loan/getLoanProduct/productKey/'+params)
//            .end()
//            .then(function (res) {
//                next(res.body);
//            });
//    }

};

function parseLoanList(loans) {
    var MaxOpened = 3;
    var MaxScheduled = 2;
    var MaxFinished = 1;
    var loanList = [];
    if (loans.scheduled.length <= MaxScheduled) {
        addItem(loans.scheduled);
    } else {
        addItem(loans.scheduled.slice(0, MaxScheduled));
    }
    if (loans.open.length <= MaxOpened) {
        addItem(loans.open);
    } else {
        addItem(loans.open.slice(0, MaxOpened));
    }
    if (loans.finished.length <= MaxFinished) {
        addItem(loans.finished);
    } else {
        addItem(loans.finished.slice(0, MaxFinished));
    }

    function addItem(items) {
        if (!items.length) {
            return;
        }
        for (var i = 0, l = items.length; i < l; i++) {
            loanList.push(formatItem(items[i]));
        }
    }

    function formatItem(item) {
        item.rate = item.rate / 100;
        if (item.amount > 10000) {
            item.amountUnit = '万';
            item.amount = (item.amount / 10000);
        } else {
            item.amountUnit = '元';
        }
        return item;
    }
    return loanList;
}
