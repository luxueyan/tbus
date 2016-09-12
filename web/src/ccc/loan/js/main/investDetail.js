"use strict";
var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CccOk = require('ccc/global/js/modules/cccOk');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
var RenderPage = require('ccc/global/js/modules/cccPageSuper');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/lib/jquery.easy-pie-chart');
require('bootstrap/js/carousel');

require('bootstrap/js/transition');
require('bootstrap/js/tooltip');

var Cal = require('ccc/global/js/modules/cccCalculator');

// cccConfirm
var Confirm = require('ccc/global/js/modules/cccConfirm');

var popupBigPic = require('ccc/loan/js/main/bigPic').popupBigPic;
var statusMap = {
    SCHEDULED: '开标时间:{{timeOpen}}',
    SETTLED: '结标时间:{{timeSettled}}',
    OPENED: '',
    FINISHED: '',
    CLEARED: ''
};
var template = statusMap[CC.loan.status];

var pagesize = 10;


new Ractive({
    el: ".openTime",
    template: template,
    data: {
        timeOpen: moment(CC.loan.timeOpen).format('YYYY-MM-DD HH:mm'),
        //        timeFinished: moment(new Date(parseInt(CC.loan.timeFinished))).format('YYYY-MM-DD HH:mm')
        timeSettled: CC.loan.timeSettled
    }
});



function initailEasyPieChart() {
    ///////////////////////////////////////////////////////////
    // 初始化饼状图
    ///////////////////////////////////////////////////////////
    $(function () {
        var oldie = /msie\s*(8|7|6)/.test(navigator.userAgent.toLowerCase());
        $(".easy-pie-chart").each(function () {
            var percentage = $(this).data("percent");
            var status = $(this).data("status");
            // 100%进度条颜色显示为背景色

            //var color = percentage != 100 && (status==='SETTLED'|| status==='CLEARED') ? "#f58220" : '#009ada';
            var color = (status === 'OPENED') ? '#ff0000' : "#ff0000";

            //            var color = percentage === 100 ? "#f58220" : '#f58220';
            $(this).easyPieChart({
                barColor: color,
                trackColor: '#ddd',
                scaleColor: false,
                lineCap: 'butt',
                lineWidth: 4,
                animate: oldie ? false : 1000,
                size: 130,
                onStep: function (from, to, percent) {
                    $(this.el).find('.percent').text(Math.round(percent));
                }
            });
            $(this).find("span.percentageNum").html(percentage + "%");
        });

    });
};

initailEasyPieChart();


$("[data-toggle=tooltip]")
    .each(function () {
        $(this)
            .tooltip({
                // 同级的 tooltip-container
                container: $(this)
                    .parent()
                    .find('.tooltip-container')
            });
    });
$('.assign_time').mouseover(function(){
    $('.assign_tip').fadeIn(200);
})
$('.assign_tip').mouseleave(function(){
    $(this).fadeOut(200);
})

