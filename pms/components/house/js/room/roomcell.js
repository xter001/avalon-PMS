var CONST = require('../../../common/js/const.js')
var Plug = require('../../../header/plug.js')

var __style__ = CONST.STYLE_DEFAULT,
	__OrderTpl__ = __inline('../../handlebars/order.handlebars'),
	__ExcelTpl__ = __inline('../../handlebars/excel.handlebars'),
	__OldTpl__ = __inline('../../handlebars/old-order.handlebars'),
	__NOT_PAY_FUNC__ = null, __W__, __H__,
	__render_pool__ = [];

var _getCellUtil = function() {
	if (!_getCellUtil.cache) {
		_getCellUtil.cache = require('./roomcell-util.js')
	}
	return _getCellUtil.cache
}

// pojo
function Roomcell(element, roomId, date, roomtypeId, pos, roomNo) {
	this.$el = $(element)
	this.element = element
	this.roomId = roomId
	this.roomNo = roomNo
	this.roomtypeId = roomtypeId
	this.date = date
	this.week = tmsky.date.date(date).getDay() || 7

	this.givenPrice = this.weekPrice = null
	this.isLock = false

	this.orderType = null
	this.orderId = null
	this.mainId = null
	this.updatedAt = null
	this.mainLen = 0
	this.refUid = null // 盖住此订单的格子
	this.$price = null
	this.pos = pos // cell position

	// this.forthwithPrice = null;
}

Roomcell.setStyle = function(style) {
	__style__ = +style
	return this
}

Roomcell.isDefStyle = function(style) {
	style = style || __style__
	return style == CONST.STYLE_DEFAULT
}

Roomcell.isXyStyle = function(style) {
	style = style || __style__
	return style == CONST.STYLE_XY
}

Roomcell.isExcelStyle = function(style) {
	style = style || __style__
	return style == CONST.STYLE_EXCEL
}

Roomcell.isOldStyle = function(style) {
	style = style || __style__
	return style == CONST.STYLE_OLD
}

Roomcell.releaseRenderPool = function() {
	if (__render_pool__) {
		__render_pool__.forEach(function(el, index) {
			el.element.innerHTML = el.content
		})
	}
	__render_pool__ = null;
	return this
}

