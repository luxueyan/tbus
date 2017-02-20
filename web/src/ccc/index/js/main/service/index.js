/**
 * @file 首页数据交互逻辑
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';

var utils = require('ccc/global/js/lib/utils');

exports.IndexService = {
    getSummaryData: function (next) {
        request.get('/api/web/index/loans').then(function (res) {
            next(res.body);
        });
    },
    getLoanSummary: function (next) {
        this.getSummaryData(function (res) {
            next(parseLoanList(res));
        });
    },
    getLoansForHomePage: function (next) {
        request.get('/api/v2/loans/getLoansForHomePage').then(function (res) {
            next(res.body);
        });
    },
    // getLatestScheduled: function (next) {
    //     this.getSummaryData(function (res) {
    //         var list = [];
    //         for(var p in res){
    //             for(var i=0; i<res[p].length; i++){
    //                 if(res[p].status == 'SCHEDULED'){
    //                     list.push(res[p][i]);
    //                 }
    //             }
    //         }
    //         if (list) {
    //             var scheduled = list;
    //             if (scheduled.length) {
    //                 for (var i = 0; i < scheduled.length; i++) {
    //                     for (var j = i + 1; j < scheduled.length; j++) {
    //                         if (scheduled[j].timeOpen <
    //                             scheduled[i].timeOpen) {
    //                             var temp = scheduled[i];
    //                             scheduled[i] = scheduled[j];
    //                             scheduled[j] = temp;
    //                         }
    //                     }
    //                 }
    //                 next(scheduled[0]);
    //             }
    //         }
    //     });
    // },
};

function parseLoanList(loans) {
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

        var SinvestPercent = (item.investPercent * 100) + '';
        var SinvestPercentString = SinvestPercent.split('.');

        if (SinvestPercentString[1]) {
            if (SinvestPercentString[1].substr(0, 2) == '00') {
                item.investPercent = SinvestPercentString[0];
            } else if (SinvestPercentString[1].substr(1, 1) == '0' || SinvestPercentString[1].substr(1, 1) == '') {
                item.investPercent = (item.investPercent * 100).toFixed(1);
            } else {
                item.investPercent = (item.investPercent * 100).toFixed(2);
            }
        } else {
            item.investPercent = (item.investPercent * 100);
        }
        item.Fbalance = utils.format.amount(item.balance, 2);

        //格式化期限
        if (item.loanRequest.displayDuration) {
            var durationNew = item.loanRequest.displayDuration.frontShowDuration;
            var reg1 = /(\d{1,3})+(?:\.\d+)?/g;
            var reg2 = /[\u4e00-\u9fa5]{1,}/g;
            item.durationNewNo = durationNew.match(reg1)[0];
            item.durationNewName = durationNew.match(reg2)[0];
        }

        if (item.amount >= 10000) {
            item.TamountUnit = '万';
            item.amount = (item.amount / 10000);
        } else {
            item.TamountUnit = '元';
        }

        if (item.balance >= 10000) {
            item.amountUnit = '万';
            item.balance = (item.balance / 10000);
        } else {
            item.amountUnit = '元';
        }

        item.FminAmount = utils.format.amount(item.loanRequest.investRule.minAmount);

        if (item.loanRequest.investRule.minAmount >= 10000) {
            item.minAmountUnit = '万元';
            item.minAmount = utils.format.amount((item.loanRequest.investRule.minAmount / 10000));
        } else {
            item.minAmount = utils.format.amount(item.loanRequest.investRule.minAmount);
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