setTimeout((function () {
    CC.loan.timeElapsed = utils.format.timeElapsed(CC.loan.timeElapsed);
    CC.loan.timeLeft = JSON.parse(CC.loan.timeLeft);
    var leftTime = CC.loan.timeLeft;
    var timeLeftToal = leftTime.ss + leftTime.mm * 60 + leftTime.hh * 60 * 60 + leftTime.dd * 60 * 60 * 24;
    setInterval(function () {
        timeLeftToal -= 1;
        var dd = parseInt(timeLeftToal / (60 * 60 * 24), 10),
            hh = parseInt((timeLeftToal - dd * 60 * 60 * 24) / (60 * 60), 10),
            mm = parseInt((timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60) / 60, 10),
            ss = parseInt(timeLeftToal - dd * 60 * 60 * 24 - hh * 60 * 60 - mm * 60, 10);
        var newTimeleftTotal = {
            dd: dd,
            hh: hh,
            mm: mm,
            ss: ss
        }
        var days = newTimeleftTotal.dd ? '<i>' + newTimeleftTotal.dd + '</i>日' : '';
        $('.time>span').html(days + '<i>' + newTimeleftTotal.hh + '</i>时<i>' + newTimeleftTotal.mm + '</i>分<i>' + newTimeleftTotal.ss + '</i>秒');
    }, 1000)
    //获取最后还款日期
    if (CC.repayments instanceof Array && CC.repayments.length > 0) {
        CC.loan.lastRepaymentsDate = CC.repayments[0].dueDate;
        for (var i = 0; i < CC.repayments.length; i++) {
            if (CC.loan.lastRepaymentsDate < CC.repayments[i].dueDate) {
                CC.loan.lastRepaymentsDate = CC.repayments[i].dueDate;
            }
        }
        ;
    }

    var investRactive = new Ractive({
        el: ".do-invest-wrapper",
        template: require('ccc/loan/partials/doInvestOnDetail.html'),
        data: {
            name: '',
            user: CC.user,
            loan: CC.loan,
            rate: utils.format.percent(CC.loan.investPercent *
                100, 2),
            errors: {
                visible: false,
                msg: ''
            },
            timeOpen: moment(CC.loan.timeOpen).format('YYYY-MM-DD'),
            serverDate: moment(CC.serverDate).format('YYYY-MM-DD'),
            isSend: false,
            backUrl: CC.backUrl,
            dueDate: (CC.repayments[0] || {}).dueDate,
            timeSettled: nextDate(CC.loan.timeSettled),
            isnew: false
        },
        oninit: function () {
            var self = this;
            var inputNum = self.get('inputNum');
            self.set('inputNum', '');
//            alert(inputNum);
//            alert(self.get('inputNum'));
//            if (CC.loan.rule.balance < CC.loan.rule.min) {
//                self.set('inputNum', CC.loan.rule.balance);
//            };
            if (self.get('user') && CC.loan.productKey === 'NEW') {
                if (self.get('user').totalInvest > 0) {
                    self.set('isnew', true);
                }
                ;
            }
        }
    });

    investRactive.set('hasID', CC.user.id);

    function nextDate(timestr) {
        var date = new Date(timestr.replace('/-/g', '\/'));
        var timeunix = Math.round((date.getTime() + 1000 * 60 * 60 * 24) / 1000);
        var time = moment(timeunix * 1000).format('YYYY-MM-DD');
        return time;
    }

    var serverDate = CC.serverDate;
    var openTime = CC.loan.timeOpen;
    serverDate += 1000;
    //if (CC.loan.status === 'SCHEDULED') {
    //    var interval = setInterval((function () {
    //        var leftTime = utils.countDown.getCountDownTime2(openTime, serverDate);
    //        var textDay = leftTime.day ? leftTime.day : '';
    //        if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
    //            clearInterval(interval);
    //        } else {
    //            $('.left-time-start').html('<span class="text">距离开标时间还有<span style="color:#009ada">' + textDay + '</span>天<span style="color:#009ada;">' + leftTime.hour + '</span>时<span style="color:#009ada">' + leftTime.min + '</span>分<span style="color:#009ada">' + leftTime.sec + '</span>秒</span>')
    //        }
    //    }), 1000);
    //}

    if (CC.user) {
        accountService.getUserInfo(function (res) {
            investRactive.set('name', res.userInfo.user.name);
        });
    }

    investRactive.set('user', CC.user);

    investRactive.on("invest-submit", function (e) {
        e.original.preventDefault();

        var num = parseInt(this.get('inputNum'), 10); // 输入的值
        var paymentPassword = this.get('paymentPassword');
        var couponSelection = $("#couponSelection").find("option:selected").text();
        var indexnum = couponSelection.indexOf("最低投资额：");
        var minnum = couponSelection.substring(indexnum + 6, couponSelection.length - 1);
        if (num < minnum) {
            showErrors('投资额小于奖券最低投资额');
            return false;
        }
        if (CC.loan.userId === CC.user.userId) {
            showErrors('该标为您本人借款，无法投标 ');
            return false;
        }

        if (isNaN(num)) {
            showErrors('输入有误，请重新输入 ! ');
            return false;
        }

        if (CC.loan.rule.balance < CC.loan.rule.min) {
            if (this.get('inputNum') != CC.loan.rule.balance) {
                this.set('inputNum', CC.loan.rule.balance);
                showErrors('投资金额必须为标的剩余金额');
                return false;
            } else {
                disableErrors();
            }
        } else {
            if (num < CC.loan.rule.min) {
                showErrors('单次投标金额不可少于' + CC.loan.rule
                        .min + '元 !');
                return false;
            }

            if (((num - CC.loan.rule.min) % CC.loan.rule.step) !==
                0) {
                showErrors('不符合投资规则!最少为' + CC.loan.rule.min + '元，且投资增量为' + CC.loan.rule.step + "元");
                return false;
            }
        }
        if (num > CC.loan.rule.balance) {
            showErrors('投标金额不可超过剩余额度 !');
            return false;
        }

        if (num > CC.loan.rule.max) {
            showErrors('单次投标金额不可超过' + CC.loan.rule.max + '元!');
            return false;
        }

        //if (num > CC.user.availableAmount) {
        //    showErrors('账户余额不足，请先充值 !');
        //    return false;
        //}

        window.location.href = '/loan/payment?num='+num+'&loanId='+CC.loan.id+'&placementId='+$('#couponSelection').val()
        //window.open('/loan/payment?num='+num+'&loanId='+CC.loan.id);
    });

    // 初始化倒计时
    if (CC.loan.timeOpen > 0) {
        var serverDate = CC.loan.serverDate;
        var leftTime = utils.countDown.getCountDownTime2(CC.loan.timeOpen,
            serverDate);
        if (leftTime) {
            var countDownRactive = new Ractive({
                el: ".next-time",
                template: require('ccc/loan/partials/countDown.html'),
                data: {
                    countDown: {
                        days: leftTime.day,
                        hours: leftTime.hour,
                        minutes: leftTime.min,
                        seconds: leftTime.sec
                    }
                }
            });
            var interval = setInterval((function () {
                serverDate += 1000;
                var leftTime = utils.countDown.getCountDownTime2(
                    CC.loan.timeOpen, serverDate);
                if (!+(leftTime.day) && !+(leftTime.hour) && !+(leftTime.min) && !+(leftTime.sec)) {
                    clearInterval(interval);
                    window.location.reload();
                } else {
                    countDownRactive.set('countDown', {
                        days: leftTime.day,
                        hours: leftTime.hour,
                        minutes: leftTime.min,
                        seconds: leftTime.sec
                    });
                }
            }), 1000);
        }
    }

    function parsedata(o) {

        var type = {
            'CASH': '现金券',
            'INTEREST': '加息券',
            'PRINCIPAL': '增值券',
            'REBATE': '返现券'
        };
        for (var i = o.length - 1; i >= 0; i--) {
            o[i] = o[i].placement;
            o[i].value = parseInt(o[i].couponPackage.parValue);
            o[i].id = o[i].id;
            o[i].typeKey = type[o[i].couponPackage.type];
            o[i].minimumInvest = o[i].couponPackage.minimumInvest + "元";

            if (o[i].couponPackage.type === 'INTEREST') {
                o[i].interest = true;
                o[i].displayValue = (parseFloat(o[i].couponPackage.parValue) / 100).toFixed(2) + '%';
            } else if (o[i].couponPackage.type === 'CASH') {
                o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
                o[i].hide = true;
            } else if (o[i].couponPackage.type === 'PRINCIPAL') {
                o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
            } else if (o[i].couponPackage.type === 'REBATE') {
                o[i].displayValue = parseInt(o[i].couponPackage.parValue) + "元";
            }
            ;
        }
        return o;
    };


    function showErrors(error) {
        investRactive
            .set('errors', {
                visible: true,
                msg: error
            });
    }

    function disableErrors() {
        investRactive
            .set('errors', {
                visible: false,
                msg: ''
            });
    }

    function showSelect(amount) {
        var months = CC.loan.duration;
        investRactive.set('inum', parseFloat(amount));
        disableErrors();
        loanService.getMyCouponlist(amount, CC.loan.duration, function (coupon) {
            if (coupon.success) {
                var list = parsedata(coupon.data);
                list.sort(function (a, b) {
                    return a.couponPackage.timeExpire - b.couponPackage.timeExpire;
                });
                investRactive.set('selectOption', list);
            }
        });
    }

    //初始化选项
    showSelect(CC.loan.rule.min);

    investRactive.on('tenNum', function () {
        disableErrors();
        var inputNum = this.get('inputNum');
        var amount = CC.loan.rule.leftAmount * (CC.loan.rule.amountUnit == '万' ? 10000 : 1);
        var mout = CC.loan.rule.max > amount ? amount : CC.loan.rule.max;
        if (parseInt(inputNum) > parseInt(mout)) {
            this.set('inputNum', mout);
            inputNum = mout;
            if(inputNum ==  CC.loan.rule.max){
                showErrors('投标金额最大为'+CC.loan.rule.max+'元');
            }
            if(inputNum == amount){
                showErrors('剩余可投标金额为'+amount+'元');
            }

        }
        if (inputNum.length > 10) {
            this.set('inputNum', inputNum.substring(0, 10));
            showErrors('投标金额最大允许10位数字');
            return false;
        }
    });
    var call =0;
    investRactive.on('addNum', function () {
        var inputNum = parseInt(this.get('inputNum'));
        var minAmount = $("#minAmount").html();
        var stepAmount = parseInt($("#stepAmount").html());
        if(call==0){
            investRactive.set('inputNum',minAmount);
            call++;
        }else if(inputNum>0){
            investRactive.set('inputNum',inputNum+stepAmount);
        }
        //console.log(inputNum)
    });

}), 100);


