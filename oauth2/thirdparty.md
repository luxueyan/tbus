# 第三方接入平台流程及方法

流程：
 1. 平台会分配给第三方一个配套的client信息，包括client id和client secret，client secret即API密钥，不可泄露。
 2. 拿到client信息后，需要向平台提交第三方接入的IP或域名，那么之后的向平台发送的请求只能是从第三方备案的这个域名或IP发出的。
 3. 然后发送请求的时候，需要在请求的header里加入X-CLIENT，值为client id。
 4. 有签名验证要求的接口，需要传入计算好的签名，下文会有详细介绍
 5. 至此，就可以正常访问api了
 6. 如果接口需要登录权限，则需要用户请求注册登录接口，登录验证成功后，会返回一组User对象以及access_token，该token可用cookie或者localStorage或其他任何可信赖形式保存在客户端备用
 7. 该access_token即访问访问有权限接口的令牌，需要在发送请求的时候，在header里加入Authorization，值为'Bearer ' + access_token，注意Bearer后边后个空格，不可缺少。
 8. 或者在API地址后边加上query参数也可使令牌生效，如：/api/v2/user/info?access_token=xxx-xxx-xxxx

## 签名验证部分规则介绍

系统将对重要接口数据里边的内容进行签名验证（鉴权），确保传递的信息真实有效合法

具体方法如下:
1. 除所有要传递的参数外，再加入一个timestamp参数，即当前时间戳，然后对所有传入参数(含timestamp参数)按照字段名的ASCII码从小到大排序（字典排序）后，按照key=value的格式组成字符串string1
2. 在string1的最后拼接上sceret，即API密钥(分配给第三方的client secret)，即 string1 + 'sign=' + secret，假定结果为string2
3. 对string2做md5操作，结果记为string3，string3即计算出来的签名字符串
4. 最后将该string3作为参数一同传给api，如：domain.com/api/v2/xxx?sign=string3&timestamp=1487929017114&param1=v1&param2=v2

注意：
 1. client secret为系统分配的密钥文件，请勿明文传输，可在后端做处理
 2. timestamp也要作为参数之一传给api，同时还要加入签名计算中去
 3. 平台收到签名后，除了验证签名是否正确，还会优先验证该签名的时间是否过期，默认10秒
 4. POST和GET方法一样，都需要对参数做以上操作


------

## 另外平台OAuth部分需要有以下配置
```js
// 第三方接入平台相关配置
thirdParty: {
	// 是否开启三方接入验证
	open: true,

	// 第三方请求标识
	mark: 'X-THIRD-PARTY',

	// 第三方请求头携带的client id的KEY (第三方发起请求时需要在header里加入分配给他们的client id)
	client: 'X-CLIENT',

	// 第三方验签过期时间
	signExpireSeconds: 10
}
```

需要注意的是，平台部分需要在nginx上做第三方请求的转发，假定第三方的注册IP为xx.xx.xx.xx，
那从该IP发起的请求都需要经过nginx转发，同时请求头中附带上config.thirdParty.mark，默认为 "X-THIRD-PARTY"，值随便写


------

其他相关介绍：
- [第三方介入平台流程及方法](https://gitlab.creditcloud.com/ccfe/public-docs/wikis/%E7%AC%AC%E4%B8%89%E6%96%B9%E4%BB%8B%E5%85%A5%E5%B9%B3%E5%8F%B0%E6%B5%81%E7%A8%8B%E5%8F%8A%E6%96%B9%E6%B3%95)

- [平台接入第三方后如何设置白名单](https://gitlab.creditcloud.com/ccfe/public-docs/wikis/%E5%B9%B3%E5%8F%B0%E6%8E%A5%E5%85%A5%E7%AC%AC%E4%B8%89%E6%96%B9%E5%90%8E%E5%A6%82%E4%BD%95%E8%AE%BE%E7%BD%AE%E7%99%BD%E5%90%8D%E5%8D%95)
