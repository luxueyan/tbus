module.exports = {
    // 部署时请不要直接修改此文件，根据需要配置 config/local.js 文件覆盖，
    // 详细说明 http://gitlab.creditcloud.com/ccfe/public-docs/wikis/config
    // 或参考 config 模块的官方文档: https://github.com/lorenwest/node-config

    /* cache 与 redis/sentinel 配置
     * redis 或 sentinel 配置是必须的，选其中一个即可
     *
     * */
    redis: "redis://127.0.0.1:6379",

    /*
     * redis 如果没有 redis.clusterNodes 这个属性，会整个传给 ioredis 的 constructor，参考
     * ioredis 的 README.md https://github.com/luin/ioredis
     * 和 API.md https://github.com/luin/ioredis/blob/master/API.md#new_Redis
     * README.md 的 sentinel 一节说明了如何设置 sentinel
     *
     * 如果要使用 redis cluster
     * 把 redis.clusterNodes 设置为 startupNodes，
     * 其他属性会作为 options 的属性传给 Redis.Cluster 作为第二个参数
     */

    /* sentinel 示例配置
    redis: {
        sentinels: [{ host: 'localhost', port: 26379 }, { host: 'localhost', port: 26380 }],
        name: 'mymaster'
    },
    */

    /* cluster 示例配置
    redis: {
        clusterNodes: [
            {
                port: 6380,
                host: '127.0.0.1'
            },
            {
                port: 6381,
                host: '127.0.0.1'
            },
        ],
        maxRedirections: 20,
    },
    */

    investorLimit: 1000, // 在调用 tenderNoPwd 接口投标时限流，在一秒钟内超过这个数，则不会请求到后端，直接返回 TOO_CROWD 错误
    // 各项的缓存的开关
    cache: {
        tender: false, // 投标的预先判断优化，与 investorLimit 结合使用
        context: false,
        project: false,
        user: false,
        userstat: false,
        loan: false,
        cms: false
    },
    // 各项的缓存的过期时间（秒）,设为 false 会 fallback 到 cacheExpireSeconds
    ttlCache: {
        context: 3600,
        project: 600,
        user: 1800,
        userstat: 60,
        loan: 600,
        cms: 1800
    },
    cacheExpireSeconds: 3600,

    // 后端 API 接口
    // 公网应该只可访问 Psithurism 的接口，防火墙应该挡掉后端端口，后端接口假设所以调用者都是可信的
    proxy: {
        worker: "http://spt.creditcloud.com/Worker",
        market: "http://127.0.0.1:8888",
        manager: "http://127.0.0.1:8080/admin"
    },

    clients: [
    // clients 列表，默认有 node 端和 mobile 端两个，根据需要添加
    {
        name: "node",
        id: "client-id-for-node-dev",
        secret: "client-secret-for-node-dev",
    },
    {
        name: "mobile",
        id: "client-id-for-mobile-dev",
        secret: "client-secret-for-mobile-dev"
    }
    ],
    exchanges: [ // oauth 验证方式
        "client",
        "password"
    ],
    additionalEndpoints: [], //对单个客户附加的 endpoints
    before: [ // 会添加到 endpoints 之前的 middlewares
        "./ccat",
        "./remove-jsessionid-cookie",
        "./myself"
    ],
    after: [] // 会添加到 endpoints 之后的 middlewares
}
