"use strict";
var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/account/js/main/service/account')
    .accountService;

require('bootstrap/js/tab');
require('ccc/global/js/modules/tooltip');
require('ccc/global/js/lib/jquery.easy-pie-chart.js');
require('bootstrap/js/carousel');
require('bootstrap/js/transition');
require('bootstrap/js/tooltip');

var format = require('@ds/format')
var Box = require('ccc/global/js/modules/cccBox');


var statusMap = {
    SCHEDULED: '开标时间:{{timeOpen}}',
    SETTLED: '结标时间:{{timeSettled}}',
    OPENED: '',
    FINISHED: '',
    CLEARED: ''
};

$('#myTabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
})


var assignStatus={
           CREDIT_ASSIGN_DISABLED:"没有开启债权转让功能",
           NOT_FOUND:"债转不存在",
           SUCCESSFUL:"转让成功",
           PARTLY_SUCCESSFUL:"转让部分成功",
           ASSIGN_NOT_OPEN:"转让没有开始,或者已经结束",
           ASSIGN_NO_BALANCE:"转让已满",
           SELF_ASSIGN_FORBIDDEN:"不能承接自己的转让",
           BORROWER_ASSIGN_FORBIDDEN:"标的借款人不能承接转让",
           PARTLY_ASSIGN_FORBIDDEN:"必须全额承接",
           FEE_EXCEED_LIMIT:"费率超过上限",
           ILLEGAL_AMOUNT:"金额错误",
           USER_BALANCE_INSUFFICIENT:"用户账户可用余额不足",
           ASSIGN_REDUNDANT:"重复的转让返回",
           ASSIGN_IN_FAIL:"债权转让标的转入失败",
           ASSIGN_OUT_FAIL:"债权转让标的转出失败",
           ASSIGN_FEE_FAIL:"债权转让收费失败",
           FAILED:"其他原因失败",
};
var href=window.location.href.split('/');
var loanId=href[href.length-1];

