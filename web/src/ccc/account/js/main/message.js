'use strict';
var messageTpl = require('ccc/account/partials/message.html');
var utils = require('ccc/global/js/lib/utils');
var Tips = require('ccc/global/js/modules/cccTips');
require('ccc/global/js/modules/cccTab');

var pagesize = 10;
var page = 1;
var totalPage = 1;


$('ul.tabs li a').on('click', function() {
  var type = $(this).parent().data('type');
  init(type);
});

function init (type) {
  if (type) {
    var messageRactive = new Ractive ({
      el: '.message-wrap',
      template: messageTpl,
      size: pagesize,
      page: page,
      totalPage: totalPage,
      moment: moment,
      api: '/api/v2/message/user/MYSELF/listByStatus',
      apit: '/api/v2/message/user/MYSELF/notifications',
      data: {
        loading: true,
        list: [],
        total: 0
      }, 
      onrender: function() {
        var self = this;
        self.getMessageData(function (o){
          self.set('total',o.totalSize);
          self.setData(o.results);
          self.bindAction();
        });
      },
      getMessageData: function(callback) {
        var self = this;
        var API;
        if (type === 'ALL') {
          API = self.apit;
        } else {
          API = self.api + '?status=' + type + '&page=' + self.page + '&pageSize=' + self.size;
        };

        $.get(API,function (o){
          if (o.results.length) {
            self.pageOneData = o.results;
            callback(o);
          }
        });
      },
      bindAction : function () {
        $('.ctr').click(function (){
          $(this).addClass('activeContent')
        });
      },
      setData: function(o) {
        var self = this;
        self.set('loading', false);
        self.set('list', self.parseData(o));
        self.renderPager();
      },
      parseData: function(o) {
        for (var i = 0; i < o.length; i ++) {
          o[i].sentTime = moment(o[i].sentTime)
          .format("YYYY-MM-DD HH:mm:ss");
        }

        return o;
      },
      renderPager: function () {
        var self = this;
        var totalSize = self.get('total');

        if (totalSize != 0) {
            self.totalPage = Math.ceil(totalSize / self.size);
        }

        var totalPage = [];
        for (var i = 0; i < self.totalPage; i++) {
            totalPage[i] = ++i;
        }
      
        renderPager(totalPage, self.page);
      }
    });
  };
  
  messageRactive.on('showContent', function (event) {
    
    var id = event.node.getAttribute('data-id');
    var status = event.node.getAttribute('data-status');
    if (status == 'NEW') {
      $.get('/api/v2/message/markAsRead/' + id); 
    }
  });

  function renderPager(totalPage, current) {
    if (!current) {
        current = 1;
    }
    var pagerRactive = new Ractive({
        el: '#invest-pager',
        template: require('ccc/invest/partials/pager.html'),
        data: {
            totalPage: totalPage,
            current: current
        }
    });

    pagerRactive.on('previous', function (e) {
        e.original.preventDefault();
        var current = this.get('current');
        if (current > 1) {
            current -= 1;
            this.set('current', current);
            messageRactive.page = current;
            messageRactive.onrender();

        }
    });

    pagerRactive.on('page', function (e, page) {
        e.original.preventDefault();
        if (page) {
            current = page;
        } else {
            current = e.context;
        }
        this.set('current', current);
        messageRactive.page = current;
        messageRactive.onrender();

    });
    pagerRactive.on('next', function (e) {
        e.original.preventDefault();
        var current = this.get('current');
        if (current < this.get('totalPage')[this.get('totalPage')
                .length - 1]) {
            current += 1;
            this.set('current', current);
            messageRactive.page = current;
            messageRactive.onrender();
        }
    }); 
  }  
}

init('ALL');


