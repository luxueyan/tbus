'use strict';

var utils = require('ccc/global/js/lib/utils');
require('ccc/global/js/lib/ZeroClipboard');
require("ccc/global/js/lib/share");
var format = require('@ds/format');
var Tips = require('ccc/global/js/modules/cccTips');
var qr = require('qr-element');

CC.imgUrlS = $('#imgurls').attr('src');
CC.imgUrl = $('#imgurl').attr('src');
ZeroClipboard.moviePath = '/ccc/global/img/ZeroClipboard.swf';

new Ractive({
    el: '.account-invite-wrapper',
    template: require('ccc/newAccount/partials/invite/wrap.html'),
    data: {
        host: location.host,
        user: CC.user,
        mobile: CC.user.mobile,
        Fmobile: '',
        moment: moment,
        totalSize: 0,
        list: [],
        rewardlist:[],
        loading: true,
        addText: '继续推荐',
        add: false,
        msg: null,
        record:true,
        reward:false
    },
    oninit: function () {
        this.getFmobile();
    },
    onrender: function () {
        var self = this;
        this.api = '/api/v2/user/MYSELF/invite';
        //var rewardApi='/api/v2/getReferUserCountAndReward/'+CC.user.id;
        var rewardApi='/api/v2/reward/getReferUserCountAndReward/MYSELF';
        $.get(this.api, function (o) {
            o = o.success ? o.data : {
                results: [],
                totalSize: 0
            };

            self.set('totalSize', o.totalSize);
            self.set('list', self.parseData(o));
            self.set('loading', false);

        });

         $.get(rewardApi, function (o) {
             //console.log(o)
             //self.set('totalSize', o.totalSize);
             //self.set('list', self.parseData(o));
             self.set('count', o.count);
             self.set('totalCoupons', o.totalCoupons);
        });
    },
    getFmobile: function(){
        var self = this;
        this.api = '/api/v2/user/MYSELF/inviteCode';
        
        $.get(this.api, function(r) {
             if (r.success) {
                self.set('Fmobile', CC.user.mobile);
            }
            self.bindActions();  
        }).error(function(){
            self.bindActions();
        });   
        
    },
    buildImgUrl: function(){
        var self = this;
        var url = 'http://' + location.host + '/register?refm=' + self.get('Fmobile');
        //return 'http://qr.liantu.com/api.php?&bg=ffffff&fg=000000&text=' + text;
        return url;
    },
    parseData: function (r) {
        r.results.sort(function(a,b){
            return (b.user.registerDate - a.user.registerDate);
        });
        for (var i = 0; i < r.results.length; i++) {
            var o = r.results[i];
            r.results[i].user.registerDate = new Date(r.results[i].user.registerDate);
            r.results[i].user.registerDate = moment(r.results[i].user.registerDate).format('YYYY-MM-DD');
            if( r.results[i].user.name.length>3){
                r.results[i].user.name =  r.results[i].user.name.substr(0, 1)+'***';
            }else if( r.results[i].user.name.length>2){
                r.results[i].user.name =  r.results[i].user.name.substr(0, 1)+'**';
            }else{
                r.results[i].user.name = format.mask(o.user.name);
            }
            r.results[i].FOmobile = format.mask(o.user.mobile, 3, 4);
        }
        return r.results;
    },
    bindActions: function () {
        var self = this;
        // 初始化二维码
        var qrcode = qr(this.buildImgUrl(), {
            render: !!window.CanvasRenderingContext2D ? 'canvas' : 'table',
            width:168,
            height:168
        });
        $('#inviteCodeImg').append(qrcode);
        
        $(this.el).find("#btn-invite-copy").mouseover(function () {
            $("#invite-link").select();
        });
        $(this.el).find("#invite-link").mouseover(function () {
            $(this).select();
        });
        
        $('.record').click(function(){
             self.set('record', true);
             self.set('reward', false);
        });
        
         $('.reward').click(function(){
             self.set('record', false);
             self.set('reward', true);
        });

        var clip = new ZeroClipboard.Client();
        clip.setHandCursor(true);
        clip.setText($(this.el).find("#invite-link").val());
        clip.glue("btn-invite-copy");

        $("#invite-link").change(function () {
            clip.setText($("#invite-link").val());
            clip.glue("btn-invite-copy");
        });

        clip.addEventListener("complete", function () {
            // alert('复制成功，快发给你的好友吧~');            
            Tips.create({
                obj: $('#btn-invite-copy'),
                width: 250,
                height: 63,
                callback: function (container) {
                    container.html('<p style="padding: 20px">复制成功，快发给你的好友吧~</p>');
                    setTimeout(function () {
                      $('.cc-tips-wp').remove();
                    }, 2000);
                }
            });
        });
    }
});