var myLoan=null;
var investRactive = new Ractive({
    el: ".creditDetail-container",
    template: require('ccc/creditDetail/partials/doInvestOnDetail.html'),
    data: {
        creditassign: CC.creditassign,
        user: CC.user,
        loan: {},
        dueDate: moment(CC.creditassign.dueDate).format('YYYY-MM-DD'),
        timeOpen:moment(CC.creditassign.creditassign.timeOpen).format('YYYY-MM-DD HH:mm'),
        timeFinished:moment(CC.creditassign.creditassign.timeFinished).format('YYYY-MM-DD'),
        workTime:'',
        profit:utils.format.percent(CC.creditassign.creditassign.amountInterest,2)
    },
    oninit: function () {
        //console.log(CC.creditassign);
        var that = this;
        request.get('/api/v2/loan/'+loanId).end().then(function (r) {
            CC.loan=JSON.parse(r.text);
            myLoan=CC.loan;
            investRactive.set('workTime', moment(CC.loan.loanRequest.valueDate).format('YYYY-MM-DD'));
            investRactive.set('loan', CC.loan);
            var result = parseLoan(r.body);
            that.set("qqtitle", result.title);
            that.set("amount", result.amount);
            that.set("aUnit", result.aUnit);
            that.set("fduration", result.fduration);
            that.set("fdurunit", result.fdurunit);
            that.set("rate", result.rate);
            that.set("guaranteeInfo", result.loanRequest.productLightspot);
            that.set("mortgageInfo", result.loanRequest.riskRank);
            that.set("riskInfo", result.loanRequest.riskControlMethod);
            that.set("fundUsage", result.loanRequest.fundUsage);
            that.set("description", result.loanRequest.commonQuestion);
            that.set("riskPrompt", result.loanRequest.riskPrompt);
            //console.log(1111)
            //console.log(result);
            //console.log(1111)

            result.userId = result.loanRequest.userId;
            result.requestId = result.loanRequest.id;
            return result;
        });
        function parseLoan(loan) {

            var methodZh = {
                'MonthlyInterest': '按月付息到期还本',
                'EqualInstallment': '按月等额本息',
                'EqualPrincipal': '按月等额本金',
                'BulletRepayment': '一次性还本付息',
                'EqualInterest': '月平息'
            };

            var purposeMap = {
                'SHORTTERM': '短期周转',
                'PERSONAL': '个人信贷',
                'INVESTMENT': '投资创业',
                'CAR': '车辆融资',
                'HOUSE': '房产融资',
                'CORPORATION': '企业融资',
                'OTHER': '其它借款'
            };
            //if (loan.investPercent* 100 > 0 && loan.investPercent * 100 < 1) {
            //    loan.investPercent = 1;
            //} else {
            //  loan.investPercent = parseInt(loan.investPercent * 100, 10);
            //};

            var SinvestPercent = (loan.investPercent * 100).toFixed(2)+'';

            if(SinvestPercent.slice(-2)=='00'){
                loan.investPercent = (loan.investPercent * 100);
            }else if(SinvestPercent.slice(-1)=='0'){
                loan.investPercent = (loan.investPercent * 100).toFixed(1);
            }else{
                loan.investPercent = (loan.investPercent * 100).toFixed(2);
            }
            loan.rate = loan.rate / 100;
            loan.loanRequest.deductionRate = loan.loanRequest.deductionRate / 100;
            loan.basicRate = loan.rate - loan.loanRequest.deductionRate;
//    loan.dueDate = loan.timeout * 60 * 60 * 1000 + loan.timeOpen;
            if (loan.timeSettled) {
                loan.borrowDueDate = formatBorrowDueDate(loan.timeSettled, loan
                    .duration);
                loan.timeSettled = moment(loan.timeSettled)
                    .format('YYYY-MM-DD');
            } else {
                // 借款成立日
                loan.timeSettled = loan.dueDate + 1 * 24 * 60 * 60 * 1000;
                loan.borrowDueDate = formatBorrowDueDate(loan.timeSettled, loan
                    .duration);
                loan.timeSettled = moment(loan.timeSettled)
                    .format('YYYY-MM-DD');
            }
            loan.originalAmount = loan.amount;
            if (loan.amount >= 10000) {
                loan.aUnit = '万';
                loan.amount = (loan.amount / 10000);
            } else {
                loan.aUnit = '元';
            }
            loan.leftAmount = loan.balance;
            if (loan.leftAmount >= 10000) {
                loan.amountUnit = '万';
                loan.leftAmount = (loan.leftAmount / 10000);
            } else {
                loan.amountUnit = '元';
            }
            loan.loanRequest.timeSubmit = moment(loan.loanRequest.timeSubmit)
                .format('YYYY-MM-DD');



            loan.method = methodZh[loan.method];
            loan.timeLeftStamp=loan.timeLeft;

            loan.timeLeft = formatLeftTime(loan.timeLeft);
            loan.purpose = purposeMap[loan.purpose];
            //格式化期限
            loan.months = loan.duration.totalMonths;
            if (loan.duration.days > 0) {
                if (typeof loan.duration.totalDays === "undefined") {
                    loan.fduration = loan.duration.days;
                } else {
                    loan.fduration = loan.duration.totalDays;
                }
                loan.fdurunit = "天";
            } else {
                loan.fduration = loan.duration.totalMonths;
                loan.fdurunit = "个月";
            }
            loan.timeOpen = moment(loan.timeOpen).format('YYYY-MM-DD');
            loan.timeFinished = moment(loan.timeFinished).format('YYYY-MM-DD');
            loan.timeout = loan.timeout/24;
            loan.timeEnd = moment(loan.timeOpen).add(loan.timeout, 'days').format('YYYY-MM-DD');
            console.log( "=====loan.timeFinished" + loan.timeFinished);
            console.log( "=====loan.timeEnd" + loan.timeEnd);

            loan.valueDate = moment(loan.loanRequest.valueDate).format('YYYY-MM-DD');
            loan.dueDate = moment(loan.loanRequest.dueDate).format('YYYY-MM-DD');
//    起息日
            loan.start1 = moment(loan.timeFinished).add(1, 'days').format('YYYY-MM-DD');
            loan.start2 =  moment(loan.timeEnd).add(1, 'days').format('YYYY-MM-DD');
//    到息日
            loan.end1 =  moment(loan.start1).add(loan.duration.totalDays, 'days').format('YYYY-MM-DD');
            loan.end2 =  moment(loan.start2).add(loan.duration.totalDays, 'days').format('YYYY-MM-DD');

            //格式化序列号
            if( loan.providerProjectCode ){
                if( loan.providerProjectCode.indexOf('#') > 0 ){
                    var hh_project_code = loan.providerProjectCode.split('#');
                    loan.fProjectType = hh_project_code[0];
                    loan.fProjectCode = hh_project_code[1];
                } else {
                    loan.fProjectType = '';
                    loan.fProjectCode = loan.providerProjectCode;
                }
            }

            return loan;
        }
        // TODO 支持format
        function formatLeftTime(leftTime) {
            var dd = Math.floor(leftTime / 1000 / 60 / 60 / 24);
            leftTime -= dd * 1000 * 60 * 60 * 24;
            var hh = Math.floor(leftTime / 1000 / 60 / 60);
            leftTime -= hh * 1000 * 60 * 60;
            var mm = Math.floor(leftTime / 1000 / 60);
            leftTime -= mm * 1000 * 60;
            var ss = Math.floor(leftTime / 1000);
            leftTime -= ss * 1000;
            var obj=JSON.stringify({
                dd:dd,
                hh:hh,
                mm:mm,
                ss:ss
            });

            return obj;
        }

        function formatBorrowDueDate(timeSettled, duration) {
            var borrowTime = moment(timeSettled)
                .format('YYYY-MM-DD');
            borrowTime = borrowTime.split('-');
            var year = parseInt(borrowTime[0], 10);
            var month = parseInt(borrowTime[1], 10);
            var day = parseInt(borrowTime[2]);
            var addMonth = month;
            if(duration) {addMonth = month + duration.totalMonths;}
            if( duration.days > 0 ){
                return moment(timeSettled).add('days',duration.totalDays).format('YYYY-MM-DD');
            } else {
                if (!(addMonth % 12)) {
                    //console.log(addMonth);
                    year = Math.floor(addMonth / 12) - 1 + year;
                    month = addMonth - (Math.floor(addMonth / 12) - 1) * 12;
                } else {
                    year = Math.floor(addMonth / 12) + year;
                    month = addMonth - Math.floor(addMonth / 12) * 12;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                if (day < 10) {
                    day = '0' + day;
                }
                return year + '-' + month + '-' + day;
            }
        }
        //产品介绍图片

    },
    onrender:function(){
        setTimeout(function(){
            loanService.getLoanDetail(CC.loan.id, function (res) {
                var imgs = res.data.proof.proofImages;
                //console.log(imgs);

                var relateDataRactive = new Ractive({
                    // insurance 担保
                    el: ".insurance-wrapper",
                    template: require('ccc/creditDetail/partials/relateDataOnDetail.html'),
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
        },1000)


    }


});

investRactive.on("invest-submit", function (e) {
    e.original.preventDefault();

    var num = CC.creditassign.creditassign.balance;
    var paymentPassword = this.get('paymentPassword');
    var couponSelection = $("#couponSelection").find("option:selected").text();
    if (CC.loan.userId === CC.user.userId) {
        showErrors('该标为您本人借款，无法投标 ');
        return false;
    }
    if (CC.user.userId === CC.creditassign.creditassign.userId) {
        showErrors('不能投自己债转的标的');
        return false;
    }
    //if (num > CC.user.availableAmount) {
    //    showErrors('账户余额不足，请先充值 !');
    //    return false;
    //}
    window.location.href = '/creditDetail/payment?id='+CC.creditassign.creditassign.id;
});

window.reopen = function () {
    window.location.reload();
}


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

