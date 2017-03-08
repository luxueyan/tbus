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

  // 注册账号
  {
    url: '/api/v2/users/register',
    method: 'POST',
    signature: true
  },

  // 登录
  {
    url: '/api/v2/auth/login',
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
  }
];
