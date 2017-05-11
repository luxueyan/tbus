'use strict';

var utils = require('ccc/global/js/lib/utils');
var UMPBANKS = require('ccc/global/js/modules/cccUmpBanks');
require('ccc/global/js/modules/cccTab');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

// require('ccc/global/js/lib/jquery.easy-pie-chart');


var ractive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/recharge/recharge.html'),
    data: {
        availableAmount: CC.user.availableAmount || 0,
        msg: {
            AMOUNT_NULL: false,
            AMOUNT_INVALID: false,
            CODE_NULL: false,
            CODE_INVALID: false,
        },
        isBankCard: CC.user.bankCards.length,
        showNum: 9,
        minAmount: 100,
        step1: true,
        step2: false,
        step3: false,
        posPayMain: false
    },
    oninit: function () {
        var self = this;
        // get banks
        this.set('loadMessage', '正在载入银行卡...');
        var url = '/api/v2/user/MYSELF/fundaccounts';
        $.get(url, function (o) {
            if (o.length === 0) {
                self.set('loadMessage', '暂无数据');
            }
            self.set('bankcards', self.parseBankData(o));
            self.set('loadMessage', null);

            $.get('/api/v2/payment/router/getBankConstraints', function (r) {
                if (r.success) {
                    var item = r.data;
                    for (var i = 0; i < item.length; i++) {
                        if (item[i].bankCode == o[0].account.bank) {
                            ractive.set('singleQuota', item[i].singleQuota);
                            ractive.set('dailyQuota', item[i].dailyQuota);
                            ractive.set('minQuota', item[i].minQuota);
                        }
                    }
                }

            });
        }).error(function () {
            self.set('loadMessage', '请求出错了');
        });
    },
    parseBankData: function (datas) {
        // format data
        for (var i = 0; i < datas.length; i++) {
            var o = datas[i];
            datas[i].Faccount = o.account.account.slice(-3);
        }
        return datas;
    },
    oncomplete: function () {
        var self = this;
        this.$amount = $(this.el).find('[name=rechargeValue]');
        this.$form = $(this.el).find('form[name=rechargeForm]');

        this.set('totalTime', 100);
        this.set('recharge', false);
        this.set('recharging', false);
        this.set('rechargeSuc', false);
        this.set('rechargeErr', false);

        $('.recharge-cbx').click(function () {
            changeValue();
        });

        this.on('changeValue', function (e) {
            changeValue();
        });

        this.on('onlinePay', function (e) {
            this.set('step1', true);
            this.set('step2', false);
            this.set('step3', false);
            this.set('posPayMain', false);
            this.set('posPaySuc', false);
        });

        this.on('posPay', function (e) {
            this.set('msg', {
                AMOUNT_NULL: false,
                AMOUNT_INVALID: false,
                AMOUNT_NOTENOUGH: false,
                CODE_NULL: false,
                CODE_INVALID: false
            });
            this.set('step1', true);
            this.set('step2', false);
            this.set('step3', false);
            this.set('posPayMain', true);
            this.set('posPaySuc', false);
        });

        function changeValue() {
            var singleQuota = self.get('singleQuota');
            var minQuota = self.get('minQuota');
            var value = self.get('amount');
            var dailyQuota = self.get('dailyQuota');
            ractive.set('msg', {
                AMOUNT_NULL: false,
                AMOUNT_INVALID: false,
                AMOUNT_NOTENOUGH: false,
                CODE_NULL: false,
                CODE_INVALID: false
            });

            if (value === '') {
                ractive.set('msg.AMOUNT_NULL', true);
                return false;
            } else {
                if (Number(value)) {
                    value = Number(value);
                } else {
                    self.set('msg.AMOUNT_INVALID', true);
                    return false;
                }
            }

            if (minQuota == -1) {
                if (value <= 0) {
                    self.set('minQuota', 0);
                    self.set('msg.AMOUNT_NOTENOUGH', true);
                    return false;
                }
            } else {
                if (value < minQuota + 1) {
                    self.set('msg.AMOUNT_NOTENOUGH', true);
                    return false;
                }
            }
            if (!this.get('posPayMain')) {
                if ($('.recharge-cbx').prop("checked")) {
                    if (value > dailyQuota) {//当日限额
                        self.set('msg.AMOUNT_INVALID', true);
                        return false;
                    }
                } else {
                    if (value > singleQuota) {//单笔限额
                        self.set('msg.AMOUNT_INVALID', true);
                        return false;
                    }
                }
            }

            if (!self.get('msg.AMOUNT_MULL')) {
                self.set('msg.AMOUNT_NULL', false);
                self.set('msg.CODE_NULL', false);
            } else {
                self.set('msg.AMOUNT_NULL', true);
                self.set('msg.CODE_NULL', true);
            }
        }

        //去除chrome浏览器里的自动填充
        if (navigator.userAgent.toLowerCase().indexOf("chrome") != -1 || navigator.userAgent.toLowerCase().indexOf("Safari") == -1) {
            var selectors = document.getElementsByTagName("input");
            for (var i = 0; i < selectors.length; i++) {
                if ((selectors[i].type !== "submit") && (selectors[i].type !== "password")) {
                    var input = selectors[i];
                    var inputName = selectors[i].name;
                    var inputid = selectors[i].id;
                    selectors[i].removeAttribute("name");
                    selectors[i].removeAttribute("id");
                    setTimeout(function () {
                        input.setAttribute("name", inputName);
                        input.setAttribute("id", inputid);
                    }, 1)
                }
            }
        }
    }
});


