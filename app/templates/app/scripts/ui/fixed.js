define(["jquery"], function($){
    var Fixed = function($ele, options){
        this.html = $ele && $ele.construtor === $? $ele: $($ele);
        this.options = options || {};
    };


    $.extend(Fixed.prototype, {
        init: function(){
            if(this.html.length == 0){
                this.create();
            }
            this.getViewPort();
            this.show();

            this.eventBind();
        },
        getViewPort: function(){
            this.viewportWidth = $(window).width();
            this.viewportHeight = $(window).height();
        },
        create: function(){
            this.html = $(this.options.html);
            var $parentNode = this.options.parentNode || $("body");
            this.html.appendTo($parentNode).show();
            var me = this;
            this.height = this.html.height() + 50;
            this.html.hide();
            this.html.css({
                "bottom": - me.height,
                "right": me.options.right || 0
            });
        },

        show: function(){
            var me = this;
            if(!this.options.autoHide){
                this.html.show();
            }
            if($.browser && $.browser.version == "6.0"){
                var viewHeight = $(window).height();
                this.html.css({
                    "position": "absolute",
                    "bottom": "auto",
                    "top": viewHeight - 200
                });
            }else{
                me.html.css({
                    "position": "fixed"
                }).animate({
                        "bottom": me.options.bottom || 50,
                        "right": me.options.right || 0
                    },"slow");
            }
        },

        eventBind: function(){
            var me = this;
            var viewHeight = $(window).height();

            if($.browser && $.browser.version == "6.0"){
                $(window).on("scroll",function(){
                    var scroll = $(window).scrollTop();
                    me.html.css({
                        "bottom": "auto",
                        "top": parseInt(viewHeight,10) - 200 + parseInt(scroll,10)
                    });
                });
                $(window).on("resize",function(){
                    var viewHeight = $(window).height();
                    var scroll = $(window).scrollTop();
                    me.html.css({
                        "bottom": "auto",
                        "top": parseInt(viewHeight,10) - 200 + parseInt(scroll,10)
                    });
                });
            }
            else{
                $(window).on("scroll", function(){
                    if($(this).scrollTop() >= me.viewportHeight/2){
                        me.html.fadeIn();
                    }else{
                        me.html.fadeOut();
                    }
                });

                $(window).on("resize", function(){
                    me.getViewPort();
                });
            }
        }
    });

    return Fixed;
});