$('.nav-tabs > li')
    .click(function () {
        $(this)
            .addClass('active')
            .siblings()
            .removeClass('active');
        $('.tab-panel')
            .eq($(this)
                .data('step'))
            .addClass('active')
            .siblings()
            .removeClass('active');
    });


var recordRactive = new Ractive({
    el: '.invest-record',
    template: require('ccc/loan/partials/record.html'),
    page: 1,
    pageSize: 40,
    api: '/api/v2/loan/' + CC.loan.id + '/invests/',
    data: {
        loading: true,
        list: [],
        totalSize: 0
    },
    oninit: function () {
        this.getRecord();
    },
    getRecord: function () {
        var self = this;
        var api = self.api;
        request(api)
            .end()
            .get('body')
            .then(function (r) {
                //self.setData(r);
                var parseResult = self.parseData(r);
                self.setData(parseResult, r.length);
            });
    },
    setData: function (r,totalSize) {
        var self = this;
        //self.set('totalSize', r.totalSize);
        self.set('loading', false);
        self.set('list', r.slice(0,pagesize));
        this.renderPager(r,totalSize);
        //self.renderPager();
    },
    parseData: function (list) {
        for (var i = 0, l = list.length; i < l; i++) {
            list[i].submitTime = moment(list[i].submitTime)
                .format('YYYY-MM-DD HH:mm:ss');
            list[i].mobile = list[i].mobile.replace(/(\d{3})\d{4}(\d{4})/,'$1****$2');
        }
        return list;
    },
    renderPager: function (r,totalSize) {
        var self = this;
        console.log("!!!!!!!")
        //var totalSize = self.get('totalSize');
        //
        //if (totalSize != 0) {
        //    self.totalPage = Math.ceil(totalSize / self.pageSize);
        //}
        //
        //var totalPage = [];
        ////console.log("===>> totalPage = " + self.totalPage);
        //for (var i = 0; i < self.totalPage; i++) {
        //    totalPage.push(i + 1);
        //}
        new RenderPage().page({
            pageSize:pagesize,
            totalSize:totalSize,
            results:r,
            callback:function(r){
                self.set('list',r)
            }
        });

        //renderPager(totalPage, self.page);
    }
});

