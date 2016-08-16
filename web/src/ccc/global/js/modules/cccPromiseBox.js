'use strict'
require('ccc/global/js/lib/jquery-ui.min');
function PromiaseBox(){
    this.cfg = {
        width:500,
        content:'',
        cancelHandeler:null,
        title:'',
		closeHandeler:null,
        hasCloseBtn:true,
        hasMask:true,
        text4Footer:'',
        text4Ok:'确定',
        text4Cancel:'取消',
        renderHandler:null,
        hasCancelBtn:true,
        hasOkBtn:true,
        ok:null,
		canRemove:true,
        isDestroy:true,
    };
    this.boundingBox = null;
}

    PromiaseBox.prototype = {
        renderUI:function(){
            this.boundingBox = $('<div class="window_box">'
                                 +'<div class="window_box_header">'+ this.cfg.title +'</div>'
                                 +'<div class="window_box_content">'+ this.cfg.content +'</div>'
                                 +(this.cfg.hasOkBtn?'<input class="window_okBtn" type="button" value="'+this.cfg.text4Ok+'">':'')
                                 +(this.cfg.hasCancelBtn?'<input class="window_cancelBtn" type="button" value="'+this.cfg.text4Cancel+'">':'')
                                 +'<div class="window_box_footer">'+ this.cfg.text4Footer +'</div>'
                                 +'</div>');
            if(this.cfg.hasCloseBtn){
                this.boundingBox.append('<span class="window_closeBtn"><img src="/ccc/newAccount/img/close.png"/></span>');
            };
            if(this.cfg.hasMask){
                 this._mask = $('<div class="mask"></div>');
                 this._mask.prependTo('body');
            }
            this.boundingBox.appendTo('body');
			if(this.cfg.canRemove){
				this.boundingBox.draggable();
			}
			
            this.cfg.renderHandler&&this.cfg.renderHandler($('.window_box_content'));
			
        },
        bindUI:function(){
            var that = this;
            this.boundingBox.delegate('.window_closeBtn','click',function(e){
                that.destroy();
				that.cfg.closeHandeler&&that.cfg.closeHandeler(e)
            }).delegate('.window_cancelBtn','click',function(e){
                if(that.cfg.isDestroy){
                    that.destroy();
                }
				that.cfg.cancelHandeler&&that.cfg.cancelHandeler(e);
            }).delegate('.window_okBtn','click',function(e){
              that.cfg.ok&&that.cfg.ok(e);
            })
        },
        syncUI:function(){
            this.boundingBox.css({
                width:this.cfg.width,
                height:this.cfg.height||'auto',
                left:(this.cfg.left||(window.innerWidth - this.cfg.width)/2)+'px',
                top:(this.cfg.top||(window.innerHeight - this.cfg.height||this.boundingBox.height())/2) + 'px'
            });

        },
        render:function(container){          //方法：渲染组件
            this.renderUI();
            $(container||document.body).append(this.boundingBox);
            this.syncUI();
            this.bindUI();

        },
        destructor:function(){
            this._mask&&this._mask.remove();
        },
        destroy:function(){                 //接口：销毁组件
            this.boundingBox.remove();
            this.destructor();
        },
        alert:function(cfg){
            $.extend(this.cfg,cfg);
            this.render();
            return this;
        }
};

module.exports = PromiaseBox;
