'use strict';
module.exports = {
    weixinmp: { // 微信公共帐号绑定的相关配置
        appid: '...',
        secret: '...',
        token: 'creditcloud',
        useUnionId: false, // 默认只使用 openId，打开此配置可获取 unionId
        defaultBackUrl: '/account',
    },
};