// 根据用户绑卡信息、手机短信验证码调用新的确认绑卡接口，进行绑卡确认
ractive.on('preBindCardSMSS', function () {
    var cardInfoAll = ractive.get('cardInfoAll');

    cardInfoAll.smsCode = ractive.get('preBindCardSms');

    accountService.confirmBindCard(cardInfoAll, function (res) {
        if (res.success) {
            ractive.set('preBindCardShow', false);
            ractive.set('preBindCardSms', '');
            ractive.fire('recharge_submit');
        } else {
            alert(res.error[0].message);
        }
    });
});

ractive.on('recharge_submit', function (e) {
    var msgRes = {
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

    var msgResBig = {
        "depsitRecord add failed": "新建充值记录失败",
        "batchId in batch deposit is necessary": "时间戳不能为空",
        "this batchId is used": "时间戳已占用",
        "get baofoo bankConstraint failed": "获取银行限额表失败",
        "do not need split": "此次交易无需拆单",
        "amount larger than daily quota": "此次交易金额超过每日限额",
        "_preBatchDepositSplit is failed": "大额充值预处理失败"
    };

    var amount = this.get('amount');
    var password = this.get('password');
    var bankcardNo = this.get('bankcards');
    var cardNo = bankcardNo[0].account.account;
    var clientIp = CC.clientIp;
    var minQuota = this.get('minQuota');
    var dailyQuota = this.get('dailyQuota');
    var singleQuota = this.get('singleQuota');

    this.set('msg', {
        AMOUNT_NULL: false,
        AMOUNT_INVALID: false,
        AMOUNT_NOTENOUGH: false,
        CODE_NULL: false,
        CODE_INVALID: false
    });

    if (amount === '') {
        e.original.preventDefault();
        this.set('msg.AMOUNT_NULL', true);
        this.$amount.focus();
        return false;
    } else {
        e.original.preventDefault();
        this.$amount.focus();
        if (Number(amount)) {
            amount = Number(amount);
        } else {
            this.set('msg.AMOUNT_INVALID', true);
            return false;
        }
    }

    if (minQuota == -1) {
        if (amount <= 0) {
            this.set('minQuota', 0);
            this.set('msg.AMOUNT_NOTENOUGH', true);
            return false;
        }
    } else {
        if (amount < minQuota + 1) {
            this.set('msg.AMOUNT_NOTENOUGH', true);
            return false;
        }
    }
    if (!this.get('posPayMain')) {
        if ($('.recharge-cbx').prop("checked")) {
            if (amount > dailyQuota) {//当日限额
                this.set('msg.AMOUNT_INVALID', true);
                return false;
            }
        } else {
            if (amount > singleQuota) {//单笔限额
                this.set('msg.AMOUNT_INVALID', true);
                return false;
            }
        }
    }

    if (password === '') {
        e.original.preventDefault();
        this.set('msg.CODE_NULL', true);
        return false;
        myFunc()
    } else {
        var self = this;
        $(".submit_btn").attr("disabled", "true");
        var timestamp = new Date().getTime();
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
                        accountService.preBindCard(cardInfo, function (res3) {
                            if (res3.success) {
                                ractive.set('preBindCardShow', true);
                                ractive.set('cardInfoAll', cardInfo);
                                ractive.set('BindCardMobile', cardInfo.mobile.slice(0, 3) + '****' + cardInfo.mobile.slice(7, 11));
                            }
                        });
                    }
                });
            }else{
                accountService.checkPassword(password, function (res) {
                    if (res) {
                        if (self.get('posPayMain')) {
                            accountService.posRecord(amount, password, function (r) {
                                if (r.success) {
                                    self.set('step1', false);
                                    self.set('posPaySuc', true);
                                    self.set('posPayOrderID', r.data);
                                    self.set('amount', amount);
                                    self.set('password', '');
                                }
                            })
                        } else {
                            if ($('.recharge-cbx').prop("checked") && amount > singleQuota) {
                                ractive.set('recharge', true);
                                ractive.set('recharging', true);
                                var count = 3 * Math.ceil(amount / singleQuota);

                                ractive.set('rechargingCount', Math.ceil(count / 60));

                                request.post('/api/v2/payment/router/' + CC.user.id + '/batchDepositSplit')
                                    .type("form")
                                    .send({
                                        batchId: timestamp,//时间戳
                                        totalAmount: amount,//总金额
                                        accountNumber: bankcardNo[0].account.account,//是银行卡号
                                        bankCode: bankcardNo[0].account.bank,//是银行缩写
                                        paymentPassword: password,//支付密码
                                        clientIp: clientIp//ip地址
                                    })
                                    .end()
                                    .then(function (r) {
                                        if (r.body.success) {
                                            ractive.set('recharging', false);
                                            ractive.set('rechargeSuc', true);
                                            ractive.set('rechargeSucH', '充值成功');
                                            ractive.set('rechargeSucRes', '充值成功' + r.body.data.numSuccessSplited + '笔，充值总额' + r.body.data.amountSuccessSplited + '元');
                                            myFunc()
                                        } else {
                                            ractive.set('recharging', false);
                                            var numSuc = Number(r.body.data.numSuccessSplited);
                                            if (numSuc) {
                                                ractive.set('rechargeSuc', true);
                                                ractive.set('rechargeSucH', '部分充值成功');
                                                ractive.set('rechargeSucRes', '充值成功' + numSuc + '笔，充值总额' + r.body.data.amountSuccessSplited + '元');
                                            } else {
                                                self.set('rechargeErr', true);
                                                ractive.set('rechargeErrRes', r.body.error[0].message);
                                                //ractive.set('rechargeErrRes', msgResBig[r.body.error[0].type] ? msgResBig[r.body.error[0].type] : r.body.error[0].type);
                                            }
                                            myFunc()
                                        }
                                    });
                            } else {
                                $('.submit_btn').text('正在充值中，请稍等...');
                                request.post('/api/v2/payment/router/charge')
                                    .type("form")
                                    .send({
                                        userId: CC.user.id,
                                        txn_amt: amount,
                                        paymentPasswd: password,
                                        //cardNo: cardNo
                                        clientIp: clientIp
                                    })
                                    .end()
                                    .then(function (r) {
                                        if (r.body.success) {
                                            ractive.set('step1', false);
                                            ractive.set('step2', true);
                                            ractive.set('step3', false);
                                            myFunc()
                                        } else {
                                            ractive.set('step1', false);
                                            ractive.set('step2', false);
                                            ractive.set('step3', true);
                                            ractive.set('failError', r.body.error[0].message);
                                            $('.submit_btn').text('确认充值');
                                            myFunc()
                                        }
                                    });
                            }
                        }
                    } else {
                        self.set('msg.CODE_INVALID', true);
                        myFunc()
                    }
                });
            }
        });
        return false;
    }

    function myFunc() {
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $(".submit_btn").removeAttr("disabled");
    }

    // function PieChart(seconds) {
    //     $(".easy-pie-chart").each(function () {
    //         $(this).easyPieChart({
    //             barColor: '#ff0000',
    //             trackColor: '#ddd',
    //             scaleColor: false,
    //             lineCap: 'butt',
    //             lineWidth: 4,
    //             animate: seconds,
    //             size: 140,
    //             onStep: function (from, to, percent) {
    //                 $(this.el).find('.percent').text(Math.round(percent));
    //             }
    //         });
    //     });
    // }
});

// ractive.on('rechargeClose', function (e) {
//     ractive.set('recharge', false);
//     ractive.set('recharging', false);
//     ractive.set('rechargeSuc', false);
//     ractive.set('rechargeErr', false);
// });