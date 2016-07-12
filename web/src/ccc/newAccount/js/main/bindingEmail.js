"use strict";

var emailRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/bindingEmail.html'),
    data: {
        step:1,
        email:'',
        errorMessage:''
    }
});
emailRactive.on("setEmail",function(event){
    var email = this.get('email');
    if (!email || !email.length) {
        emailRactive.set('errorMessage', '邮箱不能为空');
        return false;
    }
    if (!('' + email).match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
        this.set('errorMessage', '邮箱格式不正确');
        return false;
    }else {
        this.set('errorMessage', '');
        if (email == '') {
                $('.errorMessage').text('请输入邮箱!');
                $('.errorMessage').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');
            } else if (!email.match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
                $('.errors').text('请输入正确的邮箱!');
                $('.errors').css('backgroundImage','url(/ccc/register/img/gou-bg.png)');

            } else {
            $('.errorMessage').text('');
            $.post('/api/v2/users/creditEmail/MYSELF', {
                email : email
            }, function(o){
                if (o.success) {
                    alert('认证邮件已发送至您的账号为' + o.data + '的邮箱，快去认证吧！');
                    window.location.reload();
                } else {
                    alert(o.error[0].message);
                    window.location.reload();
                }
            });
        }
    }
});

emailRactive.on("resetEmail",function(){
    emailRactive.set("step",1);
});