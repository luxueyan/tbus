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
                .get('/api/v2/loans/getLoanWithPage?recommedInFront=true' + params )
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
    getProductKey: function (next, params) {
        request
            .get('/api/v2/loan/getLoanProduct/productKey/' + params)
            .end()
            .then(function (res) {
                next(res.body);
            });
    },
    getSummaryData2: function (next) {
        request.get('/api/web/index/loans').then(function (res) {
            next(res.body);
        });
    },
    getProductHot: function (next) {
        this.getSummaryData2(function (res) {
            next(parseLoanList2(res));
        });
    },
    getstatusNum: function (next) {
    request
        .get('/api/v2/loan/summaryTotal')
        .end()
        .then(function (res) {
            next(res.body);
        });
    },

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


function parseLoanList2(loans) {
    var loanList = [];

    for (var p in loans) {
        addItem(loans[p]);
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
        item.deductionRate = item.loanRequest.deductionRate / 100;
        item.basicRate = item.rate - item.deductionRate;
        item.investPercent = parseInt(item.investPercent * 100, 10);

        //格式化期限
        if (item.duration.days > 0) {
            if (typeof item.duration.totalDays === "undefined") {
                item.fduration = item.duration.days;
            } else {
                item.fduration = item.duration.totalDays;
            }
            item.fdurunit = "天";
        } else {
            item.fduration = item.duration.totalMonths;
            item.fdurunit = "个月";
        }
        if (item.balance >= 10000) {
            item.amountUnit = '万';
            item.balance = (item.balance / 10000);
        } else {
            item.amountUnit = '元';
        }
        if (item.loanRequest.investRule.minAmount >= 10000) {
            item.minAmountUnit = '万';
            item.minAmount = (item.loanRequest.investRule.minAmount / 10000);
        } else {
            item.minAmount = item.loanRequest.investRule.minAmount;
            item.minAmountUnit = '元';
        }
        if (item.status === "OPENED") {
            item.leftTime = formateLeftTime(item.timeLeft);
            item.open = true;
        } else if (item.status === "SCHEDULED") {
            item.scheduled = true;
        } else {
            item.finished = true;
        }
        //格式化序列号
        if (item.providerProjectCode) {
            if (item.providerProjectCode.indexOf('#') > 0) {
                var hh_project_code = item.providerProjectCode.split('#');
                item.fProjectType = hh_project_code[0];
                item.fProjectCode = hh_project_code[1];
            } else {
                item.fProjectType = '';
                item.fProjectCode = item.providerProjectCode;
            }
        }
        return item;
    }
    return loanList;
}


function formateLeftTime(leftTime) {
    var diffmin = leftTime / 1000 / 60;
    var str = "";
    if (diffmin > 0) {
        var _day = Math.ceil(diffmin / 60 / 24);
        if (_day > 1) {
            str = _day + "天";
        } else {
            var _hour = Math.ceil(diffmin / 60);
            if (_hour > 1) {
                str = _hour + "小时";
            } else {
                str = Math.ceil(diffmin) + "分";
            }
        }
    } else {
        var sec = Math.ceil(leftTime / 1000);
        str = sec + "秒";
    }
    return str;
}
