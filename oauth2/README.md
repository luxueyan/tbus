从 Psithurism 重写而来，推荐使用 iojs 和 pm2 最新版本。

## installation
ccnpm install @cc/oauth2

## production
node master.js

### updated at 2015-07-29
不再使用 node_redis，换用 ioredis，sentinel 的配置有相应改变，但是因为目前没有实际使用 sentinel 的客户，所以版本号只发布为 (1.6.3 升级为) 1.7.0。

只使用一个 redis 连接对象：

```js
var db = new Redis(config.redis);
```

具体的参数请参考 ioredis 的文档 https://github.com/luin/ioredis/blob/master/API.md#new_Redis ，设置普通 redis 服务器（设置 host 和 port 或者用以前的 url 字符串形式）或 sentinel（设置 sentinels 和 name，参考 https://github.com/luin/ioredis#sentinel ）均可。

对于要使用 redis cluster 的情况，ioredis 对 Cluster 的初始化是调用 new Redis.Cluster 并且是接受两个参数，为了与此兼容，在设置时 config.redis 对象设置 config.redis.clusterNodes 作为给 Redis.Cluster() 的第一个参数，删除此属性后剩下的 config.redis 对象作为第二个参数 options，所以实际的 db.js 代码是这样：

```js
if (config.redis.clusterNodes) {
    var clusterNodes = config.redis.clusterNodes;
    delete config.redis.clusterNodes;
    module.exports = new Redis.Cluster(clusterNodes, config.redis);
} else {
    module.exports = new Redis(config.redis);
}
```

### updated at 2015-04-20
不再使用 LiveScript，换回用 JavaScript 重写、精简，并且做成依赖包。
