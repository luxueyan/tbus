# @ccc/ie8fix 默认的 IE8 JS patch

## 内容

包括了 HTML5 Shiv, ES5 Shim（无 Sham）和 ExCanvas 三个 patch。

## 安装

```bash
ccnpm i --save @ccc/ie8fix
```

## 使用

在 layout 文件添加（如果有的话，应该替换掉之前 `/ccc/global/js/ie8fix.js` 的代码）：

```html
<!--[if lt IE 9]><script src="/ccc/ie8fix/js/html5-es5shim-excanvas.js"></script><![endif]-->
```
