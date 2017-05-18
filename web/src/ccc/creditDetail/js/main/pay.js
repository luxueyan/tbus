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
var creditassignId = '';
var payRactive = new Ractive({
    el: '.payment-content',
    template: require('ccc/creditDetail/partials/pay.html'),
    data: {
        step1: true,
        step2: false,
        step3: false,
        user: CC.user,
        useBankCard: true,
        bankcards: banksabled || [],
        Faccount: Faccount,
        investNum: 0,
    },
    oninit: function () {
        var self = this;
        var j = location.search.indexOf('id');
        creditassignId = location.search.substring(j + 3);

        $.get('/api/v2/creditassign/creditAssignDetail/' + creditassignId, function (res) {
            //console.log(res)
            self.set('creditassign', res.creditassign);
            self.set('investNum', res.creditassign.creditDealAmount);
            self.set('creditAmount', res.creditassign.creditAmount);
        });

        console.log(CC.user.bankCards[0].account.bank)

        $.get('/api/v2/payment/router/getBankConstraints', function (r) {
            if (r.success) {
                var item = r.data;
                for (var i = 0; i < item.length; i++) {
                    if (item[i].bankCode == CC.user.bankCards[0].account.bank) {
                        self.set('singleQuota', item[i].singleQuota);
                        self.set('dailyQuota', item[i].dailyQuota);
                        self.set('minQuota', item[i].minQuota);
                    }
                }
            }

        });
    }
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
    $(".submit_btn").removeAttr("disabled");
});
payRactive.on("invest-submit", function (e) {
    var message = {
        'CREDIT_ASSIGN_DISABLED': "债转功能不可用",
        'NOT_FOUND': "债转不存在",
        'ASSIGN_NOT_OPEN': "转让未开始或已结束",
        'ASSIGN_NO_BALANCE': "转让金额已满",
        'SELF_ASSIGN_FORBIDDEN': "不能承接自己的转让",
        'BORROWER_ASSIGN_FORBIDDEN': "标的借款人不能承接转让",
        'PARTLY_ASSIGN_FORBIDDEN': "必须全额承接",
        'FEE_EXCEED_LIMIT': "费率超过上限",
        'ILLEGAL_AMOUNT': "金额错误",
        'USER_BALANCE_INSUFFICIENT': "用户账户可用余额不足",
        'ASSIGN_REDUNDANT': "重复的债转投资",
        'DEPOSIT_FAILED': "使用认证支付失败",
        'USER_NOT_EXIST': "获取用户信息失败",
        'ASSIGN_FEE_FAIL': "债权转让收费失败",
        'FAILED': "其他原因失败"
    };
    var that = this;
    var creditassign = that.get('creditassign');
    var isUseB = that.get('useBankCard');
   // e.original.preventDefault();
    var num = this.get('investNum');
    var creditAmountOld = this.get('creditAmount');
    var isUseB = that.get('useBankCard');
    var singleQuota = that.get('singleQuota');

    console.log(num,CC.user.availableAmount)
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
    var paymentPassword = this.get('paymentPassword');
    if (paymentPassword === '') {
        showErrors('请输入交易密码!');
        return false;
        myFunc();
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
            }else {
                accountService.checkPassword(paymentPassword, function (r) {
                    if (!r) {
                        showErrors('请输入正确的交易密码');
                        myFunc();
                    } else {
                        disableErrors();
                        $(".submit_btn").attr("disabled", "true");
                        //if (document.getElementById('agree').checked == true) {
                        //    $('.agree-error').css('visibility', 'hidden');
                        $.post('/api/v2/invest/user/MYSELF/creditAssign/invest', {
                            clientIp: CC.clientIp,
                            amount: creditAmountOld,
                            creditAssignId: creditassignId,
                            isUseBalance: isUseB
                        }, function (res) {
                            if (res.success) {
                                payRactive.set('step1', false);
                                payRactive.set('step2', true);
                                payRactive.set('step3', false);
                                setTimeout(function () {
                                    window.location.href = '/creditList';
                                }, 5000);
                                myFunc();
                            } else {
                                payRactive.set('step1', false);
                                payRactive.set('step2', false);
                                payRactive.set('step3', true);
                                if (message[res.error[0].message]) {
                                    payRactive.set('failerror', message[res.error[0].message]);
                                } else {
                                    payRactive.set('failerror', res.error[0].message);
                                }
                                myFunc();
                            }
                        });

                        //} else {
                        //    $('.agree-error').css('visibility', 'visible');
                        //    $('.agree-error').html('请先同意用户投资服务协议');
                        //}
                    }
                });
            }
        });
    }
    ;
    function myFunc() {
        //code
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $(".submit_btn").removeAttr("disabled");
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