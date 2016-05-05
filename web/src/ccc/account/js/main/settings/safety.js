'use strict';
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/safety.html'),

    data: {
        expand: true,
        bindMsg: null,
        unbindMsg: null,
        //activatedCard: !!CC.user.bankCards.length,
        agreement: typeof CC.user.accountId === 'undefined' ? false : CC.user
            .agreement,
        accountId: CC.user.agreement ? CC.user.agreement : false,
        mobile: formatNumber(CC.user.mobile),
        activatedEmail: CC.user.authenticates.emailAuthenticated,
        paymentPasswordHasSet : CC.user.paymentPasswordHasSet || false
    }
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
