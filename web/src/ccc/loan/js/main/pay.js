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
    var message = {
        "PAYMENT_PWD_NOT_MATCHED":"交易密码错误",
        "INVALID_MOBILE_CAPTCHA":"无效的手机验证码",
        "DEPOSIT_FAILED":"充值失败",
        "LOAN_NOT_FOUND":"标的未找到",
        "SURVEY_FILLING_NOT_FOUND":"用户问卷记录为空",
        "BID_NOT_OPEN":"标的没有开始募集,或已募集结束",
        "BID_NO_BALANCE":"已满标",
        "BID_EXCEED_TIMES_LIMIT":"投标次数超过上限",
        "BID_EXCEED_PRODUCT_TIMES_LIMIT":"投标次数超过产品类型上限",
        "BID_EXCEED_TOTAL_AMOUNT_LIMIT":"投标总金额超过上限",
        "BID_EXCEED_PRODUCT_TOTAL_AMOUNT_LIMIT":"投标总金额超过产品类型上限",
        "BID_EXCEED_SINGLE_AMOUNT_LIMIT":"投标单次金额超过上限",
        "BID_REDUNDANT":"重复投标",
        "USER_BALANCE_INSUFFICIENT":"账户可用余额不足",
        "FROZEN_FAILED":"冻结用户账户余额失败",
        "INVALID_AMOUNT":"投资金额不合规，请查看产品说明",
        "SELF_BID_FORBIDDEN":"不能投给自己的标的",
        "BID_FORBIDDEN":"不满足投标条件",
        "FAILED":"投资失败，请重试",
        "BID_USER_NOT_FOUND":"投标用户不存在",
        "ENTERPRISE_USER_BID_DISABLED":"不允许企业用户投标",
        "COUPON_REDEEM_FAILED":"使用奖券失败",
        "NO_ENOUGH_BALANCE":"标的余额不足",
        "CALL_WITHDRAWREQUEST_FAILED":"请联系管理员",
        "PAID_FAILED":"请联系管理员",
    };
    var that = this;
    $("#subBtn").attr("disabled","true");
    e.original.preventDefault();
    var num = that.get('investNum'); // 输入的值
    var paymentPassword = that.get('paymentPassword');
    var isUseB = that.get('useBankCard');
    //console.log(isUseB)

    if (paymentPassword === '') {
        showErrors('请输入交易密码!');
        myFunc();
        return false;
    } else {
        accountService.checkPassword(paymentPassword, function (r) {
            if (!r) {
                showErrors('请输入正确的交易密码');
                myFunc();
            } else {
                disableErrors();

                //if (document.getElementById('agree').checked == true) {
                //    $('.agree-error').css('visibility', 'hidden');
                    $.post('/api/v2/invest/tender/MYSELF', {
                        userId: CC.user.id,
                        clientIp: CC.clientIp,
                        loanId: CC.loanId,
                        amount: num,
                        smsCaptcha: false,
                        placementId: CC.placementId,
                        paymentPassword: paymentPassword,
                        isUseBalance: isUseB
                    }, function (res) {
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
                            if(message[res.error[0].message]){
                                payRactive.set('failerror',message[res.error[0].message]);
                            }else{
                                payRactive.set('failerror',res.error[0].message);
                            }

                        }
                    });

                //} else {
                //    $('.agree-error').css('visibility', 'visible');
                //    $('.agree-error').html('请先同意用户投资服务协议');
                //}
            }
        });
    };
    function myFunc(){
        //code
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $("#subBtn").removeAttr("disabled");
    }
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