//function renderPager(totalPage, current) {
//    //console.log("===>render")
//    if (!current) {
//        current = 1;
//    }
//    var pagerRactive = new Ractive({
//        el: '#record-pager',
//        template: require('ccc/loan/partials/pagerRecord.html'),
//        data: {
//            totalPage: totalPage,
//            current: current
//        }
//    });
//
//    pagerRactive.on('previous', function (e) {
//        e.original.preventDefault();
//        var current = this.get('current');
//        if (current > 1) {
//            current -= 1;
//            this.set('current', current);
//            recordRactive.page = current;
//            recordRactive.getRecord();
//
//        }
//    });
//
//    pagerRactive.on('page', function (e, page) {
//        e.original.preventDefault();
//        if (page) {
//            current = page;
//        } else {
//            current = e.context;
//        }
//        this.set('current', current);
//        recordRactive.page = current;
//        recordRactive.getRecord();
//
//    });
//    pagerRactive.on('next', function (e) {
//        e.original.preventDefault();
//        var current = this.get('current');
//        if (current < this.get('totalPage')[this.get('totalPage')
//                .length - 1]) {
//            current += 1;
//            this.set('current', current);
//            recordRactive.page = current;
//            recordRactive.getRecord();
//        }
//    });
//}

function mask(str, s, l) {
    if (!str) {
        return '';
    }
    var len = str.length;
    if (!len) {
        return '';
    }
    if (!l || l < 0) {
        l = len === 2 ? 1 : len - 2;
    } else if (l > len - 1) {
        l = len - 1;
        s = !!s ? 1 : 0;
    }
    if (s > len) {
        s = len - 1;
    }
    str = str.substring(0, s) + (new Array(l + 1))
            .join('*') + str.substring(s + l);
    str = str.substring(0, len);
    return str;
}



