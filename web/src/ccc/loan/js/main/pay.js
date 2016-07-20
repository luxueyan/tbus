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
        bankcards: banksabled || [],
        Faccount: Faccount,
    },
    init:function(){
        var self = this;
        var i = location.search.indexOf('num');
        var j = location.search.indexOf('loanId');
        var investNum = location.search.substring(i+4,j-1);
        var loanId = location.search.substring(j+7);

        $.get('/api/v2/loan/' + loanId, function(list){
            //console.log(list);
            self.set('loan',list);
        });
        var investNum2 = parseInt(investNum).toFixed(2);
        self.set('amount',investNum2);
    }
});

payRactive.on("invest-submit", function (e) {
    e.original.preventDefault();
    var num = parseInt(this.get('amount'), 10); // 输入的值
    var paymentPassword = this.get('paymentPassword');
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
                    $.post('/api/v2/invest/tender/MYSELF', {
                        amount: num,
                        loanId: payRactive.get('loan.id'),
                        placementId: $('#couponSelection').find("option:selected").val(),
                        paymentPassword: paymentPassword
                    }, function (res) {
                        //alert(11);
                        if (res.success) {
                            var loanId = payRactive.get('loan.id');
                            payRactive.set('step1',false);
                            payRactive.set('step2',true);
                            payRactive.set('step3',false);
                            setTimeout(function(){
                              window.location.href = '/loan/'+loanId;
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