Roomcell.prototype = {
	// 锁房
	lock : function() {
		this.empty()
		this.isLock = true
		this.$el.addClass('room-lock')
	},
	// 周末价格
	setWeekPrice : function(price) {
		if (this.isLock || this.givenPrice !== null || this.weekPrice !== null)
			return this;

		this.weekPrice = price
		this.$price = this.$price || $('<em class="given-price"></em>').appendTo(this.$el.parent())
		this.$price.text(price).parent().addClass('given-price-td')
		return this
	},
	// 特殊价格
	setGivenPrice : function(price) {
		if (this.isLock)
			return this;

		this.givenPrice = price
		this.$price = this.$price || $('<em class="given-price"></em>').appendTo(this.$el.parent())
		this.$price.text(price).parent().addClass('given-price-td')

		return this
	},
	hasSpecialPrice : function() {
		return (this.givenPrice || this.weekPrice) ? true : false;
	},
	// 获取房态格子价格 givenPrice 》 weekPrice
	getPrice : function() {
		return this.givenPrice != null ? this.givenPrice : this.weekPrice
	},
	// 渲染订单
	renderOrder : function(main, days, type, orderId) {
		if (type === CONST.SUB_CANCLE)
			return;
		__NOT_PAY_FUNC__ = __NOT_PAY_FUNC__ == null ? Plug.hasFunc(Plug.F_NOT_PAY) : __NOT_PAY_FUNC__
		var $el = this.$el,
			__W__ = __W__ || $el.width(),
			__H__ = __H__ || $el.height(),
			data = {
				guest : main.guest || '',
				channelName : main.channelName || '',
				cfColorValue : main.cfColorValue,
				weifu : main.icon  != 4 && __NOT_PAY_FUNC__ && main.totalAmount > main.paidAmount,
				needPlane : main.icon == 1 ? true : false,
				needCar : main.icon == 2 ? true : false,
				needSpe : main.icon == 3 ? true : false,
				needRatePlan : main.icon == 4 ? true : false,
				needdanbao : main.icon == 7 ? true : false,
				hasRemind : main.hasRemind,
				days : new Array(days),
				type : '',
                channelWidth:null,
				width : null,
				height : null,
				maskWidth : null,
				multDaysFlag : days > 1 ? 'multi' : 'single'
			},
			content = ''

		// 其他渠道 不显示（囧 房态返回没有channelId 只能汉字啦）
		if (data.channelName === '其它渠道') {
			data.channelName = ''
		}

		data.type = type === CONST.SUB_BOOK ? 'booked' : type === CONST.SUB_IN ? 'checkin' : type === CONST.SUB_OUT ? 'checkout' : ''

		switch (__style__) {
			case CONST.STYLE_XY:
				data.height = __H__ * days + days - 8
				if (data.channelName.length > 5 && !(!data.weifu && !data.needPlane && !data.needCar && !data.needSpe && !data.needRatePlan && !data.needdanbao && !data.hasRemind)) {
					data.channelWidth = 70
				}
				content = __OrderTpl__(data)
				break
			case CONST.STYLE_EXCEL:
				// 退房后变灰
				if (Plug.hasFunc(Plug.F_TUI_GRAY) && type === CONST.SUB_OUT) {
					data.cfColorValue = '#CBCBCB'
				}
				data.width = __W__ * days + days - 3
				data.maskWidth = __W__ * days + days
				content = __ExcelTpl__(data)
				break

			case CONST.STYLE_OLD:
				data.width = __W__ * days + days
				data.maskWidth = __W__ * days + days
				content = __OldTpl__(data)
				break

			default:
				data.width = __W__ * days + days - 11
				data.maskWidth = __W__ * days + days + 1
                if (data.channelName.length > 5 && days == 1 && !(!data.weifu && !data.needPlane && !data.needCar && !data.needSpe && !data.needRatePlan && !data.needdanbao && !data.hasRemind)) {
                    data.channelWidth = 62
                }
				content = __OrderTpl__(data)
		}

		$el.removeClass('room-seleted')

		// $el.html(content)
		__render_pool__ = __render_pool__ || []
		__render_pool__.push({
			element : this.element,
			content : content
		})

		this.orderType = type
		this.orderId = orderId
		this.mainId = main.id
		this.mainLen = days
	},
	_findOrderItem : function(index) {
		var exp = 'li[role="orderitem"]'

		if (index != null)
			exp += '[days=' + index + ']'
		return this.$el.find(exp)
	},
	turnOn : function(index) {
		if (this.mainId) {
			this.$el.addClass('on')
			this._findOrderItem(index).removeClass('off')
		} else
			this.$el.addClass('room-seleted')
	},
	turnOff : function(index) {
		if (index == null) {
			var className = this.mainId ? 'on' : 'room-seleted'
			return this.$el.removeClass(className)
		} else {
			this._findOrderItem(index).addClass('off')
		}
	},
	isOn : function(index) {
		if (index == null) {
			var className = this.mainId ? 'on' : 'room-seleted'
			return this.$el.hasClass(className)
		}
		return !this._findOrderItem(index).hasClass('off')
	},
	isXyStyle : function(style) {
		style = style || __style__
		return style == CONST.STYLE_XY
	},
	empty : function() {
		this.$el.empty().removeClass('room-seleted').removeClass('on')

		// brothers

		var i, len, el;
		for (i = 1, len = this.mainLen; i < len; i++) {
			el = _getCellUtil().next(this, i)
			if (el) {
				el.orderType = null
				el.orderId = null
				el.mainId = null
				el.mainLen = 0
				el.refUid = null
			}
		}

		this.orderType = null
		this.orderId = null
		this.mainId = null
		this.mainLen = 0
		this.refUid = null // 盖住此订单的格子

		return this
	},
	resetDate : function(date) {
		this.date = date
		this.week = tmsky.date.date(date).getDay() || 7
		this.$el.attr('date', date).removeClass('room-lock')

		this.$price && this.$price.remove()

		this.$price = null
		this.isLock = false
		this.givenPrice = null
		this.weekPrice = null

		var parent = this.$el.parent()

		parent.attr('class', '')
		if (this.week === 7) {
			parent.addClass('week-line')
		}
		return this
	}
}

// 修正构造器
module.exports = Roomcell.prototype.constructor = Roomcell