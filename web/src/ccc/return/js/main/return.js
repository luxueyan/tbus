"use strict";

var statusMap = {
    SUCCESSFUL: '',//成功
    UNSUCCESSFUL: '',//失败
    EXPIRED: '激活链接已失效',
    AUTHENTICATED: '该邮箱已绑定'
};
var ractive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/return/partials/authenticateEmail.html'),
    data: {
        step: 1,
        message:""
    },
    oninit:function(){
        var code=GetQueryString('code');
        var email=GetQueryString('email');

        request('POST', '/api/v2/user/authenticateEmail')
            .send({code:code,email:email})
            .end()
            .then(function (r) {
                if(r.ConfirmResult=="SUCCESSFUL"){
                    ractive.set('step',1);

                }
                else{
                    ractive.set('step',2);
                    ractive.set('message',statusMap[r.ConfirmResult]);
                }
                setTimeout(function(){window.location.href="/newAccount/home/index"},5000)
            });
    }
});
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return (r[2]); return null;
}