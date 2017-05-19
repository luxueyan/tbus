var loanService = require('./service/loans').loanService;
var utils = require('ccc/global/js/lib/utils');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
var CccBox = require('ccc/global/js/modules/cccBox');
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
            $.get('/api/v2/payment/router/getBankConstraints', function (r) {
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

// 根据用户绑卡信息、手机短信验证码调用新的确认绑卡接口，进行绑卡确认
payRactive.on('preBindCardSMSS', function () {
    var cardInfoAll = payRactive.get('cardInfoAll');

    cardInfoAll.smsCode = payRactive.get('preBindCardSms');

    accountService.confirmBindCard(cardInfoAll, function (res) {
        if (res.success) {
            payRactive.set('preBindCardShow', false);
            payRactive.set('preBindCardSms', '');
            payRactive.fire('invest-submit');

        } else {
            payRactive.set('preBindCardShow', false);
            $("#subBtn").removeAttr("disabled");
            alert(res.error[0].message);
        }
    });
});
payRactive.on('getSMS', function () {
    var cardInfo = payRactive.get('cardInfoAll');
    var obj=$("#code");
    if(!obj.hasClass('disabled')){
        accountService.preBindCard(cardInfo, function (res) {
            if (res.success) {
                var obj=$("#code");
                obj.addClass('disabled');
                var previousText = '获取验证码';
                var msg = '$秒后重新发送';

                var left = 60;
                var interval = setInterval((function () {
                    if (left > 0) {
                        obj.html(msg.replace('$', left--));
                    } else {
                        obj.html(previousText);
                        obj.removeClass('disabled');
                        clearInterval(interval);
                    }
                }), 1000)
            }else{
                alert(res.error[0].message);
            }
        });
    }
});

payRactive.on('closeSMSS', function () {
    payRactive.set('preBindCardShow', false);
    $("#subBtn").removeAttr("disabled");
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
        "PAID_FAILED": "充值失败",
        "LOAN_SELL_OUT": "标的已售罄"
    };
    var that = this;
    $("#subBtn").attr("disabled", "true");
   // e.original.preventDefault();
    var num = that.get('investNum'); // 输入的值
    var paymentPassword = that.get('paymentPassword');
    var isUseB = that.get('useBankCard');
    var singleQuota = that.get('singleQuota');
    if (isUseB) {//当勾选使用余额，投标金额 - 余额 > 银行卡单笔限额时
        if (num - CC.user.availableAmount > singleQuota) {
            alert("超过银行卡单笔" + singleQuota + "元的限额");
            return false;
        }
    } else {//当没有勾选使用余额，投标金额 > 银行卡单笔限额时
        if (num > singleQuota) {
            alert("超过银行卡单笔" + singleQuota + "元的限额");
            return false;
        }
    }


    if (paymentPassword === '') {
        showErrors('请输入交易密码!');
        myFunc();
        return false;
    } else {
        // 判断用户的银行卡当前支付路由是否绑卡
        accountService.hasOpenCurrentChannel(function (res1) {
            if (!res1.data) {
                // 根据用户ID调用用户平台上已有的绑卡信息
                accountService.userBindCardInfo(function (res2) {
                    if (res2.success) {
                        var cardInfo = {
                            realName: res2.data.userInfo.name,
                            idNumber: res2.data.userInfo.idNumber,
                            accountNumber: res2.data.bankCards[0].account.account,
                            mobile: res2.data.bankCards[0].account.bankMobile,
                            bankName: res2.data.bankCards[0].account.bank,
                        }
                        // 根据后台取得的绑卡信息，调用新的预绑卡接口
                        payRactive.set('preBindCardShow', true);
                        payRactive.set('cardInfoAll', cardInfo);
                        payRactive.set('BindCardMobile', cardInfo.mobile.slice(0, 3) + '****' + cardInfo.mobile.slice(7, 11));
                    }
                });
            }else{
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
                            isUseBalance: isUseB,
                            isCycleProduct: CC.isCycleProduct
                        }, function (res) {
                            if (res.success) {
                                payRactive.set('step1', false);
                                payRactive.set('step2', true);
                                payRactive.set('step3', false);
                                setTimeout(function () {
                                    if (CC.isCycleProduct == "true") {
                                        new CccBox({
                                            title: '循环确认',
                                            value: 'loading...',
                                            autoHeight: true,
                                            width: 516,
                                            height: 250,
                                            showed: function (ele, box) {
                                                var tipsRactive = new Ractive({
                                                    el: $(ele),
                                                    template: '<h1 class="cycleTitle">循环确认</h1><p class="cycleContent">温馨提示：该产品为可循环产品，默认本金自动循环。“开放日（T日） ”指每期产品的到期日，份额持有人在T-15日前点击“赎回”按钮 ， 则当期赎回本金， 否则顺延投资至下一期。 </p><img class="cccBox-line" src="/ccc/loan/img/cccbox_line.png"/><button on-click="clickOk" class="cycleBtn">确定</button>',
                                                });
                                                tipsRactive.on('clickOk', function () {
                                                    $(".ccc-box-wrap .bar .close ").click();
                                                    window.location.href = '/loan/' + CC.loanId;
                                                });
                                            }
                                        })
                                    } else {
                                        window.location.href = '/loan/' + CC.loanId;
                                    }
                                }, 1000)

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
