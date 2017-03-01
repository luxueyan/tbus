## 第三方接入平台白名单介绍

第三方接入平台后，平台需要给第三方配置开放接口的白名单，加入白名单的接口才会允许第三方访问

具体方法如下：

```js
module.exports = [
  {
    // 接口地址
    url: '/api/test',
    // 接口方法
    method: 'GET',
    // 是否需要校验签名
    signature: true
  },
  {
    url: '/api/v2/user/:userId/resetMobile',
    method: 'POST',
    signature: true
  }
];
```

-------

注意，白名单是额外的api list，如果是新添加的接口，还需要再additional-endpoints.js里添加路由
