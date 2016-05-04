'use strict';

var CommonService = require('ccc/global/js/modules/common')
    .CommonService;
var accountService = require('ccc/account/js/main/service/account')
    .accountService;
var template = require('ccc/account/partials/feedback/feedback.html');
var utils = require('ccc/global/js/lib/utils');

var feedbackRactive = new Ractive({
    el: '.feedback-ractive-container',
    template: template,
    data: {
        captcha: {
            img: '',
            token: ''
        },
        user: {
            advice: '',
            mobile: ''
        },
        errors: {
            msg: '',
            visible: 'false'
        }
    }
});
CommonService.getCaptcha(function (res) {
    feedbackRactive.set('captcha', {
        img: res.captcha,
        token: res.token
    });
});

feedbackRactive.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        feedbackRactive.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});

feedbackRactive.on('submit', function (e) {
    e.original.preventDefault();

    if (!this.get('user.advice')) {
        feedbackRactive.set('errors', {
            visible: true,
            msg: '意见不能为空'
        });
        return false;
    }

    var params = {
        userId: CC.user.id,
        name: CC.user.name,
        feedback: this.get('user.advice')
    };
    
    accountService.feedback(CC.user.id, params, function (
        res) {
        if (res.success) {
            alert('反馈成功');
            window.location.href = '/account/feedback';
        } else {
            alert('反馈失败');
        }

    });
});

// show errors
function showErrors(error) {
    feedbackRactive
        .set('errors', {
            visible: true,
            msg: utils.errorMsg[error]
        });
}


// disable errors
function disableErrors() {
    feedbackRactive
        .set('errors', {
            visible: false,
            msg: ''
        });
}