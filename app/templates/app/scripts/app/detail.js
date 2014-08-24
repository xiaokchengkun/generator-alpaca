require([
	'jquery',
    'app/public',
    'app/config',
    'ui/lite',
    'ui/login',
    'ui/comment',
    'ejs',
	'jquery-ui'
], function($, Public, Config, lite, login, comment, EJS){
	'use strict';

    var timeStamp = new Date().getTime();
	var URLMAP = {
        DETAIL: '/business/ajax/tehui/detail?format=ajax&t=' + timeStamp,
        CHANGEFLIGHT: '/business/ajax/tehui/getprice?format=ajax&t=' + timeStamp,
        GETCOMMENT: '/business/ajax/tehui/comment/list?format=ajax&t=' + timeStamp,
        POSTCOMMENT: '/business/ajax/tehui/comment/add?format=ajax&t=' + timeStamp,
        DELETCOMMENT: '/business/ajax/tehui/comment/del?format=ajax&t=' + timeStamp
    };

	var detail = {
        init: function(){
            this._init();
            this.getPageSid();

            if(this.sid){
                this.getAllData();
            }
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
            };

            Public.init(config);
        },

        getPageSid: function(){
            var param;
            var queryString = window.location.search.substring(1);
            var querys = queryString.split("&");
            if(!querys || querys.length === 0){
                return;
            }
            $.each(querys, function(index, item){
                var query = item.split("=");
                if(query && query.length>0 && query[0] === "sid"){
                    param = query[1];
                }
            });

            this.sid = param;
        },

        _callBack: function(){
            this.changeFight();
        	this.eventBind();
        },

        getAllData: function(){
            var me = this;
            $.get(URLMAP.DETAIL, {
                sid: me.sid
            }, function(response){
                if(response.errno === 0){
                    var data = response.data;
                    me.sid = data.sid;
                    Config.SHARE.url = 'http://lvyou.baidu.com/event/s/southern-airlines/detail.html?sid=' + me.sid;
                    me.formatData(data);
                    me.renderPage(data);
                }
            },'json');
        },

        formatData: function(data){
        	this.departure = data.departure && data.departure[0];
            this.departure_code = data.departure_code && data.departure_code[0];
        	this.destination = data.destination;
            this.destination_code = data.destination_code;
            this.dateList = data.date_list;
        	data.defaultLeave = Public.UnixToDate(this.dateList.leave[0]);
        	this.leaveDate = data.defaultLeave;
        	this.backDate = '';
            lv.session.ticket_id = data.commentid;
        	if(this.dateList.back && this.dateList.back.length){
	        	data.defaultBack = Public.UnixToDate(this.dateList.back[0]);
	        	this.backDate = data.defaultBack;
	        }
	        this.isAccess = ~~data.status;
        },

        renderPage: function(data){

        	this.renderHead(data);

        	this.renderFligthInfo(data);

	        this.renderPlanRecommend(data);

	        this.renderSaleList(data);

	        this.renderDestinations(data);

            comment.init();

	        this._callBack();
        },

        renderHead: function(data){
        	var template = new EJS({url: './template/detail-header.ejs'});
        	this.$header = $('#J_detail-header-wrapper');

        	this.$header.html(template.render({
        		data: data,
        		lite: lite,
                user: lv.session.user || {}
        	}));

        	this.$button = $('#J_get-ticket');
            var ticketSelect = {
                className: 'active',
                text: '立即抢购'
            };
            if (~~data.status === 2){
                ticketSelect = {
                    className: 'none',
                    text: '已抢光'
                };
            }
            else if (~~data.status === 0){
                ticketSelect = {
                    className: 'notbegin',
                    text: '还未开始'
                };
            }
            $('.J_get-ticket').addClass(ticketSelect.className).text(ticketSelect.text);
            $('.J_now-price').text(data.newprice);
            this.detailData = data;

            if(data.status == "-1"){
                $("#J_comment-login-wrapper").show();
            }
        },

        renderFligthInfo: function(data){
        	var $wrapper = $('#J_sale-detail-wrapper');
        	$wrapper.html(data.description);
        },

        renderPlanRecommend: function(data){
        	var plans = data.plans;
            var $wrapper = $('#J_plan-recommend-wrapper');
        	if(!plans || !plans.length){
                $wrapper.parent().hide();
        		return;
        	}
        	var template = new EJS({url: './template/detail-plan.ejs'});
        	$wrapper.html(template.render({
        		list: plans,
        		lite: lite
        	}));
        },

        renderSaleList: function(data){
        	var sales = data.upcoming;
            var $wrapper = $('#J_sale-wrapper');
        	if(!sales || !sales.length){
                $wrapper.parent().hide();
        		return;
        	}
        	var template = new EJS({url: './template/detail-sale.ejs'});
        	$wrapper.html(template.render({
        		list: sales,
        		lite: lite
        	}));
        },

        renderDestinations: function(data){
        	var destinations = data.related_scenes;
            var $wrapper = $('#J_destination-wrapper');
	        if(!destinations || !destinations.length){
                $wrapper.parent().hide();
	        	return;
	        }
	        var template = new EJS({url: './template/detail-destination.ejs'});
        	$wrapper.html(template.render({
        		list: destinations,
        		lite: lite
        	}));
        },

        checkFlightAcess: function(){

        },

        jumpToFlight: function(){
        	if(this.departure && this.leaveDate && this.isAccess === 1){
        		var $form = $('<form></form>');
                var action = '/B2C40/modules/booking/basic/flightSelectDirect.jsp';
                if(this.backDate && this.detailData.nationality != "0"){
                    action = '/B2C40/modules/booking/international/flightSelectReturn_inter.jsp';
                }
        		$form.attr({
        			method: 'POST',
                    target: '_blank',
        			action: 'http://b2c.csair.com' + action
        		});

        		var data = [
        			{ name: 'fromcity', value: this.departure},
        			{ name: 'tocity', value: this.destination},
        			{ name: 'city1_code', value: this.departure_code},
        			{ name: 'city2_code', value: this.destination_code},
        			{ name: 'DepartureDate', value: this.leaveDate},
        			{ name: 'ReturnDate', value: this.backDate},
        			{ name: 'child', value: '0' },
        			{ name: 'adult', value: '1'},
        			{ name: 'segtype', value: '1'},
        			{ name: 'segtype_1', value: '1'},
        			{ name: 'preUrl', value: 'BAIDULVYOU'},
        			{ name: 'infant', value: '0'}
        		];
        		$.each(data, function(index, item){
        			var $input = $('<input type="hidden"/>');
        			$form.append($input.attr({
        				name: item.name,
        				value: item.value
        			}));
        		});
        		$form.submit();
        	}
        },

        changeFight: function(){
            var me = this;
            var leaveDate = me.leaveDate.replace(/-0/g,'-');

            $.get(URLMAP.CHANGEFLIGHT, {
                sname: me.departure,
                sid: me.sid,
                date: leaveDate
            }, function(response){
                if(response.errno === 0){
                    var price = response.data.price;
                    if(price){
                        $('.J_now-price').text(price);
                        if(me.detailData.price){
                            var discount = (price/me.detailData.price * 10).toFixed(1);
                            $('.J_discount').text(discount + '折');
                        }
                    }
                }
            }, 'json');
        },

        formatNotDays: function(type){
            var list = this.dateList[type];
            var notDays = [];
            $.each(list, function(index, item){
                notDays.push(Public.UnixToDate(item).split('-'));
            });
            return notDays;
        },

        notAccessDay: function(date){
            for(var i=0; i<this.notDays.length; i++){
                var item = this.notDays[i];
                if (date.getFullYear() === ~~item[0] &&
                    date.getMonth() === ~~item[1] - 1 &&
                    date.getDate() === ~~item[2]) {
                    return [true, 'access'];
                }
            }
            return [false, 'not-access'];
        },


        eventBind: function(){
        	var me = this;
        	me.$datepicker = {};
        	this.$header.on('click', '.J_time-choose', function(){
        		var $this = $(this);
        		var type = $this.attr('data-type');

                var leave = me.$datepicker['leave'];
                var back = me.$datepicker['back'];
                if(type === 'back'){
                    leave && leave.datepicker('destroy');
                }else if(type === 'leave'){
                    back && back.datepicker('destroy');
                }

                me.notDays = me.formatNotDays(type);
        		var $time = $this.find('.time');
        		var $datepicker = $this.find('.J_datepicker');
        		me.$datepicker[type] = $datepicker.datepicker({
					dateFormat:'yy-mm-dd',
		            monthNamesShort:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
		            dayNames:['日','一','二','三','四','五','六'],
		            dayNamesShort:['日','一','二','三','四','五','六'],
		            changeMonth:true,
		            changeYear:true,
		            //minDate:'-1y',
                    minDate:new Date(),
		            maxDate:'+1y',
		            showAnim:'fadeIn',
		            prevText:'〈',
		            nextText:'〉',
		            defaultDate: $time.text(),
                    beforeShowDay: $.proxy(me.notAccessDay, me),
		            onSelect:function(dateText){
		                $time.text(dateText);
		                me[type + 'Date'] = dateText;
                        me.changeFight();
                        var leave = me.$datepicker['leave'];
                        var back = me.$datepicker['back'];
                        leave && leave.datepicker('destroy');
                        back && back.datepicker('destroy');
		            }
        		});
        	});

        	$(document).on('click', function(e) {
                if(e.target.className === 'J_time-choose' ||
                 	$(e.target).parent().hasClass('J_time-choose') ||
                    $(e.target).parent().hasClass('not-access') ||
                	$(e.target).parents('.ui-datepicker-header').length>0){
                    return;
                }else{
                	var leave = me.$datepicker['leave'];
                	var back = me.$datepicker['back'];
                	leave && leave.datepicker('destroy');
                	back && back.datepicker('destroy');
                }
            });


            this.$button.on('click', function(){
            	me.jumpToFlight();
            });


            this.$header.find('.J_change-flight').on('change', function(){
                var index = $(this).get(0).selectedIndex;
                me.departure = $(this).find("option:selected").text();
                me.departure_code = me.detailData.departure_code[index];
                me.changeFight();
            });

            $(document).on('click', '.J_need-login', function(){
                login.check();
            });

            var $navigation = $('#J_main-navigation');
            var navOffset = $navigation.offset();
            $(window).on('scroll', function(){
                var scrollTop = $(this).scrollTop();
                if(scrollTop >= navOffset.top){
                    $navigation.addClass('navigation-fixed');
                }else{
                    $navigation.removeClass('navigation-fixed');
                }
            });


            $navigation.on('click', '.nav', function(){
                $navigation.find('.nav.active').removeClass('active');
                $(this).addClass('active');
            });
        }
    };

    detail.init();

});
