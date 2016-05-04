'use strict';
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/userInfo.html'),

    data: {
        loginName:CC.user.loginName,
        name:CC.user.name,
        mobile:formatNumber(CC.user.mobile),
        email:CC.user.email,
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

