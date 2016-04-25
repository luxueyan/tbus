# oauth2 changelog since 1.10.0 2015-11-12

## 1.10.2
继续解决 1.10 的 bug，添加更多测试

## 1.10.1
修改 1.10.0 的 bug，img captcha 错误时会拦截，添加了测试，通过

## 1.10.0

修改统一可用的 GET /api/v2/users/smsCaptcha 接口

这个接口作用同 GET /api/v2/register/smsCaptcha 这个我们一直在用的注册手机号验证码发送接口，实际上是 /api/v2/register/smsCaptcha 接口实际调用的 /api/v2/users/smsCaptcha，而 /api/v2/users/smsCaptcha 这个接口没有在用，所以此次修改后利用起 /users/ 下的这个接口来，而废弃原先的 /register/ 下接口，出于兼容性考虑，未来新客户在 nginx 禁用 /register/ 下的接口而只开放 /users/ 接口。

这个接口实现了一般情况下不需要图片验证码，可直接发送短信，紧急情况下可以在 redis 设置 `setex setting:imgCaptchaRequiredToGetSmsCaptcha 1 7200` 来强制要求使用图片验证码两个小时，也可以在配置上设置 imgCaptchaRequiredToGetSmsCaptcha: true 这一项来确保每次调用此接口时都需要使用图片验证码。

接口参数（query）：正常状态只需要 mobile，特殊情况需要另外两项
* mobile: 手机号
* captcha_token: image captcha token
* captcha_answer: image captcha answer

调试时，可以再加一个 imgCaptchaRequired=1 参数在 url 上确保模拟设置上必须图片验证码。

这样接口行为在只给出 mobile 参数的时候会有不同的反应，有可能通过，有可能返回 403 表示此时接口需要使用图片验证码才能调用。UI 设计上可以先不展示图片验证码，在直接调用时接口 403 的时候再提醒用户必须使用图片验证码来发送验证短信。403 时接口的返回内容为

```js
{ data: null,
  error:
   [ { message: 'IMG_CAPTCHA_REQUIRED',
       type: 'captcha',
       value: null,
       code: 0 } ],
  success: false }
```

因此也可以通过 error[0].message === 'IMG_CAPTCHA_REQUIRED' 来判断
