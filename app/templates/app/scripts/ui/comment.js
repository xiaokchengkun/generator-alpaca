define([
	'jquery',
	'ejs',
	'ui/login',
	'ui/lite',
	'ui/counter',
	'ui/pagination',
	'ui/ext'
], function($, EJS, login, lite, countback){
	'use strict';

	var MAPURL = {
		GETCOMMENT: '/business/ajax/tehui/comment/list?format=ajax',
        ADDCOMMENT: '/business/ajax/tehui/comment/add?format=ajax',
        DELETECOMMENT: '/business/ajax/tehui/comment/del?format=ajax'
	};

	var Comment = {
		init: function(){
			this.getCommentUrl = MAPURL.GETCOMMENT + '&t=' + new Date().getTime();
			this.addCommentUrl = MAPURL.ADDCOMMENT;
			this.deleteCommentUrl = MAPURL.DELETECOMMENT;
			this.rn = 10;
			this.pn = 0;
			this.commentData = {};
			this.commentTemplate =  new EJS({url:'./template/comment.ejs'});
			this.$commentWrapper = $('#J_comment-area-wrapper');
			this.$commentListWrapper = this.$commentWrapper.find('#J_view-comment-list');
			this.$commentInput = this.$commentWrapper.find('#J_comment-input');
			this.$commentCounter = this.$commentWrapper.find('#J_comment-counter');
			this.$commentSubmit = this.$commentWrapper.find('a[data-action=submit]');
			this.commentPager = false;

			this.defaultWord = '亲，说说你对这个行程计划的想法~';
			//inputprompt.create(this.$commentInput[0], this.defaultWord);

			this.counterBack();
			this.getCommentList(0);
			this.eventBind();
		},

		resetComment: function(){
			this.reply_id = 0;
			this.$commentInput.val('');
			this.$commentInput.focus().blur();
		},

		getCommentList : function(pn){
			var me = this;
			$.get(this.getCommentUrl, {
				ticket_id: lv.session.ticket_id,
				pn: pn,
				rn: this.rn
			}, function(response){
				if(response.errno === 0){
					var data = response.data;
					var list = data.list;
					var total = data.total;
					if( !me.commentPager && total > me.rn){
						me.renderCommentPager(total);
						me.commentPager = true;
					}
					if(list && list.length > 0){
						var html = [];
						$.each(list, function(index, item){
							me.commentData[item.reply_id] = item;
							html.push(me.renderCommentHtml(item));
						});
						me.$commentListWrapper.html(html.join(''));
					}
				}
			}, 'json');
		},

		renderCommentHtml: function(data){
			data.user.avatar = lite.getUserHead(data.user.avatar_large, data.user.avatar_source);
			data.can_delete = lv.session.user && (lv.session.user.is_admin ||
				lv.session.user.is_owner ||
				(lv.session.user.uid === data.user.uid));
			data.create_time = lite.date('Y-m-d H:m:s',data.create_time);
			data.content = $.string.encodeHTML(data.content);
			return this.commentTemplate.render(data);
		},

		replyComment: function(reply_id){
			if(!reply_id){
				return;
			}
			this.reply_id = reply_id;
			var uname = this.commentData[reply_id].user.nickname;
			var value = '回复' + uname + '：' + ( (this.$commentInput.val() == this.defaultWord)? '': this.$commentInput.val());
			this.$commentInput.val(value);
			var me = this;
			var len = value.length;
			//将光标挪到队尾
			if (document.selection) {
				var sel = this.$commentInput[0].createTextRange();
				sel.moveStart('character',len);
				sel.collapse();
				sel.select();
			} else if (typeof this.$commentInput[0].selectionStart === 'number' && typeof this.$commentInput[0].selectionEnd === 'number') {
				this.$commentInput[0].selectionStart = this.$commentInput[0].selectionEnd = len;
			}
			setTimeout(function(){
				me.$commentInput.focus();
			}, 0);
		},

		addComment: function(){
			var value = $.trim(this.$commentInput.val());
			if(!value){
				return;
			}
			var query = {
				ticket_id: lv.session.ticket_id,
				content: value,
				bdstoken: lv.session.user.bdstoken || 0
			};
			if(this.reply_id){
				query.reply_id = this.reply_id;
			}
			var me = this;
			$.post(this.addCommentUrl, query, function(response){
				if(response.errno === 0){
					var data = response.data;
					data.user = lv.session.user || {};
					data.content = value;
					var reply_id = data.reply_id;
					me.commentData[reply_id] = response.data;
					me.$commentListWrapper.prepend(me.renderCommentHtml(data));
					me.resetComment();
				}
			}, 'json');
		},

		deleteComment: function(reply_id, $parent){
			var me = this;
			this.deleteCommentDialog = $('<p>确定要删除评论吗？</p>').dialog({
				title: '删除',
				'buttons': [{
					'text': '确定',
					'click': function(){
						var $this = $(this);
						$.post(me.deleteCommentUrl, {
							ticket_id: lv.session.ticket_id,
							reply_id: reply_id,
							bdstoken: lv.session.user.bdstoken || 0
						},function(response){
							if(response.errno === 0){
								$this.dialog('destroy');
								$parent.fadeOut(function(){
									$parent.remove();
								});
							}
						}, 'json');
					}
				},{
					'text': '取消',
					'click': function(){
						$(this).dialog('destroy');
					}
				}]
			});
		},

		renderCommentPager: function(total){
			var me = this;
			var options = {
				size: 'small',
				currentPage: 1,
				totalPages:  Math.ceil(total/me.rn),
				numberOfPages: 10,
				alignment: 'center',
				pageUrl: function(type, page, current){
					return '#'+page;
				},
				itemTexts: function (type, page, current) {
					switch (type) {
						case 'first':
							return '首页';
						case 'prev':
							return '前一页';
						case 'next':
							return '下一页';
						case 'last':
							return '尾页';
						case 'page':
							return page;
					}
				},
				onPageClicked: function(e,originalEvent,type,page){
					var pn = (page-1) * me.rn;
					me.getCommentList(pn);
				}
			};
			$('#J_comment-pagination').bootstrapPaginator(options);
		},

		counterBack: function(){
			//初始化字数倒计
			var me = this;
			countback(this.$commentInput,{
				numberContainer: this.$commentCounter,
				max: 300,
				onfail: function(){
					me.$commentSubmit.addClass('button-disable').attr('disabled', 'disabled');
				},
				onsuccess: function(){
					me.$commentSubmit.removeClass('button-disable').removeAttr('disabled');
				}
			});
		},

		eventBind: function(){
			var me = this;
			this.$commentWrapper.delegate('a', 'click', function(){
				var $target = $(this);
				var action = $target.attr('data-action');
				if(action){
					var reply_id = 0;
					var $parent = $target.parents('.J_comment-item');
					if($parent){
						reply_id = $parent.attr('data-reply_id');
					}
					switch (action){
						case 'reply':
							login.check(function(){
								me.replyComment(reply_id);
							});
							break;
						case 'delete':
							me.deleteComment(reply_id, $parent);
							break;
						case 'submit':
							login.check(function(){
								if(!$target.hasClass('disable')){
									me.addComment(reply_id);
								}
							});
							break;
					}
				}
			});
		}

	};


	return Comment;
});

