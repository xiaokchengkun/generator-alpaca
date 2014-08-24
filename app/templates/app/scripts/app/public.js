/**
 * Created by chengkun on 14-3-24.
 * 页面公共部分初始化js
 */

define([
    'jquery',
    'app/config',
    'ui/login',
    'ui/share',
    'ui/fixed'
], function($, Config, Login, Share, Fixed){
    'use strict';
    var URLMAP = {
        USER: '/user/ajax/getuser?format=ajax&t=' + new Date().getTime()
    };

    var Public = {
        init: function(config){

            if (!Array.prototype.indexOf){
                Array.prototype.indexOf = function(elt /*, from*/){
                    var len = this.length >>> 0;
                    var from = Number(arguments[1]) || 0;
                    from = (from < 0)
                        ? Math.ceil(from)
                        : Math.floor(from);
                    if (from < 0)
                        from += len;
                    for (; from < len; from++){
                        if (from in this &&
                        this[from] === elt)
                        return from;
                    }
                    return -1;
                };
            }

            this.config = config || {};

            this.getViewPort();

            this.login();

            this.share();

            if(this.config.sideFixed){
                this.sideFixedWrapper = $('#J_side-fixed');
                this.sideFixed(this.config.sideFixed.options || {});
                this.config.sideFixed.sideNavigation && this.sideNavigation();
                this.config.sideFixed.backToTop && this.backToTop();
            }

            this.copyright();

            this.eventBind();
        },

        /** 获取窗口视窗大小
        *
        */
        getViewPort: function(){
            this.viewportWidth = $(window).width();
            this.viewportHeight = $(window).height();
        },

        /** 头部用户登录
        *
         */
        login: function(){
            $.get(URLMAP.USER, function(response){
                if(response.errno === 0){
                    var user = response.data.user;
                    lv.session.user = user;
                    $('#J_user-name').attr('href', '/user/' + user.uid).text(user.uname);
                    $('#J_user-no-login').hide();
                    $('#J_user-yes-login').show();
                }else{

                }
            }, 'json');
            $(document).delegate('#J_user-login', 'click', function(){
                Login.check();
            });
        },

        /** 头部分享按钮
        *
        *
         */
        share: function(){
            $(document).delegate('.sns-share-btn', 'click', function(){
                var type = $(this).attr('data-from');
                if(!type) return;
                var share = new Share(type);
                share.init(Config.SHARE);
                share.exec();
            });
        },

        /** 侧边导航模块
         * 包括页面导航返回顶部
         *
         */
        sideFixed: function(options){
            var sideFixed = new Fixed(
                this.sideFixedWrapper,
                $.extend(options, {
                    autoHide: true
                })
            );

            sideFixed.init();
        },

        /** 右侧滚动导航
         *
         *
         */
        sideNavigation: function(){
            var me = this;
            var navigationData = this.config.sideFixed.sideNavigation;
            this.sideNav = $('<nav class="side-navigation"></nav>');

            //存储每个块儿的offset top
            var topData = []
            //用来排序获取滚动位置
                , tempData
            //缓存滚动位置的index
                , tempIndex
            //存储滚动距离 每一定距离之后才计算一次
                , tempScroll = 0
            //自定义展示偏移量
                , offset = 50;

            $(navigationData).each(function(index, item){
                topData.push($('#' + item.id).offset().top);
                item.$dom =
                    $('<a class="nav-anchor" href="#' + item.id + '" data-anchor="' + item.id + '">' + item.text + '</a>');
                if(item.className){
                    item.$dom.addClass(item.className);
                }
                me.sideNav.append(item.$dom);
            });
            this.sideNav.appendTo(this.sideFixedWrapper);

            $(window).on('scroll', function(){
                //切换过程中不做任何判断
                if(me.sideScrollStatus) return;
                var scrollTop = $(this).scrollTop();
                //不响应滚动范围 -50~100
                if(scrollTop <= tempScroll + 100 && scrollTop >= tempScroll - 50){
                    return;
                }else{
                    tempScroll = scrollTop;
                }
                //正常处理
                var triggerTop = scrollTop + offset;
                tempData = topData.slice();
                tempData.push(triggerTop);
                var index = tempData.sort(function(a,b){return a-b}).indexOf(triggerTop);
                index = index||1;
                if(tempIndex != index){
                    var $dom = navigationData[index-1].$dom;
                    $(navigationData).each(function(i, item){
                        item.$dom.removeClass('active');
                    });
                    $dom.addClass('active');
                    tempIndex = index;
                }
            });
        },

        /** 返回顶部
         *
         *
         */
        backToTop: function(){
            var $backTop = $('<a class="back-top" href="#main"></a>');
            $backTop.appendTo(this.sideFixedWrapper);
        },

        /** 底部版权部分时间
         *
         */
        copyright: function(){
            var year = new Date().getFullYear();
            $('#J_copyright-year').text(year);
        },

        /** 页面锚点点击事件 页面平滑滚动
         *
         */
        anchorScroll: function(anchor){
            var me = this;
            //默认到顶部
            anchor = anchor || 'main';
            if(!$(anchor).length){
                return;
            }
            var top = $(anchor).offset().top;
            $('html, body').animate({
                scrollTop: top
            }, '500', 'swing', function(){
                me.sideScrollStatus = false;
            });
        },

        UnixToDate: function(unixTime, isFull, timeZone) {
            if (typeof (timeZone) === 'number'){
                unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
            }
            var time = new Date(unixTime * 1000);
            var date = '';
            var year = time.getUTCFullYear();
            var month = time.getMonth() + 1;
            var day = time.getDate();
            if(month < 10){
                month = '0' + month;
            }
            if(day < 10){
                day = '0' + day;
            }
            date = year + '-' + month + '-' + day;
            if (isFull === true)
            {
                date += ' ' + time.getUTCHours() + ':';
                date += time.getUTCMinutes() + ':';
                date += time.getUTCSeconds();
            }
            return date;
        },

        eventBind: function(){
            var me = this;
            //又边导航点击后 页面滚动的时候 给页面加个锁 取消scroll事件
            $(document).delegate('a', 'click',function(e){
                var anchor = $(this).attr('href');
                if(anchor.indexOf('#') === -1){
                    return;
                }
                e.preventDefault();
                if(!me.sideScrollStatus){
                    me.sideScrollStatus = true;
                }
                if(anchor && anchor != '#' && anchor.indexOf('###') !== 0){
                    me.anchorScroll(anchor);
                }
            });
        }

    };

    return Public;

});
