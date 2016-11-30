var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var i18n = require('@ds/i18n')['zh-cn'];
var format = require('@ds/format')
var Confirm = require('ccc/global/js/modules/cccConfirm');

//支付
var payRactive = new Ractive({
    el: '.payment-content',
    template: require('ccc/loan/partials/pay.html'),
    data: {
        step1: true,
        step2: false,
        step3: false,
        failreason: false,
        user: CC.user,
        useBankCard: true,
        investNum: parseInt(CC.investNum),
        loanId: CC.loanId,
    },
    oninit: function () {
        var self = this;
        $.get('/api/v2/loan/' + CC.loanId, function (res) {
            self.set('loan', res);
        });

        var url = '/api/v2/user/MYSELF/fundaccounts';
        $.get(url, function (o) {
            self.set('bankcards', self.parseBankData(o));
            $.get('/api/v2/baofoo/getBankConstraints', function (r) {
                if (r.success) {
                    var item = r.data;
                    for (var i = 0; i < item.length; i++) {
                        if (item[i].bankCode == o[0].account.bank) {
                            self.set('singleQuota', item[i].singleQuota);
                            self.set('dailyQuota', item[i].dailyQuota);
                            self.set('minQuota', item[i].minQuota);
                        }
                    }
                }

            });
        })
    },
    parseBankData: function (datas) {
        // format data
        for (var i = 0; i < datas.length; i++) {
            var o = datas[i];
            datas[i].Faccount = o.account.account.slice(-3);
        }
        return datas;
    },
});

payRactive.on("invest-submit", function (e) {
    var message = {
        "PAYMENT_PWD_NOT_MATCHED": "交易密码错误",
        "INVALID_MOBILE_CAPTCHA": "无效的手机验证码",
        "DEPOSIT_FAILED": "充值失败",
        "LOAN_NOT_FOUND": "标的未找到",
        "SURVEY_FILLING_NOT_FOUND": "用户问卷记录为空",
        "BID_NOT_OPEN": "标的没有开始募集,或已募集结束",
        "BID_NO_BALANCE": "已满标",
        "BID_EXCEED_TIMES_LIMIT": "投标次数超过上限",
        "BID_EXCEED_PRODUCT_TIMES_LIMIT": "投标次数超过产品类型上限",
        "BID_EXCEED_TOTAL_AMOUNT_LIMIT": "投标总金额超过上限",
        "BID_EXCEED_PRODUCT_TOTAL_AMOUNT_LIMIT": "投标总金额超过产品类型上限",
        "BID_EXCEED_SINGLE_AMOUNT_LIMIT": "投标单次金额超过上限",
        "BID_REDUNDANT": "重复投标",
        "USER_BALANCE_INSUFFICIENT": "账户可用余额不足",
        "FROZEN_FAILED": "冻结用户账户余额失败",
        "INVALID_AMOUNT": "投资金额不合规，请查看产品说明",
        "SELF_BID_FORBIDDEN": "不能投给自己的标的",
        "BID_FORBIDDEN": "不满足投标条件",
        "FAILED": "投资失败，请重试",
        "BID_USER_NOT_FOUND": "投标用户不存在",
        "ENTERPRISE_USER_BID_DISABLED": "不允许企业用户投标",
        "COUPON_REDEEM_FAILED": "使用奖券失败",
        "NO_ENOUGH_BALANCE": "标的余额不足",
        "CALL_WITHDRAWREQUEST_FAILED": "提现申请失败",
        "PAID_FAILED": "充值失败"
    };
    var that = this;
    $("#subBtn").attr("disabled", "true");
    e.original.preventDefault();
    var num = that.get('investNum'); // 输入的值
    var paymentPassword = that.get('paymentPassword');
    var isUseB = that.get('useBankCard');
    //console.log(isUseB)
    var singleQuota = that.get('singleQuota');

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

                //$.post('/api/v2/invest/tender/MYSELF', {
                $.post('/api/v2/invest/tender/MYSELF/loan/' + CC.loanId, {
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
                        payRactive.set('step1', false);
                        payRactive.set('step2', true);
                        payRactive.set('step3', false);
                        setTimeout(function () {
                            window.location.href = '/loan/' + CC.loanId;
                        }, 5000);
                    } else {
                        payRactive.set('step1', false);
                        payRactive.set('step2', false);
                        payRactive.set('step3', true);
                        //payRactive.set('failreason', true);
                        if (message[res.error[0].message]) {
                            payRactive.set('failerror', message[res.error[0].message]);
                        } else {
                            payRactive.set('failerror', res.error[0].message);
                        }

                    }
                });
            }
        });
    }

    function myFunc() {
        //code
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $("#subBtn").removeAttr("disabled");
    }
});

function showErrors(error) {
    payRactive.set('errors', {visible: true, msg: error});
}

function disableErrors() {
    payRactive.set('errors', {visible: false, msg: ''});
}
