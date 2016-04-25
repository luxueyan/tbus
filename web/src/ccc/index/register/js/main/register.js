'use strict';
var RegisterRactive = require('@ccc/register').RegisterRactive;
var registerRactive = new RegisterRactive({
    el: '#register-container',
    template: require('ccc/register/partials/steps.html')
});
baconflux.store('register', 'success').onValue(function (data) {
    // 注册后自动登录
    request.post('/login/ajax', {
        body: {
            loginName: data.postedData.loginName,
            password: data.postedData.password,
        },
    }).end();
})



$('input[type=button]').click(function () {
    console.log($('.on-step-0').css('display'));
    if ($('.on-step-0').css('display') == 'block') {
        $('.register-process-graph').removeClass('register-process-graph-2');
        $('.register-process-graph').addClass('register-process-graph-1');
    } else if ($('.on-step-1').css('display') == 'block') {
        $('.register-process-graph').removeClass('register-process-graph-1');
        $('.register-process-graph').addClass('register-process-graph-2');
    } else {
        console.log('aaaaaaaa');
    }
})

CommonService.getCaptcha(function (res) {
    forgotRactive.set('captcha', {
        img: res.captcha,
        token: res.token
    });
});

forgotRactive.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        forgotRactive.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});