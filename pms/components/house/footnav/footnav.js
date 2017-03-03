//var Dialog = require('dialog')
var User = require('../../header/user.js')

module.exports = {
	init: function() {
		var tpl =  __inline('footnav.tpl')
		var $wrap = $(tpl).appendTo(document.body)
		var trigger = $wrap.children('.nav-circle')
		trigger.on('click', function(event) {
			trigger.parent().toggleClass('open')
		})

		var dateReportTpl = __inline('dateReport.tpl')
		$('#content').append(dateReportTpl)

		// 共享房态地址
		$('#mini_map').attr('href', '/miniMap/'+User.getCurrentInn().mmUniqueCode);

		// 房态跳转
		_roomStyleInit()

		// 今日财务
		__Finance__.init()

		// ota房态
		vm_ota.initData();
	 	avalon.scan(document.getElementById('ota_room_status_div'));
	 	
	 	//单日报表
	 	vm_dateReport.initData();
	 	avalon.scan(document.getElementById('date_report_div'));
	}
}

// 房态跳转
var _roomStyleInit = function() {
	var userInfo = User.getUserInfo(),
		$stylePopups = $('#style_select_popups')

	$stylePopups.find('li[data-value=' + userInfo.roomStyle + ']')
		.addClass('selected')

	$stylePopups.on('click', 'li', function(e) {
		var $this = $(this)

		$this.addClass('selected')
			.siblings()
			.removeClass('selected')

		window.location.href = "/index/style/" + $this.data('value');
	})
}

// 今日财务
var __Finance__ = (function(){
	var util = {}

	var _checkFromTo = function ($from, $to, maxDiffer, selectFrom){
		var from = $from.val();
		var to = $to.val();
		if(from > to && selectFrom){
			$to.val(from);
			return;
		}else if(from > to && !selectFrom){
			$from.val(to);
			return;
		}
		var differ = tmsky.date.getDatePeriod(from, to, 'd');
		if(differ > maxDiffer && selectFrom){
			$to.val(tmsky.date.plusDate(from, maxDiffer, 'd', 'yyyy-MM-dd hh:mm'));
			return;
		}else if(differ > maxDiffer && !selectFrom){
			$from.val(tmsky.date.plusDate(to, -maxDiffer, 'd', 'yyyy-MM-dd hh:mm'));
			return;
		}
	}

	var _financeListTpl = __inline('finance_list.handlebars')

	var _searchFinance = function(from, to) {
		tmsky.ui.dialog.loading()
		$.get('/inns/reports/getFinancialCountJson',{'from':from, 'to': to})
			.done(function(rs) {
				if (rs.status == 200) {
					var data = rs.account
					 // data.roomFeeInCome 房费收入
					 // data.roomFeePayOut 房费支出
					 // data.roomFeeInComeCash 房费现金收入
					 // data.roomFeePayOutCash 房费现金收支出
					 // data.payMentInCome 押金收入
					 // data.payMentPayOut 押金支出
					 // data.payMentInComeCash 押金现金收入
					 // data.payMentPayOutCash 押金现金支出
					 // data.accountBookInCome 账本收入
					 // data.accountBookPayOut 账本支出 
					 // data.accountBookInComeCash 账本现金收入
					 // data.accountBookPayOutCash 账本现金支出

					data.roomFeeInCome -=data.roomFeeInComeCash
					data.payMentInCome -= data.payMentInComeCash
					data.accountBookInCome -= data.accountBookInComeCash
					data.roomFeePayOut -= data.roomFeePayOutCash
					data.payMentPayOut -= data.payMentPayOutCash
					data.accountBookPayOut -= data.accountBookPayOutCash

                    data.goodsInCome -= data.goodsInComeCash
                    data.goodsPayOut -= data.goodsPayOutCash

					data.totalInCome = data.roomFeeInCome + data.payMentInCome + data.accountBookInCome+ data.goodsInCome
					data.totalInComCash = data.roomFeeInComeCash + data.payMentInComeCash + data.accountBookInComeCash+ data.goodsInComeCash
					data.totalPayOut = data.roomFeePayOut + data.payMentPayOut + data.accountBookPayOut+ data.goodsPayOut
					data.totalPayOutCash = data.roomFeePayOutCash + data.payMentPayOutCash + data.accountBookPayOutCash+ data.goodsPayOutCash
					data.from = encodeURI(from)
					data.to = encodeURI(to)

					$('#today_finance_popups')
						.find('table')
						.html( _financeListTpl(data) )

				} else {
					tmsky.ui.dialog.tips('获取失败 ' + rs.message)
				}
			})
			.always(tmsky.ui.dialog.loading.close)
	}

	util.init = function() {
		var $todayFinance = $('#today_finance_popups'),
			$from = $('#finance_from'),
			$to = $('#finance_to'),
			$submitBtn = $('#finance_search'),
			defaultTo = tmsky.date.today() + ' 23:59',
			defaultFrom = tmsky.date.plusDate(defaultTo, 0, 'd', 'yyyy-MM-dd') + ' 00:00'

		$from
			.datetimepicker({
				onClose: function( selectedDate ) {
		        	// $to.datepicker( "option", "minDate", selectedDate );
		        	_checkFromTo($from, $to, 31, true);
		      	}
			})
			.val(defaultFrom)

		$to
			.datetimepicker({
				onClose: function( selectedDate ) {
					// $from.datepicker( "option", "maxDate", selectedDate );
					_checkFromTo($from, $to, 31, false);
				}
			})
			.val(defaultTo)

		$todayFinance.on('show.tc.popups', function(e) {
			// e.preventDefault()
			// 获取数据
			_searchFinance(defaultFrom, defaultTo)
		})

		$submitBtn.on('click', function(event) {
			var from = $from.val(),
				to = $to.val()

			if (from > to) {
				tmsky.ui.dialog.tips('开始日期不能晚于结束日期', 'error')
				return;
			}
			_searchFinance(from, to)
		})
	}

	return util;

}());

