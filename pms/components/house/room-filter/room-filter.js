/**
 * 房型筛选
 */
var RoomUtil = require('../js/room/room-util.js')
var CellUtil = require('../js/room/roomcell-util.js')

var vm_roomtypes, $panel

module.exports = {
	init: function() {
		var self = this

		$penal = $('#filter-panel')
		$penal.html( __inline('filter.tpl') )

		vm_roomtypes = avalon.define({
			$id: 'vm_roomtypes',
			checkedLength: 0,
			allChecked: true,
			roomtypes: [],

			toggleChecked: function(item) {
				var vm = vm_roomtypes

				item.checked = !item.checked
				if (item.checked) {
					vm.checkedLength = vm.checkedLength + 1
					if ( vm.checkedLength == vm.roomtypes.length ) {
						vm.allChecked = true
					}
				} else {
					vm.checkedLength = vm.checkedLength - 1
					vm.allChecked = false
				}
			},
			checkAll: function() {
				var vm = vm_roomtypes
				var checked = vm.allChecked = !vm.allChecked

				vm.roomtypes.forEach(function(el) {
					el.checked = checked
				})
			},
			submit: function() {
				var arr = vm_roomtypes.roomtypes.$model

				arr.forEach(function(el) {
					var roomtype = RoomUtil.getRoomtypeById(el.id)
					if (roomtype) {
						roomtype.setHide(!el.checked)
					}
				})
				CellUtil.updateRoomtypeView()
				self._close()
			},
			reset: function() {
				self._close()
			}
		})
		avalon.scan($penal[0])
		self.fillData()

		var $head = $penal.find('.filter-panel-head')

		// window open
		$head.on('click', function() {
			self._isOpen() ? self._close() : self._open()
		})

		$penal.on('click', function(e) {
			e.stopPropagation()
		})
		$(document).on('click', function(e) {
			self._close()
		})
	},
	fillData: function() {
		var roomtypes = RoomUtil.getRoomtypes(),
			arr = [],
			count = 0

		roomtypes.forEach(function(el) {
			arr.push({
				id: el.id,
				name: el.name,
				checked: !el.isHide
			})
			if (!el.isHide) {
				count ++
			}
		})

		vm_roomtypes.roomtypes = arr
		vm_roomtypes.checkedLength = count
		vm_roomtypes.allChecked = count === roomtypes.length
	},
	_isOpen: function() {
		return $penal.hasClass('open')
	},
	_open: function() {
		$penal.addClass('open')
	},
	_close: function() {
		$penal.removeClass('open')
		this.fillData()
	}
}