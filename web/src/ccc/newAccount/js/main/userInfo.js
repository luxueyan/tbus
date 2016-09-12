"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/userInfo.html'),

    data: {
        agreement: typeof CC.user.accountId === 'undefined' ? false : CC.user.agreement,
        accountId: CC.user.agreement ? CC.user.agreement : false,
        idNumber: false,
        email: '',
        percent: 25,
        levelText:'弱',
        isEnterprise: CC.user.enterprise,
        bankCards:CC.user.bankCards,
    },
    init: function() {
        accountService.checkAuthenticate(function (r) {
            ractive.set('paymentPasswordHasSet', r.paymentAuthenticated);
            accountService.getUserInfo(function (userinfo) {
                console.log(r.emailAuthenticated);
                if(r.emailAuthenticated){
                    ractive.set('email', userinfo.userInfo.user.email);
                }
                ractive.set('idNumber', formatNumber(userinfo.userInfo.user.idNumber));
                ractive.set('name', formatNumber(userinfo.userInfo.user.name));
                ractive.set('mobile', formatNumber(userinfo.userInfo.user.mobile));
            });
        });
    },
});

//ractive.init();

function formatNumber(number, left, right) {
    if (!number) {
        return '';
    }
    left = left || 3;
    right = right || 4;
    var tmp = '';
    for (var i = 0; i < number.length; i++) {
        if (i < left || (number.length - right) <= i) {
            tmp += number[i];
        } else {
            tmp += '*';
        }
    }
    return tmp;
}

//删除银行卡
ractive.on('delete-card',function() {
    var userId = CC.user.id;
    var banks = this.get('bankCards');
    var avaAmount = CC.user.availableAmount;
    var frozenAmount = CC.user.frozenAmount;
    var outstandingInterest = CC.user.outstandingInterest;
    var outstandingPrincipal = CC.user.outstandingPrincipal;
    var totalAmount = parseFloat(avaAmount + frozenAmount + outstandingInterest + outstandingPrincipal).toFixed(2);
    var accountNumber = banks[0].account.account;
    var params = {
        userId:userId,
        accountNumber:accountNumber
    }
    if(totalAmount>0){
        alert('1、您的平台总资产还有资金(含在投资金和未提现资金)，为保证您的资金安全，暂时不允许通过线上删除银行卡；2、如有疑问，请联系客服：400-900-8868');
        window.location.reload();
    }else{
        accountService.deleteBank(params,function(r) {
            if (r.success) {
                alert('删卡成功！');
                window.location.reload();
            } else {
                alert('删卡失败！');
            }
        });
    }

});
           
