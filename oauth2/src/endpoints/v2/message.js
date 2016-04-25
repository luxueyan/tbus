'use strict';

// message
var router = require('express').Router();
module.exports = router;
var auth = require('../../auth');

// 统计所有新消息数目，包括站内信、系统通知和用户评论
router.get('/api/v2/message/countMessages/:userId', auth.owner());

// 所有的消息列表（已读+未读）
router.get('/api/v2/message/notifications/:userId/:page', auth.owner());

// 根据用户得到未读消息
router.get('/api/v2/message/getNewNotifications/:userId/:page', auth.owner());

// 得到所有的新的未读消息的数目
router.get('/api/v2/message/countNewNotifications/:userId', auth.owner());

// 获取所有留言
router.get('/api/v2/message/getAllComments/:userId', auth.owner());

/* TODO: 需要修改这几个接口
// 设置为已读
router.get('/api/v2/message/markAsRead/:id', auth.pass());

// 存档
router.get('/api/v2/message/markAsArchived/:id', auth.pass());

// 删除
router.get('/api/v2/message/delete/:id', auth.pass());
*/
