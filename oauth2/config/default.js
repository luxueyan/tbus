module.exports = {
    // 部署时请不要直接修改此文件，根据需要配置 config/local.js 文件覆盖，
    // 详细说明 http://gitlab.creditcloud.com/ccfe/public-docs/wikis/config
    // 或参考 config 模块的官方文档: https://github.com/lorenwest/node-config

    /* cache 与 redis/sentinel 配置
     * redis 或 sentinel 配置是必须的，选其中一个即可
     *
     * */
    redis: "redis://127.0.0.1:6379", /* 可以设置为 false，条件是先确保 sentinel 的 session 节点已设置 */

    /*
    // 当 sentinel 相关节点设置后，会优先使用 sentinel，没有节点才 fallback 到 redis，如果已设置 session，可以把 redis 设为 false
    // session 节点是必须的，如果没有 session 节点也没有 redis 会无法运行，其他节点用于缓存，可选
    "sentinel": [
      {
        "type": "COMMON", // 缓存用户信息
        "masterName": "master-7000",
        "endpoints": [{"host": "127.0.0.1", "port": 26379}],
        "opts": {}
      },
      {
        "type": "LOANRELATE", // 缓存标的相关信息
        "masterName": "master-8000",
        "endpoints": [{"host": "127.0.0.1", "port": 26380}],
        "opts": {}
      },
      {
        "type": "SESSION", // 如果设置了此节点，会将 token, captcha, rsa 存到此节点，就不需要设置 redis 了
        "masterName": "master-9000",
        "endpoints": [{"host": "127.0.0.1", "port": 26381}],
        "opts": {}
      }
    ],
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

    // 统一管理 client id/key 的服务器地址，对于自托管的客户，设置为 false
    remoteConfigPrefix: false,
    clients: [
    // clients 列表，自托管客户（remoteConfigPrefix 为 false）需要指定此项，
    // 默认有 node 端和 mobile 端两个，根据需要添加
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
    after: [], // 会添加到 endpoints 之后的 middlewares
    openApiRules: false, // 打开api代理规则(读写分离)

    // access_token过期时间(s)
    tokenExpireSeconds: 24 * 60 * 60, // 24小时

    //WWW-Authenticate
    authenticate: 'Basic realm="oauth2"',

    // 三方接入相关
    thirdParty: {
      open: false, // 是否开启三方接入验证
      mark: 'X-THIRD-PARTY', // 标识改请求为第三方请求
      devmark: 'X-DEV', // 三方开发模式标识，只在dev和uat环境有效
      client: 'X-CLIENT', // 第三方请求头携带的client id的KEY
      signExpireSeconds: 10 // 第三方验签过期时间
    }
}
