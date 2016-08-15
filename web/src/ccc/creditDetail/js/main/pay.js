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
var creditassignId='';
var payRactive = new Ractive({
    el:'.payment-content',
    template: require('ccc/creditDetail/partials/pay.html'),
    data:{
        step1: true,
        step2: false,
        step3: false,
        user: CC.user,
        useBankCard:true,
        bankcards: banksabled || [],
        Faccount: Faccount,
        investNum:0,
    },
    oninit:function(){
        var self = this;
        var j = location.search.indexOf('id');
        creditassignId = location.search.substring(j+3);

        $.get('/api/v2/creditassign/creditAssignDetail/' + creditassignId, function(res){
            //console.log(res)
            self.set('creditassign',res.creditassign);
            self.set('investNum',res.creditassign.creditAmount);
        });
    }
});

payRactive.on("invest-submit", function (e) {
    var that = this;
    var creditassign = that.get('creditassign');
    var isUseB = that.get('useBankCard');
    e.original.preventDefault();
    //if(!this.get('useBankCard')){
    //    return;
    //}
    var num = this.get('investNum');
    //console.log(num);
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
                    $.post('/api/v2/invest/user/MYSELF/creditAssign/invest', {
                        clientIp: CC.clientIp,
                        amount: num,
                        creditAssignId: creditassignId,
                        isUseBalance: isUseB
                    }, function (res) {
                        if (res.success) {
                            payRactive.set('step1',false);
                            payRactive.set('step2',true);
                            payRactive.set('step3',false);
                            setTimeout(function(){
                              window.location.href = '/creditList';
                            },5000);
                        } else {
                            payRactive.set('step1',false);
                            payRactive.set('step2',false);
                            payRactive.set('step3',true);
                            payRactive.set('failerror',res.error[0].message);
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