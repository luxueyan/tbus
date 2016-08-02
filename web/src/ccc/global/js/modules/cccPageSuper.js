'use strict';

var qs = require('qs');

function RenderPage(){
    this.cfg = {
        totalSize:'',         //数据总条数，必传参数，
        pageSize:10,         //定义每个的个数，默认为10，
        results:[],         //当为前台分页时，需要这返回的数据以数组形式传入
        api:'',             //请求后台的api接口，后面要跟上'?page=$currentPage&pageSize=$pageSize'的请求参数
        callback:null,     //切换currentPage时的回调，必传
        queryString:null, //接口额外参数，以对象形式传入
    }
};

RenderPage.prototype = {
    page:function(cfg){
        $.extend(this.cfg,cfg);//把传入的配置混合
        var totalPage = this.getTotalpage(this.cfg.totalSize,this.cfg.pageSize);
        this.renderPage(totalPage);
    },
    getTotalpage:function(totalSize,pageSize){
        var totalPageSize = Math.ceil(totalSize/pageSize);
        var totalPage = [];
        for(var i=1;i<=totalPageSize;i++){
            totalPage.push(i);
        };
        
        return totalPage;
    },
    
    renderPage:function(totalPage,current){
        var that = this;
        if(!current){
            current = 1;
        }
        var pageRac = new Ractive({
            el:'#invest-pager',
            template:require('ccc/global/partials/modules/pager.html'),
            data:{
                totalPage:totalPage,
                current:current,
            }
        });
        
        pageRac.on('page',function(e,page){
            e.original.preventDefault();
            if (page) {
                current = page;
            } else {
                current = e.context;
            }
            if(!that.cfg.api){           //如果api不存在，就去分割传入的数据results
                that.pageSliceData(current,that.cfg.pageSize);
            }else{                       //否则就根据api想后台请求数据 
                that.pageLoadData(current,that.cfg.pageSize,that.cfg.api);
            }  
        });
        
        pageRac.on('previous',function(e){
            e.original.preventDefault();
            var current = this.get('current');
            if (current > 1) {
                current -= 1;
                this.set('current', current);
            }
            
            if(!that.cfg.api){           //如果api不存在，就去分割传入的数据results
                that.pageSliceData(current,that.cfg.pageSize);
            }else{                       //否则就根据api想后台请求数据 
                that.pageLoadData(current,that.cfg.pageSize,that.cfg.api);
            }  
        });
        
        pageRac.on('next',function(e){
            e.original.preventDefault();
            var current = this.get('current');
            if (current < this.get('totalPage')[this.get('totalPage').length - 1]) {
                current += 1;
                this.set('current', current);
            }
            
            if(!that.cfg.api){           //如果api不存在，就去分割传入的数据results
                that.pageSliceData(current,that.cfg.pageSize,that.cfg.obj);
            }else{                       //否则就根据api想后台请求数据 
                that.pageLoadData(current,that.cfg.pageSize,that.cfg.api);
            }  
        });
    },
    pageSliceData:function(current,pageSize){
        if(this.cfg.results){
            //.....
            var data = this.cfg.results.slice((current-1)*pageSize,current*pageSize);
            this.cfg.callback && this.cfg.callback(data);
        }else if(!(this.cfg.results instanceof Array)){
            alert('分页的数据 应该为数组形式');
            return;
        }else{
            alert('您还没有传入需要分页的数据');
            return;
        }
    },
    pageLoadData:function(current,pageSize,api){
        var that = this;
        var queryString;
        if(this.cfg.queryString){
            queryString ='&' + qs.stringify(this.cfg.queryString);
        }else{
            queryString = '';
        }
        api = api.replace('$currentPage',current).replace('$pageSize',pageSize) + queryString;
        request.get(api)
            .end()
            .then(function(res){
            if(res.body){
                that.cfg.callback && that.cfg.callback(res.body);
            }
        })
    },
}

module.exports = RenderPage;