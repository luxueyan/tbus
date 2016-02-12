# changelog

## 1.4.0 2015-08-30

修改一下配置项，不需要再配置 `config.payment`，之前是 `config.payment.pnr` 下有 postUrl 和 protocol 两项，现在这整个 payment 配置都不需要了。与微信公众号对接的组件新增了配置 `config.useHttps` 表示平台（或测试环境）是否使用了 https。现在 payment 这也使用 `config.useHttps` 代替之前的 `config.payment.pnr.protocol` 配置。另一个 postUrl 这个配置通过判断 `NODE_APP_INSTANCE` 环境变量是否为 `'uat'` 来决定用两个默认配置中的一个。这个 `postUrl` 还是可以设置覆盖的，protocol 会以 `config.useHttps` 的配置相兼容。所以对老项目的配置无影响，新项目只需要设置 `config.useHttps` 即可，不需要 `config.payment`。
