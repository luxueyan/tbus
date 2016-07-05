"use strict";
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/risk.html'),

    data: {
        showBasic:true,
        currentTab:'basic',
        expand: true,
        bindMsg: null,
        unbindMsg: null,
        agreement: typeof CC.user.accountId === 'undefined' ? false : CC.user.agreement,
        accountId: CC.user.agreement ? CC.user.agreement : false,
        mobile: formatNumber(CC.user.mobile),
        idNumber: false,
        paymentPasswordHasSet : CC.user.paymentPasswordHasSet || false,
        email: false,
        percent: 25,
        levelText:'弱',
        isEnterprise: CC.user.enterprise
    },
    init: function() {
        var percent = 25;
        var isEnterprise  = this.get('isEnterprise');

        accountService.getUserInfo(function (userinfo) {
            //基本信息
            if (isEnterprise) {
               
                if (CC.user.paymentPasswordHasSet) {
                    percent = 100;
                    ractive.set('percent',percent);
                    ractive.set('levelText','高');
                } else {
                    percent = 50;
                    ractive.set('percent',percent);
                    ractive.set('levelText','中');
                }
            } else {
                if (userinfo.user.idNumber) {
                    var idNumber = formatNumber(userinfo.user.idNumber, 4, 4);
                    ractive.set('idNumber', idNumber);
                    percent += 25;
                }
                if (CC.user.paymentPasswordHasSet) {
                    percent += 25;
                }
                if (userinfo.user.email && userinfo.user.email != 'notavailable@qilerong.com' && userinfo.user.email != 'notavailable@creditcloud.com') {
                    var arr = userinfo.user.email.split('@');
                    var length = arr[0].length;
                    if (length > 4) {
                        var email = arr[0].substring(0,4) + (new Array(length-3)).join('*') + "@" + arr[1];
                    } else if (length == 1) {
                        var email = "*" + "@" + arr[1];
                    } else {
                        var email = arr[0].substring(0,1) + (new Array(length)).join('*') + "@" + arr[1];
                    }
                    ractive.set('email', email);
                    percent += 25;
                }
                ractive.set('percent',percent);
                if (percent > 25 && percent <= 75) {
                    ractive.set('levelText','中');
                } else if (percent > 75) {
                    ractive.set('levelText','高');
                }
            }
            //更多信息
            if (userinfo.career) {
                ractive.set('isSave',true);
            }
            if (userinfo.personal) {
                if(userinfo.personal.male){
                     ractive.set('male', '男');
                }else{
                    ractive.set('male','女');
                }
               
            }
            if (userinfo.personal && userinfo.personal.education && userinfo.personal.education.educationLevel) {
                ractive.set('educationLevel', userinfo.personal.education.educationLevel)
            }
            if (userinfo.career && userinfo.career.company && userinfo.career.company.industry) {
                ractive.set('companyIndustry', userinfo.career.company.industry);
            }
            if (userinfo.career && userinfo.career.salary) {
                ractive.set('salary', userinfo.career.salary)
            }
            if (userinfo.personal && userinfo.personal.maritalStatus) {
                ractive.set('maritalStatus', userinfo.personal.maritalStatus)
            }
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

$(function (){
    $(".goRz").click(function (e){
        e.preventDefault();
        $('.rzz').toggle();
    });

    $(".rzE_button").click(function (){
        var email = $('.rZemail').val();
        if (email == '') {
            $('.errors').text('请输入邮箱!');
            $('.errors').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');
        } else if (!email.match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
            $('.errors').text('请输入正确的邮箱!');
			$('.errors').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');

        } else {
            $('.errors').text('');
            $.post('/api/v2/users/creditEmail/MYSELF', {
                email : email
            }, function(o){
                //console.log(o);
                if (o.success) {
                    alert('认证邮件已发送至您的账号为' + o.data + '的邮箱，快去认证吧！');
                    window.location.reload();
                } else {
                    alert(o.error[0].message);
                    window.location.reload();
                }
            });
        }
    });
});

ractive.on('submit',function() {
    var male = $('#male').val();
    var companyIndustry  = this.get('companyIndustry');
    var educationLevel = this.get('educationLevel');
    var salary = this.get('salary');
    var maritalStatus  = this.get('maritalStatus');
    accountService.updatePersonalInfo(male,educationLevel,maritalStatus,function(r) {
        if (!r.error) {
            accountService.updateCareerInfo(companyIndustry,salary,function(r) {
                console.log(r);
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
           
