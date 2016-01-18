
CreditCloud to B Service Mobile Web (aka _H5_) Guide
====================================================



Development
-----------

0. 安装 [Node.js](https://nodejs.org) 开发环境
0. 命令行里进入 `mobile/dev` 文件夹
0. 执行 `npm run -s init`
0. 修改 `router.coffee` 内的 `API_SERVER` 变量，使其指向实际的后台服务器地址（本地或远程地址均可）

以上各步骤只需要执行**一次**，待正确完成后，**日常开发**只需要执行 `npm start` 启动测试环境，然后访问 _http://localhost:4000_ 开始测试

> 如需更换侦听端口至 8000，可用 `npm start -- -p 8000` 指定端口号



Deployment
----------

> Unix 或 Linux 平台

0. 安装 [Node.js](https://nodejs.org) 开发环境
0. 进入 `mobile` 文件夹
0. 执行 `./build.sh` 编译静态文件

完毕后会在该目录下生成 `dist` 文件夹，内含待部署的目标文件
