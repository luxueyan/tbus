# 通用注册组建

安装后可以使用 `require('@ccc/register').RegisterRactive`, 参考 `/js/main/register-example{1,2,3}.js` 这三个文件，如 `register-example1.js`：

```js
'use strict';
var RegisterRactive = require('@ccc/register').RegisterRactive;
var registerRactive = new RegisterRactive({
    el: '#register-container',
    template: require('ccc/register/partials/steps-example1.html'),
});
```

需要自己实现 steps 这个 partial, 主要参考模板里的 steps-example{1,2,3}.html 这三个。用 <Step> 表示步骤，用 <RInput> 表示填写字段区块，注意前面几步是填写，最后一步是显示成功的画面。在倒数第二步点击下一步时会提交整个表单，注册成功才转到最后一步。

`<Step>` 会 wrap 一个 `<form>` 并且处理这个 form 的 submit 事件，RInput 没有加任何 wrap，只是相当于在模板中做了一个命名空间（每个 `<RInput>` 里面有自己的 `{{value}}` `{{loading}}` 等）

`steps-example1.html` 是最简单的一步提交的例子，在 2 和 3 里做了两步提交，两个的字段在这两部中正好相反。

`register-example.2.js` 还演示了如何扩展或重写字段的验证逻辑，验证和提示消息暴露在了 `require('@ccc/register').validation` 和 `require('@ccc/register').errmsgs` 上，设置它们的对象属性即可改写。