// ota房态
var vm_ota =  avalon.define({
	$id: 'vm_ota', // ms-controller="vm_demo" // 控制域
	urls: ['/index/ota/getChannelsAndInns','/index/ota/getOtaRoomStatus'],
	roomStatus: [],
	dataList: [],
	qunarInnList: [],
	xcInnList: [],
	ylInnList: [],
	datas:{
		channelId: '',
		channelName: '',
		from: '',
		to: '',
		otaInnId: ''
	},
	initData: function() {
		$('#ota_datepicker').datepicker({
			minDate: tmsky.date.format(new Date()),
			onSelect: function(selectedDate) {
				vm_ota.datas.from = selectedDate;
				vm_ota.datas.to = tmsky.date.plusDate(selectedDate, 9, 'd', 'yyyy-MM-dd');
				vm_ota.fetchData();
			}
		});
		$('#ota_popups_trigger').bind('click', vm_ota.getOtaInfos);
		$('#ota_id_list li').bind('click', function(){
			var otaId = $(this).attr('ota-id');
			vm_ota.datas.channelId = otaId;
			vm_ota.datas.otaInnId = $('span[ota-id='+otaId+']').attr('data-value');
			vm_ota.datas.from = tmsky.date.format(new Date())
			vm_ota.datas.to = tmsky.date.plusDate(new Date(), 9, 'd', 'yyyy-MM-dd');
			$('#ul_content_list li').hide();
			$('#ul_content_list li[ota-id='+otaId+']').show();
			vm_ota.fetchData();
		});
		$('#ota_room_status_div div.ui-dropdown-list').on('click', 'a', function(){
			vm_ota.datas.otaInnId = $(this).attr('data-value');
			vm_ota.datas.from = tmsky.date.format(new Date())
			vm_ota.datas.to = tmsky.date.plusDate(new Date(), 9, 'd', 'yyyy-MM-dd');
			vm_ota.fetchData();
		});
		$('#ota_status_left_btn').bind('click', function(){
			vm_ota.datas.from = tmsky.date.plusDate(vm_ota.datas.from, -9, 'd', 'yyyy-MM-dd');
			vm_ota.datas.to = tmsky.date.plusDate(vm_ota.datas.to, -9, 'd', 'yyyy-MM-dd');
			vm_ota.fetchData();
		});
		$('#ota_status_right_btn').bind('click', function(){
			vm_ota.datas.from = tmsky.date.plusDate(vm_ota.datas.from, 9, 'd', 'yyyy-MM-dd');
			vm_ota.datas.to = tmsky.date.plusDate(vm_ota.datas.to, 9, 'd', 'yyyy-MM-dd');
			vm_ota.fetchData();
		});
	},
	getOtaInfos: function(e, otaId) {
		var url = vm_ota.urls[0] + vm_ota.generateUrlEndStr();
		var datas = {
		};
		tmsky.ui.dialog.loading('加载中...');
		$.get(url, datas).done(function(rs) {
			if(rs.cis == null || rs.cis.data.length == 0){
				tmsky.ui.dialog.tips('无可用OTA信息', 'error');
				return;
			}
			if (rs.status == 200) {
				$('#ota_room_status_div').popups();
				vm_ota.showOtaList(rs.cis.data);
				vm_ota.fetchData(otaId);
			}else{
				tmsky.ui.dialog.tips(rs.message, 'error');
			}
		}).always(function() {
			tmsky.ui.dialog.loading.close();
		})
	},
	showOtaList: function(otas){
		$('#ota_id_list li').hide().removeClass('active');
		if(otas == null || otas.length == 0){
			return;
		}
		for (var i = 0; i < otas.length; i++) {
			var ota = otas[i];
			var $span = $('li.ui-tabs-panel span[ota-id='+ota.channelId+']');
			$span.text(ota.channelInnIdList[0].name);
			$span.attr('data-value', ota.channelInnIdList[0].id);
			if(i == 0){
				$('#ota_id_list li[ota-id='+ota.channelId+']').addClass('active');
				vm_ota.datas.channelId = ota.channelId;
				$('ul.ui-tabs-content li').hide();
				$('ul.ui-tabs-content li[ota-id='+ota.channelId+']').show();
			}
			if(ota.channelId == 1){
				vm_ota.qunarInnList = ota.channelInnIdList;
			}else if(ota.channelId == 2){
				vm_ota.xcInnList = ota.channelInnIdList;
			}else if(ota.channelId == 3){
				vm_ota.ylInnList = ota.channelInnIdList;
			}
			$('#ota_id_list li[ota-id='+ota.channelId+']').show();
		}
	},
	fetchData: function(otaId) {
		var url = vm_ota.urls[1] + vm_ota.generateUrlEndStr();
		if(!tmsky.isEmpty(otaId)){
			$('#ota_id_list li[ota-id='+otaId+']').click();
			return;
		}
		var datas = {
				channelId: vm_ota.datas.channelId,
				from: vm_ota.datas.from || tmsky.date.format(new Date()),
				to: vm_ota.datas.to || tmsky.date.plusDate(new Date(), 9, 'd', 'yyyy-MM-dd'),
				otaInnId: (vm_ota.datas.otaInnId == undefined || vm_ota.datas.otaInnId == '')?$('span[ota-id='+vm_ota.datas.channelId+']').attr('data-value'):vm_ota.datas.otaInnId
		};
		vm_ota.changeParam(datas.channelId, datas.from, datas.to, datas.otaInnId);
//		tmsky.ui.dialog.loading('加载中...');
		$.post(url, tmsky.ajax.serialize(datas) ).done(function(rs) {
			if (rs.status == 200) {
				vm_ota.dataList = vm_ota.getDateList(datas.from, datas.to);
				vm_ota.getRoomStatus(rs.rs.otaRoomStatus);
				vm_ota.roomStatus = rs.rs.otaRoomStatus;
			} else {
				tmsky.ui.dialog.tips(rs.message, 'error');
			}
		}).always(function() {
			tmsky.ui.dialog.loading.close()
		});
	},
	getDateList: function(from, to){
		var list = [];
		var differ = tmsky.date.getDatePeriod(from, to, 'd');
		for (var i = 0; i <= differ; i++) {
			var day = {
					date: tmsky.date.plusDate(from, i, 'd', 'MM-dd'),
					week: '周'+tmsky.date.getWeek(tmsky.date.plusDate(from, i, 'd', 'yyyy-MM-dd'))
			};
			list.push(day);
		}
		return list;
	},
	getRoomStatus: function(otaRoomStatus){
		if(otaRoomStatus == null || otaRoomStatus.length == 0){
			return;
		}
		for (var i = 0; i < otaRoomStatus.length; i++) {
			var rt = otaRoomStatus[i];
			for (var j = 0; j < rt.roomInfos.length; j++) {
				var rs = rt.roomInfos[j];
				rs.clazz = (rs.status == 'N')?'stop':'';
			}
		}
	},
	changeParam: function(channelId, from, to, otaInnId){
		vm_ota.datas.channelId = channelId;
		vm_ota.datas.from = from;
		vm_ota.datas.to = to;
		vm_ota.datas.otaInnId = otaInnId;
	},
	generateUrlEndStr: function(){
		return "?temp=" + new Date().getTime();
	}
});

