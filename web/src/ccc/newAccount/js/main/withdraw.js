'user strict';

var utils = require('ccc/global/js/lib/utils');
var CommonService = require('ccc/global/js/modules/common').CommonService;
//var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});
var Faccount = CC.user.bankCards[0].account.account.slice(-3);

var ractive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/withdraw.html'),
    data: {
        bankcards: banksabled || [],
        Faccount: Faccount,
        availableAmount: CC.user.availableAmount || 0,
        msg: {
            AMOUNT_NULL: false,
            AMOUNT_INVALID: false,
            AMOUNT_POOR: false,
            AMOUNT_ALL: '不足100元时请全部提现',
            ERROR: '请求出现错误',
            CODE_NULL: false,
            CODE_INVALID: false

        },
        pointNum: null,
        intNum: null,
        disabled: false,
        submitText: '确认提现',
        submitMessage: null,
        error: false,
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet || false,
        step1: true,
        step2: false,
        step3: false
    },
    parseDataNum: function () {
        var self = this;
        var availableAmount = parseFloat(self.get('availableAmount')).toFixed(2) + '';
        var point = availableAmount.indexOf('.');
        if (point !== -1) {
            var num = availableAmount.split('.');
            self.set({
                'intNum': num[0],
                'pointNum': num[1]
            })
        }
    },
    oncomplete: function () {
        var self = this;
        this.$amount = $(this.el).find('[name=amount]');
        this.$form = $(this.el).find('form[name=withdrawForm]');
        this.$pass = $(this.el).find('[name=paymentPassword]');
        this.$amount.focus();

        this.on('changeValue', function (e) {
            var amount = $.trim($(e.node).val());

            if (amount === '') {
                self.set('msg', {
                    AMOUNT_NULL: true,
                    AMOUNT_INVALID: false,
                    AMOUNT_POOR: false
                });
                self.set('error', false);
                return;
            } else if (amount == 0) {

                self.set('msg', {
                    AMOUNT_NULL: false,
                    AMOUNT_INVALID: true,
                    AMOUNT_POOR: false
                });
                return;
            } else if (!self.match(amount)) {
                //alert(111)
                self.set('msg', {
                    AMOUNT_NULL: false,
                    AMOUNT_INVALID: true,
                    AMOUNT_POOR: false
                });
                return;
            } else if (parseFloat(amount) > CC.user.availableAmount) {
                self.set('msg', {
                    AMOUNT_NULL: false,
                    AMOUNT_INVALID: false,
                    AMOUNT_POOR: true
                });
                return;
            } else {
                self.set('msg', {
                    AMOUNT_NULL: false,
                    AMOUNT_INVALID: false,
                    AMOUNT_POOR: false
                });
            }


            var url = '/api/v2/user/MYSELF/calculateWithdrawFee/' + amount;
            $.ajax({
                type: 'GET',
                async: false,
                url: url,
                success: function (o) {
                    //alert(1111);
                    self.set('submitText', '确认提现');
                    self.set('totalFee', o.totalFee);
                    self.set('withdrawAmount', o.withdrawAmount);
                    if (o.withdrawAmount <= 0) {
                        self.set('withdrawAmount', '到账金额小于0,请调整取现金额');
                    }
                },
                error: function (o) {
                    console.info('请求出现错误，' + o.statusText);
                    self.set('error', true);
                }
            });
        });

        this.on('checkPassword', function () {
            var password = this.get('paymentPassword');
            if (password === '' || password === null) {
                self.set('msg.CODE_NULL', true);
                self.set('msg.CODE_INVALID', false);
                return;
            } else if (password !== '') {
                self.set('msg.CODE_NULL', false);
                accountService.checkPassword(password, function (r) {
                    if (!r) {
                        self.set('msg.CODE_INVALID', true);
                        return;
                    } else {
                        self.set('msg', {
                            CODE_NULL: false,
                            CODE_INVALID: false
                        });
                    }
                });
            }
        });

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


    },

    confirm: function (amount) {
        var self = this;

        //if (this.$form.find('.post-btn').hasClass('disabled')) {
        //    return false;
        //}
        //
        //this.set('submitText', '操作中...');
        //this.set('disabled', true);

        //var _FEE = null;
        //var url = '/api/v2/user/MYSELF/calculateWithdrawFee/'+amount;
        //$.ajax({
        //	type: 'GET',
        //	async: false,
        //	url: url,
        //	success: function(o){
        //       //alert(1111);
        //		_FEE = o;
        //		self.set('submitText', '确认提现');
        //		self.set('disabled', false);
        //	},
        //	error: function(o){
        //		console.info('请求出现错误，' + o.statusText);
        //		self.set('error', true);
        //		self.set('submitText', '确认提现');
        //		self.set('disabled', false);
        //	}
        //});
        //_FEE = {
        //    withdrawAmount: amount
        //}
        //if (_FEE === null) {
        //    return false;
        //}

        // 实际到账<=0的情况
        //if (_FEE.withdrawAmount <= 0) {
        //    var text = '实际到账金额为' + _FEE.withdrawAmount + '元，请调整取现金额';
        //    self.set('submitMessage', text);
        //    return false;
        //}

        //return confirm(
        //     '实际到账' + _FEE.withdrawAmount + '元 (收取' + _FEE.totalFee + '元提现手续费)\n确认提现吗？'
        //    //'实际到账' + _FEE.withdrawAmount + '元 \n确认提现吗？'
        //);
    },

    match: function (v) {
        return v.toString().match(/^([0-9][\d]{0,7}|0)(\.[\d]{1,2})?$/);
    }
});


