"use strict";
var loanService = require('./service/loans.js')
    .loanService;
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
        request.get('/api/v2/loan/'+loanId).end().then(function (r) {
            CC.loan=JSON.parse(r.text);
            investRactive.set('workTime', moment(CC.loan.loanRequest.valueDate).format('YYYY-MM-DD'));
            investRactive.set('loan', CC.loan);
        });
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
    if (num > CC.user.availableAmount) {
        showErrors('账户余额不足，请先充值 !');
        return false;
    }
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