var vm_dateReport = avalon.define({
	$id: 'vm_dateReport',
	urls: ['/inns/reports/getDateReportJson'],
	reportInfo: {
		date: '',
		totalRoomFee: 0,
		saledRooms: 0,
		restRooms: 0,
		checkInMans: 0,
		checkOutMans: 0,
		notReturnPayment: 0,
		willReturnPayment: 0
	},
	datas: {
		from: '',
		to: ''
	},
	initData: function(){
		$('#date_grid').on('click', 'dl', function(){
			$('#date_report_div').popups();
			var from = $(this).attr('markdate');
			var to = from;
			vm_dateReport.getDateReport(from, to);
		});

	},
	getDateReport: function(from, to){
		if(!tmsky.isEmpty(from)){
			vm_dateReport.datas.from = from;
		}
		if(!tmsky.isEmpty(to)){
			vm_dateReport.datas.to = to;
		}
		var datas = {
			from: vm_dateReport.datas.from,
			to: vm_dateReport.datas.to
		};
		var url = vm_dateReport.urls[0];
		tmsky.ui.dialog.loading('加载中...');
		$.post(url, datas).done(function(rs) {
			if (rs.status == 200) {
				vm_dateReport.reportInfo = rs.report;
			}else{
				tmsky.ui.dialog.tips(rs.message, 'error');
			}
		}).always(function() {
			tmsky.ui.dialog.loading.close();
		});
	}
	
});