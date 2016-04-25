'use strict';
// 弹出阴影框组件
module.exports = new MaskLayer();

function MaskLayer() {

    var config = {
        bgColor: '#000', // 遮罩层的背景颜色
        opacity: '.8', // 遮罩层的透明度
        onClick: function () {}
    };

    var self = this;
    this.options = config;
    this.maskLayerRactive = new Ractive({
        el: '#mask-layer-wraper',
        template: require('ccc/global/partials/masklayer.html'),
        data: {
            bgColor: this.options.bgColor,
            opacity: this.options.opacity,
            visible: false
        }
    });
    




     this.maskLayerRactive.on('close', function () {
        self.options.onClick();
    });
}

MaskLayer.prototype.show = function (options) {
    this.maskLayerRactive.set('visible', true);
    if ('object' === typeof options) {
        this.originalOptions = this.options;
        this.options = _.assign({}, this.options, options);
    }
};
MaskLayer.prototype.close = function () {
    this.maskLayerRactive.set('visible', false);
    if ('object' === typeof this.originalOptions) {
        this.options = this.originalOptions;
        this.originalOptions = null;
    }
};

