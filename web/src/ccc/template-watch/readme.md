# `@ccc/template-watch`

主动更新 ractive 模板的组件，与 `@ds/watchify@^2.2` `@ds/build@^5.1` 配合使用。

（2.0.0 为了配合 babel 使用引入了 js/dist 目录，把代码移动到这个目录了，其他未变）

## 安装

```bash
ccnpm i --save @ccc/template-watch
```

需要在 web/index.js 的 app 对象上增加 app.httpServer，用 app.httpServer 来监听 HTTP 服务。并且添加 res.expose process 如下

在 `var app = ...` 这行下面添加
```js
app.httpServer = require('http').createServer(app);
```

在 `app.use()` 的回调中添加（如果是 `@ds/base` 2.3 以上，expose 已自动添加）
```js
res.expose(process.env.NODE_ENV, 'process.env.NODE_ENV');
res.expose(process.env.NODE_APP_INSTANCE, 'process.env.NODE_APP_INSTANCE');
```

`app.listen(port, ...` 改为 `app.httpServer.listen(port, ...`

然后修改全局的 layout 文件，`{{{state}}}` 这个 `<script>` 改为

```html
<script>
    window.CC = {};
    {{{ state }}}
    window.global = window.global || window;
    window.process = window.process || CC.process;
    if(process.env.NODE_ENV === 'development'){document.write('<script src="/ccc/template-watch/js/dist/getRactiveTemplate.js"></'+'script>');}
</script>
```

浏览器端所需的代码已经打包好在 `@ccc/template-watch` 组件的 `js/dist/getRactiveTemplate.js` 文件内，开发时服务器端代码在 `@ds/watchify@2.5`，生产环境编译支持在 `@ds/build@^5.2`

## 使用

之前使用到前端模板的代码（放在各组件 `js/main/` 目录下的）里面，以 `require('ccc/abc/partials/123.html')` 引用的模板代码，改为 `getRactiveTemplate('ccc/abc/partials/123.html')` 这样即可。例：

```js
var avRactive = new Ractive({
    el: '#account-nav-wrapper',
    template: getRactiveTemplate('ccc/account/partials/accountNav.html'),
    data: {},
});
```

需要注意只对 `ccc/*/partials` 下的 html 文件有效，getRactiveTemplate 函数会检测参数是否以 `ccc/` 开头并以 `.html` 结束。

getRactiveTemplate 应该只用在 ractive 的初始化对象里。不要在其他地方使用 getRactiveTemplate()，也不要覆盖这个全局函数或者在其他对象上定义名为 getRactiveTemplate 的方法。

## 原理和注意事项

Ractive 的 template 可以接受函数为参数，而 `ractive.reset()` 会调用 template 的函数获取最新的模板（实际应该用 `ractive.reset(ractive.get())` 来保留 data 对象数据）。这样 `getRactiveTemplate()` 方法返回的是一个函数，每次调用时给出模板的最新值，再通过 websocket 获取模板文件更新的时间触发 reset 方法即可。

在 `@ds/watchify` 的 2.2 版本添加了 websocket 服务（sockjs 实现），对于生产环境，不需要 sockjes， `@ds/build` 的 5.1 以上版本会在编译打包时将 getRactiveTemplate 替换回 require 函数，像原来一样将这转换成字符串传入。
