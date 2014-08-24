require([
    'jquery',
    'app/public',
    'app/config',
    'ui/lite',
    'ui/errno',
    'ui/dialog',
    'ejs',
    'handlebars',
    'typeahead',
    'qrcode'
], function($, Public, Config, lite, errno, dialog, EJS){
    'use strict';

    var timeStamp = new Date().getTime();
    var URLMAP = {
        ALL: '/business/ajax/tehui?format=ajax&t=' + timeStamp,
        GETLOCATION: '/business/ajax/tehui/getsnamebyip?format=ajax',
        SUG: '/destination/ajax/newsug?format=ajax&prod=lvyou_new&su_num=20&wd=',
        SUBMIT: '/business/ajax/tehui/addboarding?format=ajax',
        VCODE: '/business/ajax/tehui/gettoken?format=ajax&t=' + timeStamp
    };

    var app = {
        init: function(){
            this.$card = $('#J_card-main');
            this._init();
            this.getAllData();
            this.getLocationInfo();
            this.eventBind();
        },
        /*
        * _init 页面公共初始化方法
        * login  必选
        * share 必选
        * nslog 必选
        *
         */
        _init: function(){
            var config = {
                sideFixed: {
                    //侧边栏配置项
                    options: {
                        right: 0,
                        bottom: 200
                    },
                    //返回顶部
                    backToTop: true,
                    //侧边栏导航
                    sideNavigation: [
                        {id: 'flight-card-title', className: 'nav-free', text: '免费机票'},
                        {id: 'main-container-title', className: 'nav-low', text: '低价机票'}
                    ]
                }
            };

            Public.init(config);
        },

        getAllData: function(){
            var me = this;
            $.get(URLMAP.ALL, function(response){
                if(response.errno === 0){
                    var data = response.data;
                    me.formatFlightData(data);
                }
            },'json');
        },

        formatFlightData: function(data){
            var me = this;
            var $parts = $('.J_container-part');
            $.each($parts, function(){
                var $this = $(this);
                var type = $this.attr('data-type');
                var list = data[type];

                if(list && list[0].list){

                    me.renderFligtTab(list, $this, {
                        prefix: 'J_flight-' + type + '-',
                        size: 'small'
                    });

                    $.each(list, function(index, item){
                        var option = {
                            id: 'J_flight-' + type + '-' + index,
                            className: 'J_flight-tab-wrapper'
                        };
                        if(index !== 0){
                            option.className = 'J_flight-tab-wrapper hide';
                        }
                        me.renderFligtHTML(item.list, $this, option);
                    });

                }else{
                    me.renderFligtHTML(list, $this, {size: 'large'});
                }
            });
        },

        renderFligtTab: function(list, $wrapper, option){
            var $html = $('<ul class="flight-tab"></ul>');
            $.each(list, function(index, item){
                var li = [
                    '<li>',
                        '<a class="J_flight-tab ' + (index === 0?'active':'') + '" href="#' + (option.prefix || 'J_') + index + '">',
                        item.date + '开抢',
                        '</a>',
                    '</li>'
                    ].join('');
                $html.append(li);
            });
            $wrapper.append($html);
        },

        renderFligtHTML: function(list, $wrapper, option){
            if(!list || !list.length){
                return;
            }
            option = option || {};
            var template = new EJS({url:'./template/flight.ejs'});
            var $html = $([
                    '<div id="' + (option.id || ''),
                    '" class="flight-wrapper clearfix J_flight-wrapper ',
                    (option.className || ''),
                    '">',
                    '</div>'
                ].join(''));
            $html.append(
                template.render({
                    list: list,
                    lite: lite,
                    option: option
                })
            );
            $wrapper.append($html);
        },

        getLocationInfo: function(){
            var me = this;
            me.location = {};
            $.get(URLMAP.GETLOCATION, function(response){
                if(response.errno === 0){
                    var data = response.data;
                    me.location = $.extend({}, data);
                }
                me.initCard();
            }, 'json');
        },

        initCard: function(){
            this.initCardData();
            this.$departure = this.$card.find('#J_departure-input');
            this.$destination = this.$card.find('#J_destination-input');
            this.$content = this.$card.find('#J_content-input');
            this.$phone = this.$card.find('#J_phone-input');
            this.$vcode = this.$card.find('#J_vcode-input');
            this.$submit = this.$card.find('#J_card-submit');

            if(this.location.sname && this.location.sid){
                this.submitData.departure.sid = this.location.sid;
                this.submitData.departure.sname = this.location.sname;
                this.$departure.val(this.location.sname);
            }

            this.suggestion();
            this.getVcode();
        },
        initCardData: function(){
            this.submitData = {
                departure: {
                    sid: '',
                    sname: ''
                },
                destination: {
                    sid: '',
                    sname: ''
                },
                content: '',
                phone: '',
                vcode: '',
                token: ''
            };
        },

        resetCard: function(){
            this.initCardData();
            this.$departure.val('');
            this.$destination.val('');
            this.$content.val('');
            this.$phone.val('');
            this.$vcode.val('');
            this.getVcode();
        },

        suggestion: function(){
            var me = this;
            var sceneSug = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('sname'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    url: URLMAP.SUG + '%QUERY',
                    filter: function(data) {
                        var option = {
                            sugtype: 'city'
                        };
                        return me.formatSugData(data.data.sug.s, option);
                    }
                }
            });

            sceneSug.initialize();

            $('.typeahead').typeahead(null, {
                name: 'scene-city',
                displayKey: 'sname',
                source: sceneSug.ttAdapter(),
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        '暂无此城市',
                        '</div>'
                    ].join(''),
                    suggestion: Handlebars.compile('<p class="sug-item">{{sname}}</p>')
                }
            });

            $('.typeahead').on('typeahead:selected', function(event, data){
                var target = event.currentTarget;
                switch(target.id){
                    case 'J_departure-input':
                        me.submitData.departure.sid = data.sid;
                        me.submitData.departure.sname = data.sname;
                        break;
                    case 'J_destination-input':
                        me.submitData.destination.sid = data.sid;
                        me.submitData.destination.sname = data.sname;
                        break;
                }
            });
        },

        formatSugData: function(base, option){
            var data = [];
            var sugBuffer = [];
            var sugtype = option.sugtype || '';
            $.each(base, function(i, item) {
                if(item){
                    var city = (item.full_path)?item.full_path.split(',').pop():"";
                    if(sugtype === "city" && item.scene_layer === '4'){
                        data.push($.extend(true,item,{
                            city: city,
                            sname: item.name,
                            xid: item.sid
                        }));
                    }
                }
            });
            if (data.length > 10) {
                data = data.slice(0, 10);
            }
            return data;
        },

        getVcode: function(){
            var me = this;
            $.get(URLMAP.VCODE + '&t=' + new Date().getTime(), function(response){
                if(response.errno === 0){
                    var token = response.data.token;
                    me.submitData.token = token.vcode_str;
                    me.$card.find('#J_vcode-image').attr('src', token.imgurl);
                }else{
                    //me.getVcode();
                }
            }, 'json');
        },

        validDepartureOrDestination: function($input, type){
            var value = $.trim($input.val());
            var length = lite.getByteLength(value);
            var hasClass = $input.hasClass('error');
            this.submitData[type] = {
                sid: '',
                sname: ''
            };
            if( length > 0){
                if(hasClass){
                    $input.removeClass('error');
                 }
                this.submitData[type].sname = value;
            }else{
                if(!hasClass){
                    $input.addClass('error');
                }
            }
        },

        validContent: function($input){
            var value = $.trim($input.val());
            var length = lite.getByteLength(value);
            var hasClass = $input.hasClass('error');
            var limit = 150;
            if( length > 0 && length <= limit){
                this.submitData.content = value;
                if(hasClass){
                    $input.removeClass('error');
                 }
            }else{
                this.submitData.content = '';
                if(!hasClass){
                     $input.addClass('error');
                 }
            }
        },
        validPhone: function($input){
             var value = $.trim($input.val());
             var isValid = /^(13|14|15|18)[0-9]{9}$/.test(value);
             var hasClass = $input.hasClass('error');
             if(isValid){
                 this.submitData.phone = value;
                 if(hasClass){
                    $input.removeClass('error');
                 }
             }else{
                 this.submitData.phone = '';
                 if(!hasClass){
                     $input.addClass('error');
                 }
             }
        },

        validVcode: function($input){
            var value = $.trim($input.val());
            var length = lite.getByteLength(value);
            var hasClass = $input.hasClass('error');
            if(length > 0){
                this.submitData.vcode = value;
                if(hasClass){
                    $input.removeClass('error');
                 }
            }else{
                this.submitData.vcode = '';
                if(!hasClass){
                     $input.addClass('error');
                 }
            }
        },

        isValidCard: function(){
            var data = this.submitData;
            var isValid = !!(data.departure.sname && data.destination.sname && data.content && data.phone && data.vcode);
            //console.log(isValid);
            if(isValid){
                this.$submit.removeClass('disable').removeAttr('disabled');
            }else{
                this.$submit.addClass('disable').attr('disabled', 'disabled');
            }
            return isValid;
        },

        submitCard: function(){
            //console.log(this.isValidCard());
            var me = this;
            if(this.isValidCard()){
                var data = {
                    message: this.submitData.content,
                    telephone: this.submitData.phone,
                    token: this.submitData.token,
                    vcode: this.submitData.vcode
                };
                data.departure = JSON.stringify(this.submitData.departure);
                data.destination = JSON.stringify(this.submitData.destination);
                //$.get(URLMAP.SUBMIT, data, function(response){
                $.post(URLMAP.SUBMIT, data, function(response){
                    if(response.errno === 0){
                        var html = new EJS({url: './template/share.ejs'}).render({
                            shareId: response.data.shareid
                        });
                        var _title = Config.SHARE.title;
                        var $shareDialog = dialog.content(html, {
                            title: '温馨提示',
                            height: 300,
                            destroy: function(){
                                Config.SHARE.title = _title;
                            }
                        });
                        var title = '#领免费机票，去见Ta#我想从' + me.submitData.departure.sname + '飞往' + me.submitData.destination.sname + '，因为' + me.submitData.content;
                        title = lite.cut(title, 240);
                        Config.SHARE.title = title;
                        me.$card.slideUp();
                        me.resetCard();
                        setTimeout(function(){
                            var $wrapper = $shareDialog.find('#J_weixin-code');
                            var url = 'http://lvyou.baidu.com/business/tehui/webapp/view?shareid=' + response.data.shareid;
                            me.initQrcode(url, $wrapper);
                        }, 500);

                        me.shareId = response.data.shareid;
                    }else if(response.errno === 808){
                        alert('该手机号已经提交过啦~');
                    }else{
                        errno.check(response);
                    }
                }, 'json');
            }
        },

        initQrcode: function(url, $wrapper){
            var shareUrl = url || window.location.href;
            $wrapper.qrcode({
                render: "table",
                width: 100,
                height: 100,
                color: '#3a3',
                text: shareUrl
            });
        },

        eventBind: function(){
            var me = this;
            var $document = $(document);
            $document.on('click', '#J_card-submit', function(){
                me.submitCard();
            });

            this.$card.find('input').bind('input propertychange', function(){
                var $this = $(this);
                var type = $this.attr('data-type');
                switch(type){
                    case 'departure':
                        me.validDepartureOrDestination(me.$departure, 'departure');
                        break;
                    case 'destination':
                        me.validDepartureOrDestination(me.$destination, 'destination');
                        break;
                    case 'content':
                        me.validContent(me.$content);
                        break;
                    case 'phone':
                        me.validPhone(me.$phone);
                        break;
                    case 'vcode':
                        me.validVcode(me.$vcode);
                        break;
                }
                me.isValidCard();
            });

            $document.on('click', '#J_card-hide', function(){
                me.$card.slideUp();
            });

            $document.on('click', '#J_card-show', function(){
                me.$card.slideDown();
            });

            $document.on('click', '.J_flight-tab', function(){
                $('.J_flight-tab').removeClass('active');
                $(this).addClass('active');
                var type = $(this).attr('href');
                $('.J_flight-tab-wrapper').addClass('hide');
                $(type).removeClass('hide');
            });

            this.$card.on('click', '.J_change-vcode', function(){
                me.getVcode();
            });
        }

    };

    app.init();
});
