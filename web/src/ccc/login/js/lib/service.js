/**
 * @file 登录控件的数据交互层
 * @author huip(hui.peng@creditcloud.com)
 */

'use strict';
// var request = require('cc-superagent-promise');
exports.LoginService = {
    //checkLoginName: function (loginName, next) {},
    doLogin: function (loginName, password, next) {
        request
            .post('/login')
            .type('json')
            .send({
                loginName: loginName,
                password: password
            })
            .end()
            .then(function (res) {
                next(res.body && res.body.error ? res.body.error : null,
                    res.body);
            });
    }
};
