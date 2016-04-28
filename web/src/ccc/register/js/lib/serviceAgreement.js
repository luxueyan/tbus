"use strict";
exports.popupServiceAgreement = {
    instance: false,
    init: function () {

        this.popupServiceAgreementRactive = new Ractive({
            el: '#service-agreement-wraper',
            template: require('../../partials/serviceAgreement.html'),
            data: {
                visible: false
            }
        });

        var popupServiceAgreementRactive = this.popupServiceAgreementRactive;
        popupServiceAgreementRactive.on('close', function () {
            this.set('visible', false);
        });
    },

    show: function (postCloseHook) {
        if (!this.instance) {
            this.init();
            this.instance = true;
        }
        if (typeof postCloseHook === 'function') {
            var listener = this.popupServiceAgreementRactive.on(
                'close', function () {
                    postCloseHook();
                    listener.cancel();
                });
        }
        this.popupServiceAgreementRactive.set('visible', true);
    }
};