/*jshint multistr: true */

"use strict";

var i18n = require('@ds/i18n')['zh-cn'];

var InvestListService = require('ccc/invest/js/main/service/list').InvestListService;
var IndexService = require('ccc/index/js/main/service/index').IndexService;
var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/jquery.easy-pie-chart.js')
require('ccc/global/js/jquery.page.js');
var params = {
    pageSize: 8,
    status: '',
    currentPage: 1,
};

function jsonToParams(params) {
    var str = '';
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            str += '&' + key + '=' + params[key];
        }
    }
    return str;
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

function formatItem(item) {
    var purposeMap = {
        "SHORTTERM": "短期周转",
        "PERSONAL": "个人信贷",
        "INVESTMENT": "投资创业",
        "CAR": "车辆融资",
        "HOUSE": "房产融资",
        "CORPORATION": "企业融资",
        "OTHER": "其它借款"
    };

    item.rate = item.rate / 100;
    item.deductionRate = item.loanRequest.deductionRate / 100;
    item.basicRate = item.rate - item.deductionRate;
    item.purpose = purposeMap[item.purpose];

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

    if (item.status === 'FINISHED' || item.status === 'FAKESETTLED' || item.status === 'FAILED') {
        item.investPercent = 100;
    }


    if (item.loanRequest.displayDuration) {
        var durationNew = item.loanRequest.displayDuration.frontShowDuration;
        var reg1 = /(\d{1,3})+(?:\.\d+)?/g;
        var reg2 = /[\u4e00-\u9fa5]{1,}/g;
        item.durationNewNo = durationNew.match(reg1)[0];
        item.durationNewName = durationNew.match(reg2)[0];
    }

    if (item.amount >= 10000) {
        item.amountUnit = '万';
        item.amount = (item.amount / 10000);
    } else {
        item.amountUnit = '元';
    }

    if (item.status == "OPENED") {
        item.leftTime = formateLeftTime(item.timeLeft);
        item.open = true;
    } else if (item.status == "SCHEDULED") {
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

function parseLoanList(list) {
    for (var i = 0; i < list.length; i++) {
        list[i] = formatItem(list[i]);
        var method = list[i].method;
        var methodFmt = i18n.enums.RepaymentMethod[method][0];
        list[i].methodFmt = methodFmt;
        list[i].titleLength = replaceStr(list[i].title);
        if (list[i].loanRequest.investRule.minAmount < 10000) {
            list[i].FminAmount = list[i].loanRequest.investRule.minAmount;
            list[i].FminUnit = "元";
        } else {
            list[i].FminAmount = (list[i].loanRequest.investRule.minAmount / 10000);
            list[i].FminUnit = "万元";
        }
        list[i].Fbalance = utils.format.amount(list[i].balance, 2);
        list[i].investPercent = utils.format.amount(list[i].investPercent, 1);
    }
    return list;
}

function formatItemNew(item) {
    item.rate = item.rate / 100;
    item.Fbalance = utils.format.amount(item.balance, 2);
    //格式化期限
    if (item.loanRequest.displayDuration) {
        var durationNew = item.loanRequest.displayDuration.frontShowDuration;
        var reg1 = /(\d{1,3})+(?:\.\d+)?/g;
        var reg2 = /[\u4e00-\u9fa5]{1,}/g;
        item.durationNewNo = durationNew.match(reg1)[0];
        item.durationNewName = durationNew.match(reg2)[0];
    }

    item.FminAmount = utils.format.amount(item.loanRequest.investRule.minAmount);
    if (item.loanRequest.investRule.minAmount >= 10000) {
        item.FminAmount = utils.format.amount((item.loanRequest.investRule.minAmount / 10000));
        item.FminUnit = '万元';
    } else {
        item.FminAmount = utils.format.amount(item.loanRequest.investRule.minAmount);
        item.FminUnit = '元';
    }
    return item;
}

function replaceStr(str) {
    return str.replace(/[^\x00-xff]/g, 'xx').length;
}

if (!CC.key) {
    // 新手标
    var listNewRactive = new Ractive({
        el: ".fixedProNew",
        template: require('ccc/invest/partials/fixedPro.html'),
        oncomplete: function () {
            IndexService.getLoansForHomePage(function (res) {
                listNewRactive.set('list', formatItemNew(res['NEW']));
            });
            $('.assign_time').mouseover(function () {
                $(this).parent().parent().parent().siblings('.assign_tip').fadeIn(200);
            });
            $('.assign_tip').mouseleave(function () {
                $(this).fadeOut(200);
            })
        }
    });

    // 固定收益
    var listRactive = new Ractive({
        el: ".fixedPro",
        template: require('ccc/invest/partials/fixedPro.html'),
        oncomplete: function () {
            var paramsGD = {
                status: '',
                pageSize: 5,
                currentPage: 1,
                product: 'GDSY',
            };
            InvestListService.getLoanListWithCondition(jsonToParams(paramsGD), 'true', function (res) {
                var listALL = [];
                for (var i = 0; i < res.results.length; i++) {
                    if (res.results[i].loanRequest.productKey !== 'NEW') {
                        listALL.push(res.results[i])
                    }
                }
                listRactive.set('list', parseLoanList(listALL.slice(0, 4)));
                ininconut();
            });

            $('.assign_time').mouseover(function () {
                $(this).parent().parent().parent().siblings('.assign_tip').fadeIn(200);
            });
            $('.assign_tip').mouseleave(function () {
                $(this).fadeOut(200);
            })
        }
    });

} else {
    params.product = CC.key;
    var investRactive = new Ractive({
        el: ".list_box",
        template: require('ccc/invest/partials/list.html'),
        data: {
            list: [],
            RepaymentMethod: i18n.enums.RepaymentMethod, // 还款方式
            user: CC.user,
            key: CC.key
        },
        onrender: function (status) {
            var that = this;
            var key = that.get('key');
            var Boolean = "true";
            if (status == "OPENED" || status == "SETTLED" || status == "CLEARED") {
                Boolean = "false";
            } else {
                Boolean = "true";
            }
            var api = '/api/v2/loan/summaryTotal?recommedInFront=' + Boolean + '&product=';
            request.get(api + key + '&product=CPTJ')
                .end()
                .then(function (r) {
                    that.set('num', r.body);

                });
            InvestListService.getLoanListWithCondition(jsonToParams(params), Boolean, function (res) {
                that.set('list', parseLoanList(res.results));
                that.renderPager(res, params.currentPage, that)
            });

        },
        oncomplete: function () {
            var that = this;
            //var Boolean;
            $('.sStatus li').click(function () {
                $(this).addClass("selected").siblings().removeClass("selected");
                var status = $(this).data("status");
                if (status == 'SCHEDULED') {
                    params.minDuration = 0;
                    params.maxDuration = 100;
                }
                params.status = status;
                params.currentPage = 1;

                that.onrender(status);
            });
        },
        renderPager: function (res, currentPage, obj) {
            if (!currentPage) {
                currentPage = 1;
            }

            function createList(len) {
                var arr = [];
                var i = parseInt(len / params.pageSize);
                if (len % params.pageSize > 0) {
                    i++;
                }
                for (var m = 0; m < i; m++) {
                    arr[m] = m + 1;
                }
                return arr;
            }

            var pagerRactive = new Ractive({
                el: '#invest-pager',
                template: require('ccc/invest/partials/pager.html'),
                data: {
                    totalPage: createList(res.totalSize),
                    current: currentPage
                }
            });
            pagerRactive.on('previous', function (e) {
                e.original.preventDefault();
                var current = this.get('current');
                var status = $(".selected").data("status");
                currentPage = current - 1;
                if (current > 1) {
                    current -= 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender(status);
                }
                location.href = "#href"

            });
            pagerRactive.on('next', function (e) {
                e.original.preventDefault();
                var status = $(".selected").data("status");
                var current = this.get('current');
                currentPage = current + 1;
                if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                    current += 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender(status);
                }
                location.href = "#href"
            });
            pagerRactive.on('page', function (e, page) {
                e.original.preventDefault();
                var status = $(".selected").data("status");
                if (page) {
                    currentPage = page;
                } else {
                    currentPage = e.context;
                }
                this.set('current', currentPage);
                params.currentPage = currentPage;
                obj.onrender(status);
                location.href = "#href"
            });
        },
    });

}

//剩余时间
function ininconut() {

    $(".investbtn-time").each(function () {
        var t = $(this);
        var id = t.data("id");
        var openTime = t.data("open");
        var serverDate = t.data("serv");
        var tip = t.data("status") == "SCHEDULED" ? "开始" : "结束";
        //var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
        //var textDay = leftTime.day ? leftTime.day + '天' : '';
        var interval = setInterval((function () {
            serverDate += 1000;
            var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
            //var textDay = leftTime.day ? leftTime.day + '天' : '';
            if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                clearInterval(interval);
                t.prev().hide();
                //t.replaceWith('<a href="/loan/' + id + '" style="text-decoration:none"><div class="investbtn">立即投资</div></a>');
            } else {
                t.html('<span class="text" style="color:#666">距离' + tip + '：' +
                    '<span style="color:#e4262b">' + leftTime.day + '</span>天' +
                    '<span style="color:#e4262b">' + leftTime.hour + '</span>时' +
                    '<span style="color:#e4262b">' + leftTime.min + '</span>分' +
                    '<span style="color:#e4262b">' + leftTime.sec + '</span>秒</span>')
            }
        }), 1000);
    });
};
