//var Dialog = require('dialog')
//var Pagination = require('pagination')

var Controller = require('../js/control.js')

var $dialog, $page, vm_top_search, PAGE_SIZE = 3

var _setPage = function(items) {
	if (!items) {
		$page.hide()
		return;
	}

	$page.pagination({
		items : items,
		edges : 0,
		itemsOnPage : PAGE_SIZE,
		displayedPages : 5,
		onPageClick : function(pageNo, e) {
			vm_top_search.showPage(pageNo)
		}
	}).show()
}

module.exports = {
	init : function() {
		if (!$dialog) {
			$dialog = $(__inline('search.tpl')).prependTo($('#top_right_nav'))
			$page = $('#search_page')

			vm_top_search = avalon.define({
				$id : 'vm_top_search',
				searchText : '',
				open : false,
				currentPage : 1,
				showSearchResult : false,
				itemArr : [
				// {
				// show: true,
				// date: '',
				// orderId: '',
				// statusText: '',
				// userName: '',
				// contact: '',
				// customerFrom: '',
				// orderNo: '',
				// tips: ''
				// }
				],

				toggle : function(e) {
					var vm = vm_top_search,
						$tg = $(e.target)
					
					vm.open = !vm.open
					vm.showSearchResult = false
					if (vm.open) {
						$tg && $tg.parent().find("#order-search-ipt").focus().select()
						// 清除当前操作的格子状态
						// Controller.clearSelected();
						// $("#icon-search-i")[0].focus();
					}
				},

				// 搜索
				searchHandle : function(e, tg) {
					var vm = vm_top_search, 
						keyword = vm.searchText.trim(),
						$tg = tg || $(e.target)

					if (keyword === '')
						return false;
					if (tmsky.string.getBytes(keyword) < 4) {
						tmsky.ui.dialog.alert("请至少输入两个汉字或四个字符！");
						return;
					}
					if($tg.attr("handle")) return
					$tg.attr("handle", "true")
					
					var resetSearchBtnFlag = function(){
						var $osb = $tg || $("#order-search-btn")
						$osb && $osb.removeAttr("handle")
					};
					
					tmsky.ui.dialog.loading()
					$.post("/order/search", {
						"patten" : keyword
					}).done(function(rs) {
						tmsky.ui.dialog.loading.close()
						if (rs.status == 200) {
							var orders = rs.orders || []

							// 分页信息
							_setPage(orders.length)

							// 没有搜索到结果
							if (rs.searchResult == 1 && orders.length === 1) {
								// 只有一条，则定位
								Controller.LinkMainOrder(orders[0].orderId, orders[0].startedAt, resetSearchBtnFlag)
								vm.close()
							} else {
								// 填充数据
								vm_top_search.itemArr = orders.map(function(el, index) {
									var statusText = el.status == 2 ? "预订" : el.status == 3 ? "入住" : el.status == 4 ? "退房" : '';
									return {
										show : index < PAGE_SIZE,
										orderId : el.orderId,
										date : el.startedAt,
										statusText : statusText,
										userName : el.userName || "姓名未知",
										contact : el.contact || "电话未知",
										customerFrom : el.customerFrom || "来源未知",
										orderNo : el.orderNo || "订单号未知",
										tips : (el.tips === "null") ? "" : el.tips
									}
								})
								vm.showSearchResult = true
							}
							resetSearchBtnFlag()
						}
					}).fail(function() {
						tmsky.ui.dialog.alert("搜索失败，请刷新页面重新操作");
						tmsky.ui.dialog.loading.close()
					});
				},
				// 关闭
				close : function() {
					var vm = vm_top_search

					_setPage()
					vm_top_search.itemArr.removeAll()
					//vm.searchText = ''
					vm.open = false
				},
				showPage : function(pageNo) {
					var vm = vm_top_search, currentPage = vm.currentPage, startIndex = (currentPage - 1) * PAGE_SIZE, el

					if (pageNo == currentPage)
						return;

					for (var i = 0; i < PAGE_SIZE; i++) {
						el = vm.itemArr[startIndex + i]
						if (el) {
							el.show = false
						}
					}

					startIndex = (pageNo - 1) * PAGE_SIZE

					for (var i = 0; i < PAGE_SIZE; i++) {
						el = vm.itemArr[startIndex + i]
						if (el) {
							el.show = true
						}
					}

					vm.currentPage = pageNo
				},
				linkItem : function(el) {
					var vm = vm_top_search
					// 定位订单
					Controller.LinkMainOrder(el.orderId, el.date)
					vm.close()
				}
			})

			avalon.scan($dialog[0])
		}

	}
}