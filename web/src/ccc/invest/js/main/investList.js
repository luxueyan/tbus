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
    //minDuration: 0,
    //maxDuration: 100,
    //minRate: 0,
    //maxRate: 100,
    currentPage: 1,
    //minAmount: 0,
    //maxAmount: 100000000,
    //minInvestAmount: 1,
    //maxInvestAmount: 100000000,
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
    //if (item.investPercent * 100 > 0 && item.investPercent * 100 < 1) {
    //    item.investPercent = 1;
    //} else {
    //    item.investPercent = parseInt(item.investPercent * 100, 10);
    //}

    //var SinvestPercent = (item.investPercent * 100).toFixed(2)+'';
    //
    //if(SinvestPercent.slice(-2)=='00'){
    //    item.investPercent = (item.investPercent * 100);
    //}else if(SinvestPercent.slice(-1)=='0'){
    //    item.investPercent = (item.investPercent * 100).toFixed(1);
    //}else{
    //    item.investPercent = (item.investPercent * 100).toFixed(2);
    //}

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
    //console.log(list)
    for (var i = 0; i < list.length; i++) {
        list[i] = formatItem(list[i]);
        var method = list[i].method;
        var methodFmt = i18n.enums.RepaymentMethod[method][0];
        list[i].methodFmt = methodFmt;
        list[i].titleLength = replaceStr(list[i].title);
        //list[i].FminAmount = utils.format.amount(list[i].loanRequest.investRule.minAmount, 2);
        if (list[i].loanRequest.investRule.minAmount < 10000) {
            list[i].FminAmount = list[i].loanRequest.investRule.minAmount;
            list[i].FminUnit = "元";
        } else {
            list[i].FminAmount = (list[i].loanRequest.investRule.minAmount / 10000);
            list[i].FminUnit = "万元";
        }
        list[i].balance = utils.format.amount(list[i].balance, 2);
        list[i].investPercent = utils.format.amount(list[i].investPercent, 1);
    }
    return list;
}

function replaceStr(str) {
    return str.replace(/[^\x00-xff]/g, 'xx').length;
}


IndexService.getLoanSummary(function (res) {
    //parseLoanList(res)
    var listFixed = [], listFloat = [];
    var productKey = [];    //推荐产品放在第一位      CPTJ
    for (var i = 0; i < res.length; i++) {
        if (res[i].loanRequest.productKey == "CPTJ") {
            productKey.push(res[i]);
        } else if (res[i].loanRequest.productKey == 'GDSY') {
            listFixed.push(res[i]);
        } else if (res[i].loanRequest.productKey == 'FDSY') {
            listFloat.push(res[i]);
        }
    }
    //console.log("1111")
    //console.log(listFixed)
    //console.log(listFloat)
    //console.log("1111")
    var listOpen = [];     //在售中  OPENED
    var listNone = [];     //计息中  SETTLED
    var listSchedul = [];  //即将发布  SCHEDULED
    var listFinish = [];     //已售罄 FINISHED
    var liststatus = [];   //放排序后的产品 ： 在售中》即将发布》已售罄》计息中

    var compare = function (obj1, obj2) {
        var val1 = obj1.timeOpen;
        var val2 = obj2.timeOpen;
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }

    productKey.sort(compare);

    if (productKey[0]) {
        liststatus = liststatus.concat(productKey.shift());
    }

    for (var i = 0; i < productKey.length; i++) {
        if (productKey[i].status == "OPENED") {
            listOpen.push(productKey[i]);
        } else if (productKey[i].status == "SCHEDULED") {
            listSchedul.push(productKey[i]);
        } else if (productKey[i].status == "FINISHED") {
            listFinish.push(productKey[i]);
        } else if (productKey[i].status == "SETTLED") {
            listNone.push(productKey[i]);
        }

    }


    for (var i = 0; i < listFixed.length; i++) {
        if (listFixed[i].status == "OPENED") {
            listOpen.push(listFixed[i]);
        } else if (listFixed[i].status == "SCHEDULED") {
            listSchedul.push(listFixed[i]);
        } else if (listFixed[i].status == "FINISHED") {
            listFinish.push(listFixed[i]);
        } else if (listFixed[i].status == "SETTLED") {
            listNone.push(listFixed[i]);
        }

    }


    listOpen.sort(compare);
    listNone.sort(compare);
    listSchedul.sort(compare);
    listFinish.sort(compare);

    console.log(listOpen);
    console.log(listOpen);
    liststatus = liststatus.concat(listOpen);
    liststatus = liststatus.concat(listSchedul);
    liststatus = liststatus.concat(listFinish);
    liststatus = liststatus.concat(listNone);
    //console.log("@@@@");
    //console.log(liststatus);
    //console.log("@@@@");
    // 固定收益
    var listRactive = new Ractive({
        el: ".fixedPro",
        template: require('ccc/invest/partials/fixedPro.html'),
        data: {
            list: liststatus.slice(0, 5),
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        },
        onrender: function () {
            //var self = this;
            //if(listOpen.length){
            //    self.set('list',listOpen.slice(0, 5));
            //}else{
            //    self.set('list',listNone.slice(0, 5));
            //};

            $('.assign_time').mouseover(function () {
                $(this).parent().parent().parent().siblings('.assign_tip').fadeIn(200);
            })
            $('.assign_tip').mouseleave(function () {
                $(this).fadeOut(200);
            })
        }
    });
    // 浮动收益
    var listRactive = new Ractive({
        el: ".floatPro",
        template: require('ccc/invest/partials/floatPro.html'),
        data: {
            list: (listFloat.slice(0, 1)),
            RepaymentMethod: i18n.enums.RepaymentMethod // 还款方式
        }
    });
    ininconut();
});


if (CC.key) {
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
            var api = '/api/v2/loan/summaryTotal?recommedInFront=true&product=';
            request.get(api + key + '&product=CPTJ')
                .end()
                .then(function (r) {
                    that.set('num', r.body);

                });

            if (status == "OPENED" || status == "SETTLED" || status == "CLEARED") {
                Boolean = "false";
                console.log(Boolean)
            } else {
                Boolean = "true";
            }
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
            };

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
                currentPage = current - 1;
                if (current > 1) {
                    current -= 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender();
                }
                location.href = "#href"

            });
            pagerRactive.on('next', function (e) {
                e.original.preventDefault();
                var current = this.get('current');
                currentPage = current + 1;
                if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                    current += 1;
                    this.set('current', current);
                    params.currentPage = current;
                    obj.onrender();
                }
                location.href = "#href"
            });
            pagerRactive.on('page', function (e, page) {
                e.original.preventDefault();
                if (page) {
                    currentPage = page;
                } else {
                    currentPage = e.context;
                }
                this.set('current', currentPage);
                params.currentPage = currentPage;
                obj.onrender();
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
