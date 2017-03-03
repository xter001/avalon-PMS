/**
 * 房间帮助类
 */

// pojo
function Room() {}

Room.init = function(obj) {
	var room = new Room()

	room.id = obj.id
	room.roomNo = obj.roomNo
	room.price = obj.price
	room.serialNo = obj.serialNo
	room.roomtype = obj.roomtype
	room.isDirty = !!obj.isDirty

	return room
}
// 设置 脏房
Room.prototype.setDirty = function(dirty) {
	this.isDirty = !!dirty
	var dirtyParam = this.isDirty ? 1 : 0,
		roomId = this.id

	$.get('/room/clean/' + roomId + '/' + dirtyParam, {
		tmp : new Date().getMilliseconds()
	})
}

function Roomtype() {}

Roomtype.init = function(obj) {
	var roomtype = new Roomtype()

	roomtype.id = obj.id
	roomtype.name = obj.name
	roomtype.shortName = obj.shortName
	roomtype.normalPrice = obj.normalPrice
	roomtype.serialNo = obj.serialNo, roomtype.isFold = false
	roomtype.isHide = false
	roomtype.rooms = []

	return roomtype
}

Roomtype.prototype.setFold = function(fold) {
	this.isFold = !!fold
}

Roomtype.prototype.setHide = function(hide) {
	this.isHide = !!hide
}

var _roomlist = {
	length : 0
},
	_roomtypeCache = [],
	_typelist = {
		length : 0
	},
	readyList = [],
	initing = false,
	_getAllList = function(list) {
		var k, v,
			arr = []
		for (k in list) {
			v = list[k]
			if (v && v.id) {
				arr.push($.extend(true, {}, v))
			}
		}
		return arr
	}, $roomGrid

module.exports = {
	getById : function(id) {
		return _roomlist[id]
	},
	getSize : function() {
		return _roomlist.length
	},
	getRoomtypeSize : function() {
		return _roomtypeCache.length
		// return _typelist.length
	},
	getAll : function() {
		return _getAllList(_roomlist)
	},
	getRoomtypes : function() {
		return _roomtypeCache;
		// return _getAllList(_typelist)
	},
	getRoomtypeById : function(roomtypeId) {
		return _typelist[roomtypeId]
	},
	init : function() {
		var self = this
		if (!initing) {
			initing = true
			$.get('/room/getRooms/1', {
				v : new Date().getMilliseconds()
			}).done(function(rs) {
				var arr = rs.innRooms || [], rtJson, roomtype, room

				arr.forEach(function(el) {
					rtJson = el.roomType
					roomtype = _typelist[rtJson.id] || Roomtype.init(rtJson)
					if (!_typelist[roomtype.id]) {
						_typelist[roomtype.id] = roomtype
						_roomtypeCache.push(roomtype)
						_typelist.length++;
					}
					el.roomtype = roomtype
					room = Room.init(el)
					// 放入容器
					if (!_roomlist[room.id]) {
						_roomlist[room.id] = room
						_roomlist.length++;
					}
					roomtype.rooms.push(room)
				})
				self.fireReady()
			})
		}
		return self
	},
	ready : function(cb) {
		if (typeof cb !== 'function')
			return;

		if (readyList == null) {
			cb()
		} else {
			readyList.push(cb)
			if (!initing) {
				this.init()
			}
		}
	},
	fireReady : function() {
		if (readyList) {
			readyList.forEach(function(fn) {
				fn()
			})
			readyList = null
		}
	}
}