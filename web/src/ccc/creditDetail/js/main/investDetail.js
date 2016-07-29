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
        timeOpen:CC.creditassign.creditassign.timeOpen1,
        timeFinished:moment(CC.creditassign.creditassign.timeFinished).format('YYYY-MM-DD'),
        workTime:'',
        profit:CC.creditassign.creditassign.creditDealRate*CC.creditassign.creditassign.balance
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
