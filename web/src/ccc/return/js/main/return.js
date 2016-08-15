"use strict";

var ractive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/return/partials/authenticateEmail.html'),
    data: {
        step: 1,
    },
    oninit:function(){
        var code=GetQueryString('code');
        var email=GetQueryString('email');
        console.log(code);
        console.log(email);
        request('POST', '/api/v2/user/authenticateEmail')
            .send({code:code,email:email})
            .end()
            .then(function (r) {
                if(r.success){
                    ractive.set('step',1);
                }
                else{
                    ractive.set('step',2);
                }
                console.log(r);
                setTimeout(function(){window.location.href="/newAccount/home/index"},5000)
            });
    }
});
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return (r[2]); return null;
}