var srcPath = (process.env.NODE_ENV || 'development') === 'test-cov' ? './lib-cov' : './src';
var app = exports = module.exports = require(srcPath);
var port = process.env.PORT || 4100
if (require.main === module) {
  app.listen(port, function () {
    console.log("oauth server listening at http://127.0.0.1:%d", port);
  });
}
exports.__forTest = {
    captchaModule: require(srcPath + '/endpoints/wk/captcha'),
    clients: require(srcPath + '/clients'),
    investorLimit: require(srcPath + '/investor-limit'),
};
