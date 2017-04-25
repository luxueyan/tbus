'use strict';
/**
 * 第三方接入白名单
 * @type {Array}
 *
 * 每项有三个参数
 *    url: 接口地址
 *    method: 接口方法 (GET/POST)
 *    signature: 是否需要签名验证 (true/false)
 */
module.exports = [
  // API白名单书写样例
  {
    // 接口地址
    url: '/api/v2/test/:param1/:param2',
    // 接口方法
    method: 'GET',
    // 是否需要校验签名 true/false
    signature: true
  },

  {
    url: '/api/v2/register/check_mobile',
    method: 'POST',
    signature: true
  },

  // 获取图片验证码
  {
    url: '/api/v2/captcha',
    method: 'GET',
    signature: false
  },
  // 验证图片验证码
  {
    url: '/api/v2/captcha',
    method: 'POST',
    signature: false
  },
  // 发送短信验证码
  {
    url: '/api/web/register/smsCaptcha',
    method: 'POST',
    signature: false
  },

  // 注册账号
  {
    url: '/api/v2/users/register',
    method: 'POST',
    signature: true
  },

  // 登录
  {
    url: '/api/v2/token',
    method: 'POST',
    signature: true
  },

  // 充值
  {
    url: '/api/v2/baofoo/charge',
    method: 'POST',
    signature: true
  },

  // 提现
  {
    url: '/api/v2/baofoo/withdraw/:userId',
    method: 'POST',
    signature: true
  },

  // 主动投标
  {
    url: '/api/v2/invest/tender/:userId',
    method: 'POST',
    signature: true
  },

  // 个人账户信息
  {
    url: '/api/v2/user/:id/statistics/invests',
    method: 'POST',
    signature: true
  },

  // 产品列表
  {
    url: '/api/v2/loans/getLoanWithPage',
    method: 'GET',
    signature: true
  },

  // 产品详情
  {
    url: '/api/v2/loan/:loanId/detail',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/paymentPasswordHasSet',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/validatePaymentPassword',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/setPaymentPassword',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/updatePaymentPassword',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/resetPaymentPassword',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/investDynamic/:investId',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/reward/getReferUserCountAndReward/:userId',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/banks',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/checkCard/sendSmsCaptcha/:mobile',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/register/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/checkCard/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/bindCard/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/cancelCard/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/hundsun/setDefaultAccount/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/coupon/:userId/redeemCouponIgnoreApproval',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/baofoo/getBankConstraints',
    method: 'GET',
    signature: true
  },

  // 账户中心我要投资接口
  {
    url: '/api/v2/user/MYSELF/invests/list/:page/:size',
    method: 'GET',
    signature: true
  },

  // 根据用户ID获取可用奖券列表
  {
    url: '/api/v2/rebateCounpon/listUserCouponPlacement/:userId',
    method: 'GET',
    signature: true
  },

  // 实名认证
  {
    url: '/api/v2/user/:userId/checkId',
    method: 'POST',
    signature: true
  },

  // 银行卡验证
  {
    url: '/api/v2/user/checkBankcard',
    method: 'POST',
    signature: true
  },

  // 充值
  {
    url: '/api/v2/baofoo/recharge/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/baofoo/charge',
    method: 'POST',
    signature: true
  },

  // 取现
  {
    url: '/api/v2/baofoo/withdraw/:userId',
    method: 'POST',
    signature: true
  },

  // 好友数目与红包数量
  {
    url: '/api/v2/reward/getReferUserCountAndReward/:userId',
    method: 'GET',
    signature: true
  },

  // 邮箱绑定
  {
    url: '/api/v2/user/bindEmail',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/authenticateEmail',
    method: 'POST',
    signature: true
  },

  // 问卷调查
  {
    url: '/api/v2/user/:userId/surveyFilling',
    method: 'POST',
    signature: true
  },

  // 转让总金额和总笔数
  {
    url: '/api/v2/creditassign/stat/total',
    method: 'GET',
    signature: true
  },

  // 转让成交记录
  {
    url: '/api/v2/creditassign/stat/list',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/creditassign/list/allInvests',
    method: 'GET',
    signature: true
  },

  // 修改手机号
  {
    url: '/api/v2/user/:userId/resetMobile',
    method: 'POST',
    signature: true
  },

  // 债转列表
  {
    url: '/api/v2/creditassign/list/filter',
    method: 'GET',
    signature: true
  },

  // 债转购买接口
  {
    url: '/api/v2/creditassign/autoAssign/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/invest/user/:userId/creditAssign/invest',
    method: 'POST',
    signature: true
  },

  // 发送短信验证码
  {
    url: '/api/v2/smsCaptcha',
    method: 'POST',
    signature: true
  },

  // 大额充值
  {
    url: '/api/v2/baofoo/:userId/batchDepositSplit',
    method: 'POST',
    signature: true
  },

  // 银行卡预绑卡
  {
    url: '/api/v2/baofoo/:userId/preBindCard',
    method: 'POST',
    signature: true
  },

  // 银行卡绑卡
  {
    url: '/api/v2/baofoo/:userId/confirmBindCard',
    method: 'POST',
    signature: true
  },

  // 银行卡解绑
  {
    url: '/api/v2/baofoo/cancelBindCard',
    method: 'POST',
    signature: true
  },

  // 投资支付
  {
    url: '/api/v2/baofoo/pay',
    method: 'POST',
    signature: true
  },

  // 债转默认合同模版获取
  {
    url: '/api/v2/creditassign/template',
    method: 'GET',
    signature: true
  },

  // 借款合同模版获取
  {
    url: '/api/v2/loan/loanRequest/:requestId/bind/template',
    method: 'GET',
    signature: true
  },

  // 债转合同获取
  {
    url: '/api/v2/creditassign/getCreditAssignContract/:creditAssignId',
    method: 'GET',
    signature: true
  },

  // 获取标的估值和转让期限
  {
    url: '/api/v2/creditassign/prepareAssign/step1',
    method: 'GET',
    signature: true
  },

  // 获取转让折价率
  {
    url: '/api/v2/creditassign/prepareAssign/step2',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/isMMC',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/users/getReferralInfo',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/user/:userId/accountStatus',
    method: 'GET',
    signature: true
  },

  // 兑换红包新接口加校验
  {
    url: '/api/v2/coupon/:userId/redeemCouponIgnoreApprovalWithCaptcha',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/loans/getLoansForHomePage',
    method: 'GET',
    signature: true
  },

  // 1111
  {
    url: '/api/v3/loans/getMobileHomepageLoans',
    method: 'GET',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/charge',
    method: 'POST',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/withdraw/:userId',
    method: 'POST',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/getBankConstraints',
    method: 'GET',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/hasOpenCurrentChannel/:userId',
    method: 'GET',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/:userId/preBindCard',
    method: 'POST',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/:userId/confirmBindCard',
    method: 'POST',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/:userId/batchDepositSplit',
    method: 'POST',
    signature: true
  },

  // 支付路由相关
  {
    url: '/api/v2/payment/router/cancelBindCard',
    method: 'POST',
    signature: true
  },

  // 获取线下记录
  {
    url: '/api/v2/offlineData/offline/:userId',
    method: 'GET',
    signature: true
  },

  // 获取理财师验证码
  {
    url: '/api/v2/user/:userId/sendMMCCaptcha',
    method: 'POST',
    signature: true
  },

  // 验证理财师验证码
  {
    url: '/api/v2/checkSMSCaptcha/:userId',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/coupon/:userId/listCouponNew',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/POS/query',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/POS/notification',
    method: 'POST',
    signature: true
  },

  // 1111
  {
    url: '/api/v2/POS/generateBarcode/:userId/:orderId',
    method: 'GET',
    signature: true
  },

  // 循环产品-赎回
  {
    url: '/api/v2/invest/redeem',
    method: 'POST',
    signature: true
  },

  // pos支付生成订单
  {
    url: '/api/v2/POS/:userId/deposit',
    method: 'POST',
    signature: true
  },

  // pos支付生成条形码
  {
    url: '/api/v2/POS/generateBarcode/:userId/:orderId',
    method: 'GET',
    signature: true
  },

  // 新的银行限额接口地址
  {
    url: '/api/v2/payment/router/getBankConstraints',
    method: 'GET',
    signature: true
  },

  // 新的获取理财师推荐列表
  {
    url: '/api/v2/user/:userId/inviteNew',
    method: 'GET',
    signature: true
  }
];
