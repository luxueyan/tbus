'use strict';
var CommonService = require('ccc/global/js/modules/common').CommonService;

var errorRac = new Ractive({
    el: $('.error-wrap'),
    template: require('ccc/login/partials/error.html'),
    data: {
        error: null
    }
});

$('#loginForm').submit(function (e) {
    var $this = $(this);
    e.preventDefault();
    var $loginName = $('input[name=loginName]');
    var $password = $('input[name=password]');
    var $postBtn = $('#login_button');
    var $errorMobile = $('.mobile');
    var $errorPwd = $('.password');
    var $error = $('.loginlock');

    $errorMobile.empty();
    $errorPwd.empty();
    $error.empty();

    if ($loginName.val() === '') {
        $errorMobile.text('手机号不能为空');
        return;
    }
    if ($password.val() === '') {
        $errorPwd.text('密码不能为空');
        return;
    }

    var errorMaps = {
        USER_DISABLED: '帐号密码错误次数过多，您的帐户已被锁定，请联系客服400-900-8868解锁。',
        FAILED: '帐号或密码错误，请重新输入，',
        TOO_MANY_ATTEMPT: '帐号密码错误次数过多，您的帐户已被锁定，请联系客服400-900-8868解锁。'
    };

    if ($postBtn.hasClass('disabled')) {
        return;
    }

    $postBtn.addClass('disabled').html('登录中...');

    request.post('/api/web/login').type('form').send($this.serialize()).end().get('body').then(function (r) {
        console.log($this.serialize())
        if (r.success) {
            console.log('--', r)
            $postBtn.text('登录成功');
            var url = /(loan)/;
            if (url.test(document.referrer)) {
                location.href = document.referrer;
                return;
            }
            if (r.user.enterprise) {
                location.pathname = "/newAccount/home";
            } else {
                location.href = (r.redirect) ? r.redirect : '/';
            }
        } else {
            //console.log(r.error_description);
            if(r.error_description.failedAttempts == 0 || r.error_description.failedAttempts == 5){
                $error.html('<p class="login-error">'+errorMaps[r.error_description.result]+'</p>');
            }else if(r.error_description.failedAttempts<4){
                var num = 5-r.error_description.failedAttempts;
                $error.html('<p class="login-error">'+errorMaps[r.error_description.result]+'您还有'+ num +'次机会' +'</p>');
            }else if(r.error_description.failedAttempts<5){
                $error.html('<p class="login-error">'+'您还有最后1次机会，再次失败账户将被锁定'+'</p>');
            }
            $postBtn.removeClass('disabled').text('登录');
        }
    });

    return false;
});

request.get(encodeURI('/api/v2/cms/category/IMAGE/name/登录')).end().then(function (res) {
    var count = new Ractive({
        el: '.loginBanner',
        template: '{{#each items}}<a href="{{url}}" target="_blank"><img src="{{content}}"/></a>{{/each}}',
        data: {
            items: res.body
        }
    });
});
