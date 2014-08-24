define([
    'jquery'
], function($){
    "use strict";

    var dialogWrapperClass = "dialog-lite";
    var dialogOverlayClass = "dialog-lite-overlay";
    var dialogAnimatePrefix = "dialog-animator-";
    var dialogShowClass = "dialog-show";

    var Dialog = function(content, opts){
        var argus = this.arguments;
        var $content;
        var defaults= {
            type: "content",  //content alert confirm splash
            width: 500,
            height: 200,
            modal: true,
            $parent: $(document.body),
            animator: "fadeIn",
            autoOpen: true,
            canClose: true,
            acceptText: "确定",
            cancelText: "取消",
            accept: function(){}, //确定按钮回调
            cancel: function(){}, //取消按钮回调
            close: function(){}, //关闭按钮回调
            destroy: function(){} //销毁dialog回调
        };
        this.options = $.extend(true, {}, defaults, opts);


        (content.constructor === $) ? ($content = content): $content = $(content);
        this.content = $content;

        this.init();
        return this.dialog;
    };

    $.extend(Dialog.prototype, {
        /**
         * 初始化
         * @param {Object} dialog的设置参数
         * @param width dialog外容器宽
         * @param width dialog外容器高
         * @param modal 是否需要蒙层
         * @param parent dialog的父亲节点
         * @param animation 是否需要动画效果
         **/
        init: function(){
            var options = this.options;
            if(options.modal){
                this.overlay = this._createOverlay();
            }
            this.render();
            this.eventBind();
        },

        /**
         * 生成dialog的DOM节点
         */
        render: function(){
            var me = this;
            var $parent = this.options.$parent;
            var dialogHtml = [
                '<div class="',dialogWrapperClass,' ',(this.options.animator?(dialogAnimatePrefix + this.options.animator):''),'">',
                    '<div class="',dialogWrapperClass,'-main">',
                this.options.canClose?('<div class="' + dialogWrapperClass + '-close"></div>'):'',
                this.options.title? ('<div class="' + dialogWrapperClass + '-titlebar">' + this.options.title + '</div>'):'',
                        '<div class="',dialogWrapperClass,'-content"></div>',
                    '</div>',
                '</div>'
            ].join("");
            var position = (!-[1,]&&!window.XMLHttpRequest)?"absolute":"fixed";
            var $dialog = $(dialogHtml)
                .css({
                    "position": position,
                    "top": "50%",
                    "left": "50%",
                    "width": me.options.width,
                    "height": me.options.height
                });
            var $buttons = this._createButtons();
            $dialog.find("." + dialogWrapperClass + "-content").append(this.content).append($buttons);
            $dialog.appendTo($parent);
            this.options.autoOpen && this.open($dialog);

            this.dialog = $dialog;
        },
        /**
         * 根据dialog类型添加没默认交互按钮
         * @private
         */
        _createButtons: function(){
            var me = this;
            var type = this.options.type;

            switch(type){
                case "confirm":
                    this.buttons = [
                        {
                            "text": this.options.acceptText,
                            "click": this.options.accept
                        },
                        {
                            "text": this.options.cancelText,
                            "click": this.options.cancel
                        }
                    ];
                    break;
                case "alert":
                    this.buttons = [
                        {
                            "text": this.options.acceptText,
                            "click": this.options.accept
                        }
                    ];
                    break;
            }


            if(!this.buttons ||  this.buttons.length===0){
                return "";
            }

            var $buttonsWrapper = $('<div class="'+dialogWrapperClass+'-button"></div>');
            $(this.buttons).each(function(index, item){
                var buttonClass = 'button-primary';
                if(index !== 0){
                    buttonClass = 'button-default';
                }
                var $button = $('<button href="###" class="button button-middle button' + index + ' ' + buttonClass + '"><em>'+item.text+'</em></button>');
                $buttonsWrapper.append($button);
                $button.on("click", function(){
                    me.destroy();
                    item.click();
                });
            });

            return $buttonsWrapper;

        },
        /**
         * 定位dialog DOM的位置
         */
        position: function(){
            var viewHeight = $(window).height();
            var viewWidth = $(window).width();
        },
        /**
         * 创建dialog蒙层
         */
        _createOverlay: function(){
            var $overlay = $('<div></div>')
                .addClass(dialogOverlayClass);

            $(document.body).append($overlay);
            return $overlay;
        },
        /**
         * 打开创建的dialog
         */
        open: function($dialog){
            var $overlay = this.overlay;
            setTimeout(function(){
                $dialog.addClass(dialogShowClass);
                $overlay.addClass(dialogShowClass);
            }, 0);
        },

        close: function(){

        },
        /**
         * 销毁dialog
         */
        destroy: function(){
            var me = this;
            var destroy = [this.dialog, this.overlay];
            $(destroy).each(function(){
                var $this = $(this);
                if($this){
                    $this.removeClass(dialogShowClass);
                    //setTimeout(function(){
                        $this.remove();
                        $this = null;
                   // }, 500);
                }
            });
            this.options.destroy();
        },

        eventBind: function(){
            var me = this;
            this.dialog.delegate("." + dialogWrapperClass + "-close", "click", function(){
                me.destroy();
            });
        }
    });



    var dialog = {
        /**
         * 默认框
         */
        content: function(content, opts){
            opts = $.extend({
                type: "content"
            }, opts);
            return new Dialog(content, opts);
        },
        /**
         * 警告框
         */
        alert: function(content, opts){
            opts = $.extend({
                type: "alert"
            }, opts);
            var _dialog = new Dialog(content, opts)
            return _dialog;
        },
        /**
         * 确定框
         */
        confirm: function(content, opts){
            opts = $.extend({
                type: "confirm"
            }, opts);
            return new Dialog(content, opts);
        },
        /**
         * 瞬时框
         */
        splash: function(){

        }
    };

    return dialog;
});
