var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var CccBox = require('ccc/global/js/modules/cccBox');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
var Confirm = require('ccc/global/js/modules/cccConfirm');


var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});
var Faccount = CC.user.bankCards[0].account.account.slice(-3);
//支付
var payRactive = new Ractive({
    el:'.payment-content',
    template: require('ccc/loan/partials/pay.html'),
    data:{
        step1: true,
        step2: false,
        step3: false,
        user: CC.user,
        useBankCard:true,
        bankcards: banksabled || [],
        Faccount: Faccount,
        investNum:parseInt(CC.investNum),
        loanId:CC.loanId,
    },
    oninit:function(){
        var self = this;
//        var i = location.search.indexOf('num');
//        var j = location.search.indexOf('loanId');
//        var investNum = location.search.substring(i+4,j-1);
//        var loanId = location.search.substring(j+7);
//
        $.get('/api/v2/loan/' + CC.loanId, function(res){
            console.log(res);
            self.set('loan',res);
        });
//        var investNum2 = parseInt(investNum).toFixed(2);
//        self.set('amount',investNum2);
    }
});

payRactive.on("invest-submit", function (e) {
    var that = this;
    e.original.preventDefault();
    var availableAmount = CC.user.availableAmount;
    var num = that.get('investNum'); // 输入的值
    var paymentPassword = that.get('paymentPassword');
    var isUseB = that.get('useBankCard');
    //console.log(isUseB)

    if (paymentPassword === '') {
        showErrors('请输入交易密码!');
        return false;
    } else {
        accountService.checkPassword(paymentPassword, function (r) {
            if (!r) {
                showErrors('请输入正确的交易密码');
            } else {
                disableErrors();

                if (document.getElementById('agree').checked == true) {
                    $('.agree-error').css('visibility', 'hidden');
                    //$.post('/api/v2/invest/tender/MYSELF', {
                    $.post('/api/v2/baofoo/pay', {
                        //amount: num,
                        //loanId: CC.loanId,
                        //placementId:CC.placementId,
                        //paymentPassword: paymentPassword
                        loanId: CC.loanId,
                        userId: CC.user.id,
                        txn_amt: num,
                        smsEnabled: false,
                        isUseBalance: isUseB,
                        paymentPassword: paymentPassword
                    }, function (res) {
                        //alert(11);
                        if (res.success) {
                            payRactive.set('step1',false);
                            payRactive.set('step2',true);
                            payRactive.set('step3',false);
                            setTimeout(function(){
                              window.location.href = '/loan/'+CC.loanId;
                            },5000);
                        } else {
                            payRactive.set('step1',false);
                            payRactive.set('step2',false);
                            payRactive.set('step3',true);
                        }
                    });

                } else {
                    $('.agree-error').css('visibility', 'visible');
                    $('.agree-error').html('请先同意用户投资服务协议');
                }
            }
        });
    };
});

function showErrors(error) {
    payRactive
        .set('errors', {
            visible: true,
            msg: error
        });
}

function disableErrors() {
    payRactive
        .set('errors', {
            visible: false,
            msg: ''
        });
}