/**
 * @file 快速还款协议
 * @author huip(hui.peng@creditcloud.com)
 */
"use strict";
var template = require('ccc/agreement/partials/quickRepay.html');
//var maskLayer = require('assets/js/lib/maskLayer');
exports.popupRepayRactive = {
    instance: false,
    init: function () {

        this.popupRepayRactive = new Ractive({
            el: '#service-agreement-wraper',
            template: template,
            data: {
                visible: false
            }
        });

        var popupRepayRactive = this.popupRepayRactive;

        // 初始化captcha
        // showCaptcha();

        popupRepayRactive.on('close', function () {
            this.set('visible', false);
            maskLayer.close();
        });                          
    },

    show: function () {
        if (!this.instance) {
            this.init();
            this.instance = true;
        }
        var popupRepayRactive = this.popupRepayRactive;
        maskLayer.show({
            onClick: function () {
                popupRepayRactive.fire('close');
            }
        });
        this.popupRepayRactive.set('visible', true);
    }
};