//产品介绍图片
//loanService.getLoanProof(CC.loan.requestId, function (imgs) {
loanService.getLoanDetail(CC.loan.id, function (res) {
    var imgs = res.data.proof.proofImages;
    //console.log(imgs);

    var relateDataRactive = new Ractive({
        // insurance 担保
        el: ".insurance-wrapper",
        template: require('ccc/loan/partials/relateDataOnDetail.html'),
        data: {
            imgs: imgs,
            currentIndex: 0,
            selectorsMarginLeft: 0,
            stageLen: 5,
            imgLen: imgs.length
        },
        onrender:function(){
            this.set('imgs',this.parseData(res.data.proof.proofImages));
        },
        parseData:function(res){
            for(var i = 0;i<res.length;i++){
                res[i].proof.content =res[i].proof.content.split('.')[0];
            };
            return res;
        }
    });

    var i = 1;
    var imgLen = $('.pic-box .show-pic-box').length;
    var lf = [], zs = [];

    // 开始大图浏览
    relateDataRactive.on('begin-big-pic', function (e) {
        //console.log(e.index.i)
        relateDataRactive.set('currentIndex', e.index.i);
        var options = {
            imgs: imgs,
            currentIndex: e.index.i,
            selectorsMarginLeft: 0,
            stageLen: 1,
            imgLen: imgLen
        };
        popupBigPic.show(options);
        //init();
        return false;
    });

    $("#left-arrow").click(function () {
        if (i > 1) {
            for (var j = 0; j < imgLen; j++) {
                zs[j] = zs[j] + 200;
                $(".show-pic-box").eq(j).css("left", zs[j]);
            }
            i--;
        }
    });

    $("#right-arrow").click(function () {
        if (i < imgLen) {
            for (var j = 0; j < imgLen; j++) {
                lf[j] = $(".show-pic-box").eq(j).css("left");
                zs[j] = lf[j].slice(0, -2) - 200;

                $(".show-pic-box").eq(j).css("left", zs[j]);
            }
            i++;
        }
    });
});