ractive.parseDataNum();

ractive.set('preBindCardShow', false);

// 根据用户绑卡信息、手机短信验证码调用新的确认绑卡接口，进行绑卡确认
ractive.on('preBindCardSMSS', function () {
    var cardInfoAll = ractive.get('cardInfoAll');

    cardInfoAll.smsCode = ractive.get('preBindCardSms');

    accountService.confirmBindCard(cardInfoAll, function (res) {
        if (res.success) {
            ractive.set('preBindCardShow', false);
            ractive.set('preBindCardSms', '');
            ractive.fire('withDrawSubmit');
        } else {
            $(".submit_btn").removeAttr("disabled");
            $(".submit_btn").removeAttr("disabled");
            alert(res.error[0].message);
        }
    });
});
ractive.on('getSMS', function () {
    var cardInfo = ractive.get('cardInfoAll');
    var obj=$("#code");
    if(!obj.hasClass('disabled')){
        accountService.preBindCard(cardInfo, function (res) {
            if (res.success) {
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
ractive.on('closeSMSS', function () {
    ractive.set('preBindCardShow', false);
    $(".submit_btn").removeAttr("disabled");
});
ractive.on('withDrawSubmit', function () {
    var amount = this.get('amount');
    var pass = this.get('paymentPassword');
    var bankcardNo = this.get('bankcards');
    var cardNo = bankcardNo[0].account.account;

    if (amount === '') {
        this.set('msg.AMOUNT_NULL', true);
    } else if (amount <= 2) {
        this.set('msg.AMOUNT_INVALID', true);
    } else if (!this.match(amount)) {
        this.set('msg.AMOUNT_INVALID', true);
        this.$amount.focus();
    } else if (parseFloat(amount) > CC.user.availableAmount) {
        this.set('msg.AMOUNT_POOR', true);
        this.$amount.focus();
    } else if (this.get('error')) {
        this.set('submitMessage', this.get('msg.ERROR'));
    } else if (pass === '') {
        this.set('msg.CODE_NULL', true);
    } else if (pass !== '') {
        $(".submit_btn").attr("disabled", "true");
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
                        ractive.set('preBindCardShow', true);
                        ractive.set('cardInfoAll', cardInfo);
                        ractive.set('BindCardMobile', cardInfo.mobile.slice(0, 3) + '****' + cardInfo.mobile.slice(7, 11));
                    }else{
                        myFunc()
                    }
                });
            } else {
                accountService.checkPassword(pass, function (r) {
                    if (!r) {
                        ractive.set('msg.CODE_INVALID', true);
                        myFunc();
                    } else {
                        ractive.set('msg', {
                            CODE_NULL: false,
                            CODE_INVALID: false
                        });
                        ractive.set('submitText', '正在提现中，请稍等...');

                        //if (ractive.confirm(amount)) {
                        //isAcess = true;


                        $.post('/api/v2/payment/router/withdraw/MYSELF', {
                            paymentPassword: pass,
                            amount: amount,
                            //cardNo: cardNo

                        }, function (res) {
                            if (res.success) {
                                ractive.set('step1', false);
                                ractive.set('step2', true);
                                ractive.set('step3', false);
                            } else {
                                ractive.set('step1', false);
                                ractive.set('step2', false);
                                ractive.set('step3', true);
                                ractive.set('failError', res.error[0].message);
                                ractive.set('submitText', '确认提现');
                            }
                        });
                        //};
                    }
                });
            }
        });
    }
    function myFunc() {
        //code
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $(".submit_btn").removeAttr("disabled");
    }
});