'use strict';
var CommonService = require('ccc/global/js/modules/common').CommonService;
var captChaImg = $('.captcha-img');
var captcha = {};


getCaptCha();

$('.change-captcha').on('click', function (e) {
    e.preventDefault();
    getCaptCha();
});

//$("[name = checkbox]").attr("checked", true);

function getCaptCha() {
    CommonService.getCaptcha(function (data) {
        captcha = data;
        captChaImg.attr('src', data.captcha);
    });
}

//var loginRac = new Ractive({
//    el: $('.s-login-view'),
//    template: require('ccc/login/partials/login.html'),
//    data: {
//        captcha:{
//            img: '',
//            token: ''
//        }
//    }
//});
//CommonService.getCaptcha(function (res) {
//    loginRac.set('captcha', {
//        img: res.captcha,
//        token: res.token
//    });
//});
//loginRac.on('change-captcha',function(){
//    CommonService.getCaptcha(function (res) {
//        loginRac.set('captcha', {
//            img: res.captcha,
//            token: res.token
//        });
//    });
//});

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
        USER_DISABLED: '帐号密码错误次数过多，您的帐户已被锁定，请联系客服400-7566-688解锁。',
        FAILED: '你输入的账户名或密码错误。请重新输入！您也可以找回登录密码。',
        TOO_MANY_ATTEMPT: '密码输入次数过多，该用户已被禁用'
    };

    if ($postBtn.hasClass('disabled')) {
        return;
    }

    $postBtn.addClass('disabled').html('登录中...');

    request.post('/api/web/login').type('form').send($this.serialize()).end().get('body').then(function (r) {
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
            $error.html('<p class="login-error">'+errorMaps[r.error_description.result]+'</p>');
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
