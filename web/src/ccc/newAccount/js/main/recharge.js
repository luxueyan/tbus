'use strict';

var utils = require('ccc/global/js/lib/utils');
var UMPBANKS = require('ccc/global/js/modules/cccUmpBanks');
var NETBANKS = require('ccc/global/js/modules/netBank');
require('ccc/global/js/modules/cccTab');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var banks = _.filter(NETBANKS, function (r) {
    return r.enable === true;
});

var corBanks = _.filter(NETBANKS, function (r) {
    return r.isSupportted === true;
});
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
        pointNum: null,
        intNum: null,
        banks: banks,
        corBanks: corBanks,
        bankcards: CC.user.bankcards,
        bankCodeEnd: (function () {
            if (CC.user.enterprise) {
                return '-NET-B2B';
            } else {
                return '-NET-B2C';
            }
        })(),
        isBankCard: CC.user.bankCards.length,
        amountValue: 5000,
        showNum: 9,
        minAmount: 100,
        step1: true,
        step2: false
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
        }).error(function () {
            self.set('loadMessage', '请求出错了');
        });
    },
    parseData: function () {
        var self = this;
        var availableAmount = self.get('availableAmount').toFixed(2) + '';
        var point = availableAmount.indexOf('.');
        if (point !== -1) {
            var num = availableAmount.split('.');
            self.set({
                'intNum': num[0],
                'pointNum': num[1]
            })
        };

    },
    parseBankData: function (datas) {
        // 依据UMPBANKS的code来分组
        var BANKS = _.groupBy(UMPBANKS, function (b) {
            return b.code;
        });

        // format data
        for (var i = 0; i < datas.length; i++) {
            var o = datas[i];
            datas[i].account.imgPos = BANKS[o.account.bank][0].imgPos;
            datas[i].Faccount = o.account.account.slice(-4);
        }
        return datas;
    },
    oncomplete: function () {
        var self = this;
        this.$help = $(this.el)
            .find('.help-block');
        this.$amount = $(this.el)
            .find('[name=rechargeValue]');
        this.$form = $(this.el)
            .find('form[name=rechargeForm]');

        this.on('changeValue', function (e) {
            self.set('msg', {
                AMOUNT_NULL: false,
                AMOUNT_INVALID: false,
                CODE_NULL: false,
                CODE_INVALID: false,
            });
            var value = $(e.node)
                .val();

            if (value === '') {
                self.set('msg.AMOUNT_NULL', true);
                self.set('msg.CODE_NULL', true);
                return;
            }
            //            if (value > 10){
            //                self.set('msg.AMOUNT_NOTENOUGH',true);
            //                return;
            //            }

            if (!self.get('msg.AMOUNT_MULL')) {
                self.set('msg.AMOUNT_NULL', false);
                self.set('msg.CODE_NULL', false);
            } else {
                self.set('msg.AMOUNT_NULL', true);
                self.set('msg.CODE_NULL', true);
            }

            self.set('msg.AMOUNT_INVALID', !self.match($(e.node)
                .val()));

        });

        //去除chrome浏览器里的自动填充
        if(navigator.userAgent.toLowerCase().indexOf("chrome") != -1){
            var selectors = document.getElementsByTagName("input");
            for(var i=0;i<selectors.length;i++){
                if((selectors[i].type !== "submit") && (selectors[i].type !== "password")){
                    var input = selectors[i];
                    var inputName = selectors[i].name;
                    var inputid = selectors[i].id;
                    selectors[i].removeAttribute("name");
                    selectors[i].removeAttribute("id");
                    setTimeout(function(){
                        input.setAttribute("name",inputName);
                        input.setAttribute("id",inputid);
                    },1)
                }
            }
        }

    },

    match: function (v) {
        return v.match(/^[0-9]\d*(\.\d{0,2})?$/);
    }

});

ractive.parseData();

ractive.on('recharge_submit', function (e) {
    var amount = this.get('amount');
    var password = this.get('password');
    var bankcardNo = this.get('bankcards');
    var cardNo = bankcardNo[0].account.account;

    this.set('msg', {
        AMOUNT_NULL: false,
        AMOUNT_INVALID: false,
        AMOUNT_NOTENOUGH: false,
        CODE_NULL: false,
        CODE_INVALID: false,
    });


    if (amount === '') {
        e.original.preventDefault();
        this.$amount.focus();
        this.set('msg.AMOUNT_NULL', true);
        return false;
    } else if (!this.match(amount) || parseFloat(amount) > parseFloat(this.get('amountValue'))) {
        e.original.preventDefault();
        this.set('msg.AMOUNT_INVALID', true);
        this.$amount.focus();
        return false;
    }

    if (password === '') {
        e.original.preventDefault();
        this.set('msg.CODE_NULL', true);
        return false;
    } else {
        var self = this;
        accountService.checkPassword(password, function (res) {
            if(res){
                $('.submit_btn').text('正在充值中，请稍等...');
                request.post('/api/v2/hundsun/recharge/MYSELF')
                .type("form")
                .send({
                    amount: amount,
                    paymentPassword: password,
                    cardNo: cardNo
                })
                .end()
                .then(function (r) {
                    
                    if (r.body.success) {
                        ractive.set('step1',false);
                        ractive.set('step2',true);
                        ractive.on('close',function(){
                            window.location.href = "/newAccount/home";
                        });
                    } else {
                        alert('充值失败');   
                        $('.submit_btn').text('确认充值');
                    }
                });
            }else{
                self.set('msg.CODE_INVALID', true);
            }
        })
        return false;
    }

});

