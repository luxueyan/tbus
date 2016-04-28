/**
 * @file 长江财富服务规则的交互逻辑层
 * @author lilulu(lilulu@hanhua.com)
 */

"use strict";
var maskLayer = require('ccc/global/js/lib/maskLayer');
exports.popupRegistAgreement = {
    instance: false,
    init: function () {

        this.popupRegistAgreementRactive = new Ractive({
            el: '#regist-agreement-wraper',
            template: require('../../partials/registAgreement.html'),
            data: {
                visible: false
            }
        });

        var popupRegistAgreementRactive = this.popupRegistAgreementRactive;

        // 初始化captcha
        // showCaptcha();

        popupRegistAgreementRactive.on('close', function () {
            this.set('visible', false);
            maskLayer.close();
        });
    },

    show: function (postCloseHook) {
        var popupRegistAgreementRactive = this.popupRegistAgreementRactive;
        if (!this.instance) {
            this.init();
            this.instance = true;
        }
        if (typeof postCloseHook === 'function') {
            var listener = this.popupRegistAgreementRactive.on(
                'close', function () {
                    postCloseHook();
                    listener.cancel();
                });
        }
        maskLayer.show({
            onClick: function () {
                popupRegistAgreementRactive.fire('close');
            }
        });
        this.popupRegistAgreementRactive.set('visible', true);
    }
};