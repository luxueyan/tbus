"use strict";
require('ccc/global/js/modules/cccTab');
var utils = require('ccc/global/js/lib/utils');
var CccOk = require('ccc/global/js/modules/cccOk');
var accountService = require('../service/account').accountService;

var CommonService = require('ccc/global/js/modules/common.js').CommonService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/paypwd.html'),

    data: {
        paymentPasswordHasSet : CC.user.paymentPasswordHasSet || false,
        step : '0'
    }
});

ractive.on('initialPassword', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    var isAcess = false;
    if (pwd === '') {
        showError('交易密码不能为空');
    } else if (rePwd === '') {
        showError('交易密码不能为空');
    } else if (pwd !== rePwd) {
        showError('两次密码输入不一致');
    } else {
        isAcess = true;
    }

    if(isAcess) {
        accountService.initialPassword(pwd, function (r) {
            if (r.success) {
                CccOk.create({
                    msg: '交易密码初始化成功！',
                    okText: '确定',
                    // cancelText: '重新登录',
                    ok: function () {
//                        window.location.reload();
                        window.location.href = '/newAccount/recharge'
                    },
                    cancel: function () {
                        window.location.reload();
                    }
                });
                return;
            }
        });
    } 
});

ractive.on('updatePassword', function () {
    var oldpwd = this.get('oldPassword');
    var newPwd = this.get('newPassword');
    var reNewPwd = this.get('reNewPassword');
    var isAcess = false;
    if (oldpwd === '') {
        showError('原密码不能为空');
    } else if (newPwd === '' || reNewPwd === '') {
        showError('交易密码不能为空');
    } else if (oldpwd == newPwd) {
        showError('新密码原密码不能相同！');
    } else if (newPwd !== reNewPwd) {
        showError('两次密码输入不一致');
    }else if(newPwd.indexOf(' ')>-1){
        showError('含有非法字符:空格');
    }else {
        isAcess=true;
    }
    
   
    if(isAcess) {
         accountService.checkPassword(oldpwd,function(r){
        if(!r){
            showError("原始密码错误！");
           
        }else{
           
         accountService.updatePassword(oldpwd, newPwd, function (r) {
            if (r.success) {
                CccOk.create({
                    msg: '交易密码修改成功！',
                    okText: '确定',
                    // cancelText: '重新登录',
                    ok: function () {
                        window.location.reload();
                    },
                    cancel: function () {
                        window.location.reload();
                    }
                });
                return;
            }
        });
        }
        
    });
        
    } 
});

ractive.on('resetPassword', function () {
    var pwd = this.get('password');
    var isAcess = false;
    if (pwd === '') {
        var r = confirm('您未输入重置密码，系统将生成随机的交易密码并发送到您的手机上,确定这样做吗？');
        if (r) {
            isAcess = true;
        }
    } 
    
     if (pwd.indexOf(" ") >=0) {
        return showError("密码不能为空格");
    }
    else {
        isAcess = true;
    }

    if(isAcess) {
        accountService.resetPassword(pwd, function (r) {
            if (r) {
                CccOk.create({
                    msg: '交易密码重置成功！',
                    okText: '确定',
                    // cancelText: '重新登录',
                    ok: function () {
                        window.location.reload();
                    },
                    cancel: function () {
                        window.location.reload();
                    }
                });
                return;
            }
        });
    } 
});

ractive.on('tab', function (event) {
    var step = event.node.getAttribute('data-step');
    ractive.set('step', step);
});

function showError(msg) {
    ractive.set({
        showErrorMessage: true,
        errorMessage: msg
    });

    return false;
}
$("#newPassword").keyup(function(){
    var newPassword=$("#newPassword").val(); 
    if(newPassword.indexOf(' ')>-1){
        showError("含有非法字符:空格");
    }else{
        ractive.set({
           showErrorMessage: false 
        });
    }
    
});
$("#oldPassword").blur(function(){
    var oldPassword=$("#oldPassword").val().trim();
    
    accountService.checkPassword(oldPassword,function(r){
        if(!r){
            showError("原始密码错误！");
        }else{
            ractive.set({
           showErrorMessage: false 
        });
        }
        
    });
    
});

