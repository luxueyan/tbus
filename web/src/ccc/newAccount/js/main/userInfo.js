"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/userInfo.html'),

    data: {
        showBasic:true,
        currentTab:'basic',
        expand: true,
        bindMsg: null,
        unbindMsg: null,
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
                ractive.set('mobile', formatNumber(userinfo.userInfo.user.mobile));
            });
        });
    },
});

//ractive.init();

ractive.on('changeTab', function (event) {
	var tab = event.node.getAttribute('data-tab');
	if (tab !== this.get('currentTab')) {
		this.set('currentTab', tab);
		this.set('showBasic', !this.get('showBasic'));
	}
});

ractive.on('updateInfo', function () {
    this.set('isSave', false);
});
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

//$(function (){
//    $(".goRz").click(function (e){
//        e.preventDefault();
//        $('.rzz').toggle();
//    });
//
//    $(".rzE_button").click(function (){
//        var email = $('.rZemail').val();
//        if (email == '') {
//            $('.errors').text('请输入邮箱!');
//            $('.errors').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');
//        } else if (!email.match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
//            $('.errors').text('请输入正确的邮箱!');
//			$('.errors').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');
//
//        } else {
//            $('.errors').text('');
//            $.post('/api/v2/users/creditEmail/MYSELF', {
//                email : email
//            }, function(o){
//                //console.log(o);
//                if (o.success) {
//                    alert('认证邮件已发送至您的账号为' + o.data + '的邮箱，快去认证吧！');
//                    window.location.reload();
//                } else {
//                    alert(o.error[0].message);
//                    window.location.reload();
//                }
//            });
//        }
//    });
//});

ractive.on('submit',function() {
    var male = $('#male').val();
    var companyIndustry  = this.get('companyIndustry');
    var educationLevel = this.get('educationLevel');
    var salary = this.get('salary');
    var maritalStatus  = this.get('maritalStatus');
    accountService.updatePersonalInfo(male,educationLevel,maritalStatus,function(r) {
        if (!r.error) {
            accountService.updateCareerInfo(companyIndustry,salary,function(r) {
                //console.log(r);
                if (!r.error) {
                    alert('信息编辑成功');
                    window.location.reload();
                } else {
                   alert('信息编辑失败,请稍后重试！'); 
                }   
            });
        } else {
             alert('信息编辑失败,请稍后重试！'); 
        }
    });
    return false;
});
           
