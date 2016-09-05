'use strict';

var utils = require('ccc/global/js/lib/utils');
var UMPBANKS = require('ccc/global/js/modules/cccUmpBanks');
require('ccc/global/js/modules/cccTab');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;


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
        step3: false
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

            $.get('/api/v2/baofoo/getBankConstraints', function (r) {
                if(r.success){
                    var item= r.data;
                    for(var i=0; i< item.length; i++){
                        if(item[i].bankCode == o[0].account.bank){
                            ractive.set('singleQuota', item[i].singleQuota);
                            ractive.set('dailyQuota', item[i].dailyQuota);
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
        this.$amount = $(this.el)
            .find('[name=rechargeValue]');
        this.$form = $(this.el)
            .find('form[name=rechargeForm]');

        this.on('changeValue', function (e) {
            var singleQuota = self.get('singleQuota');

            self.set('msg', {
                AMOUNT_NULL: false,
                AMOUNT_INVALID: false,
                CODE_NULL: false,
                CODE_INVALID: false,
            });
            var value = $(e.node)
                .val();
        //console.log(value)
        //console.log(singleQuota)
            if (value === '') {
                self.set('msg.AMOUNT_NULL', true);
                self.set('msg.CODE_NULL', true);
                return;
            }
            if (value > singleQuota){
                self.set('msg.AMOUNT_INVALID',true);
                return;
            }

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
        if(navigator.userAgent.toLowerCase().indexOf("chrome") != -1 || navigator.userAgent.toLowerCase().indexOf("Safari") == -1){
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

ractive.on('recharge_submit', function (e) {
    var amount = this.get('amount');
    var password = this.get('password');
    var bankcardNo = this.get('bankcards');
    var cardNo = bankcardNo[0].account.account;
    var clientIp = CC.clientIp;

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
        myFunc()
    } else if (!this.match(amount) || parseFloat(amount) > parseFloat(this.get('singleQuota'))) {
        e.original.preventDefault();
        this.set('msg.AMOUNT_INVALID', true);
        this.$amount.focus();
        return false;
        myFunc()
    }
    if (password === '') {
        e.original.preventDefault();
        this.set('msg.CODE_NULL', true);
        return false;
        myFunc()
    } else {
        var self = this;
        $(".submit_btn").attr("disabled","true");
        accountService.checkPassword(password, function (res) {
            if(res){
                $('.submit_btn').text('正在充值中，请稍等...');
                request.post('/api/v2/baofoo/charge')
                    .type("form")
                    .send({
                        userId:CC.user.id,
                        txn_amt: amount,
                        paymentPasswd: password,
                        //cardNo: cardNo
                        clientIp: clientIp
                    })
                .end()
                .then(function (r) {

                    if (r.body.success) {
                        ractive.set('step1',false);
                        ractive.set('step2',true);
                        ractive.set('step3',false);
                        myFunc()
                    } else {
                        ractive.set('step1',false);
                        ractive.set('step2',false);
                        ractive.set('step3',true);
                        //alert('充值失败');
                        ractive.set('failError', r.error[0].message);
                        $('.submit_btn').text('确认充值');
                        myFunc()
                    }
                });
            }else{
                self.set('msg.CODE_INVALID', true);
                myFunc()
            }
        })
        return false;
    }
    function myFunc(){
        //code
        //执行某段代码后可选择移除disabled属性，让button可以再次被点击
        $(".submit_btn").removeAttr("disabled");
    }
});
