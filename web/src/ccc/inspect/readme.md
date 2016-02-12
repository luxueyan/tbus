# `@ccc/inspect` - 检测当前测试、开发环境状态的工具

用于显示当前服务器状态及主要配置，提高查错效率。

## installation

```bash
ccnpm i --save @ccc/inspect
```

## usage

添加 window.process 变量，参考 [@ccc/template-watch](http://npm.creditcloud.com/package/@ccc/template-watch) 文档，之后在 global layout 的 script 内（在 window.process 变量后面）添加一行：

```js
if(process.env.NODE_ENV === 'development' || process.env.NODE_APP_INSTANCE === 'uat'){document.write('<script src="/ccc/inspect/js/main/inspect.js"></'+'script>');}
```

这样就会在所有页面左下角显示当前的主要信息，只在开发环境和测试环境显示。

另外安装这个组建后，可以访问 `/.inspect` 这个地址，看到目前的所有服务器端模板，主要用于开发静态页面阶段。

`/.inspect/ajax/config` 这个地址会返回当前配置的 JSON
