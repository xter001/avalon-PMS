var CONST = require('../../../common/js/const.js')
var Roomcell = require('./roomcell.js')
var RoomUtil = require('./room-util.js')
var Plug = require('../../../header/plug.js')
var User = require('../../../header/user.js')

var _list = {},
    _uidSeed = {
        MAX : 1000,
        length : 0
    },
    _style = CONST.STYLE_DEFAULT,
    _isFold = false, _days, _startDate, $topBox, $centerBox, $leftBox,
    roomBoxSize = {}

// 根据 种子 排序增长
function _generator(seed) {
    var uid = _uidSeed[seed]
    if (!uid) {
        _uidSeed.length = _uidSeed.length + 1
        uid = _uidSeed.length * _uidSeed.MAX
    }
    return _uidSeed[seed] = uid + 1
}

// 控制器
module.exports = {
    // 获取格子起止时间
    getDateDuration : function () {
        if (_days) {
            return {
                min : _start,
                max : tmsky.date.plusDate(_start, _days, 'd', 'yyyy-MM-dd'),
                days : _days
            }
        }
    },
    getByUid : function (uid) {
        return _list[uid]
    },
    next : function (cell, step) {
        var uid = cell.uid,
            step = step || 0

        return _list[uid + step]
    },
    getByRoomAndDate : function (roomId, date) {
        if (!_uidSeed[roomId])
            return

        var last = _uidSeed[roomId],
            first = last - (last % _uidSeed.MAX) + 1,
            firstDate = _list[first].date,
            overage = tmsky.date.getDatePeriod(firstDate, date),
            cursor = first + overage

        if (overage >= 0 && cursor <= last) {
            return _list[cursor]
        }
    },
    getByRoomAndWeek : function (roomId, week) {
        if (!_uidSeed[roomId])
            return

        var last = _uidSeed[roomId],
            len = last % _uidSeed.MAX,
            first = last - len + 1,
            week = week + '',
            ret = [], i, el;

        for (i = 0; i < len; i++) {
            el = _list[first + i]
            if (el && week === (el.week + '')) {
                ret.push(el)
            }
        }

        return ret
    },
    getCellAfterMove : function (cell, xNum, yNum) {
        if (_style == CONST.STYLE_XY) {
            var temp = xNum
            xNum = yNum
            yNum = temp
        }
        var uid = cell.uid,
            cursor = uid + xNum,
            rs = _list[cursor],
            derict = yNum > 0 ? 1 : -1,
            step = Math.abs(yNum), roomtype, roomtypeId

        if (step != 0) {
            var roomtypeFoldMap = {}
            while (step > 0) {
                cursor = cursor + _uidSeed.MAX * derict
                rs = _list[cursor]
                if (!rs) {
                    rs = null
                    break
                }
                roomtypeId = rs.roomtypeId
                roomtype = RoomUtil.getRoomtypeById(roomtypeId)

                if (!roomtype.isHide) {
                    if (!roomtype.isFold || (roomtype.isFold && !roomtypeFoldMap[roomtypeId])) {
                        step = step - 1
                        if (roomtype.isFold && step == 0) {
                            rs = null
                            break
                        }
                    }
                    if (roomtype.isFold) {
                        roomtypeFoldMap[roomtypeId] = true
                    }
                }
            }
        }
        return rs
    },
    getFirstCellDuration : function (roomId, date, days) {
        var last = _uidSeed[roomId],
            first = Math.floor(last / _uidSeed.MAX) * _uidSeed.MAX + 1,
            firstDate = _list[first].date,
            overage = tmsky.date.getDatePeriod(firstDate, date),
            cursor = first + overage

        if (overage >= 0 && cursor <= last) {
            return _list[cursor]
        }
        if (overage < 0 && (overage + days >= 0)) {
            return _list[first]
        }
    },
    // 取消选中格子
    turnOffCells : function (roomId, start, days) {
        var first = this.getByRoomAndDate(roomId, start), el, i

        if (first && days > 0) {
            for (i = 0; i < days; i++) {
                el = this.next(first, i)
                if (el && el.mainId == null) {
                    el.turnOff()
                }
                if (el && el.mainId != null) {
                    first.turnOff(i)
                }
            }
        }
        return this
    },
    // 选中格子
    turnOnCells : function (roomId, date, days) {
        if (!days)
            return

        var first = this.getByRoomAndDate(roomId, date), el, i

        if (first && days > 0) {
            for (i = 0; i < days; i++) {
                el = this.next(first, i)
                if (el && el.mainId == null) {
                    el.turnOn()
                }
                if (el && el.mainId != null) {
                    first.turnOn(i)
                }
            }
        }
        return this
    },
    // 获取最大选中格子数(不包括开始格子)
    maxTurnOnCells : function (roomId, date, offset) {
        var first = this.getByRoomAndDate(roomId, date),
            days = 1,
            isOverScope = false,
        // 超过了范围
            el = first ? offset ? this.next(first, offset) : first : null

        if (el == null) {
            isOverScope = true
        }
        for (; el != null;) {
            el = this.next(first, days + offset)
            if (el == null)
                isOverScope = true
            if (el == null || el.isOn())
                break
            // 不同订单
            if (el.mainId != null && el.mainId !== first.mainId)
                break
            // 同一订单
            if (el.mainId != null && el.mainId == first.mainId && first.isOn(days + offset))
                break
            days = days + 1
        }
        days = isOverScope ? CONST.MAX_SELECT_DAYS : days - 1
        return days
    },
    // 获取日期数组
    _getDateArr : function (days, start) {
        var ret = [],
            today = tmsky.date.today(), i, el, ymd, w, holiday, className, dateText;

        _days = days
        _start = start

        for (i = 0; i < days; i++) {
            el = tmsky.date.addDays(start, i)
            ymd = tmsky.date.format(el)
            w = el.getDay()
            holiday = tmsky.date.getHoliday(el)
            className = (today === ymd) ? 'today' : (w === 6 || w === 0) ? 'weekend' : '';

            // dateText = today === ymd ? '今天' : ymd.substr(8)
            // dateText = dateText === '01' ? ymd.substr(5) : dateText

            dateText = today === ymd ? '今天' : ymd.substr(5)

            if (holiday) {
                className += ' holiday'
                dateText = holiday
            }
            ret.push({
                value : ymd,
                holiday : holiday,
                text : dateText,
                className : className,
                // week: '周' + tmsky.date.getWeek(el),
                week : '' + tmsky.date.getWeek(el),
                weeklineClass : w === 0 ? 'week-line' : ''
            })
        }

        return ret
    },
    // 渲染房态网格
    renderRoomGrid : function (days, start) {
        var dates, rooms, roomtypes, userInfo, tpl

        dates = this._getDateArr(days, start)
        rooms = RoomUtil.getAll()
        roomtypes = RoomUtil.getRoomtypes()
        userInfo = User.getUserInfo()

        _isFold = Plug.hasFunc(Plug.F_FOLD)
        _style = userInfo.roomStyle

        Roomcell.setStyle(_style)

        if (_style == CONST.STYLE_XY) {
            // 横版房态
            tpl = __inline('../../handlebars/xy-roomgrid.handlebars')
        } else {
            tpl = __inline('../../handlebars/roomgrid.handlebars')
        }

        if (_isFold) {
            // roomtypes.sort(function(a, b) {
            // return a.serialNo - b.serialNo
            // })
        } else {
            rooms.sort(function (a, b) {
                return a.serialNo - b.serialNo
            })
        }

        /**
         * 滚动条联动
         */
        var $content = $('#content'),
            styleName = _style == CONST.STYLE_XY ? 'xy-room' : _style == CONST.STYLE_EXCEL ? 'excel-room' : _style == CONST.STYLE_OLD ? 'old-room' : 'def-room'

        $content.addClass(styleName).append(tpl({
            'dates' : dates,
            'rooms' : rooms,
            'roomtypes' : roomtypes,
            'isFold' : !!_isFold
        }))

        // 滚动条联动
        $leftBox = $content.find('.content-box-panel')
        $centerBox = $content.find('.content-box-grid')
        $topBox = $content.find('.top-box-grid')

        $centerBox.scroll(function (e) {
            var $this = $(this)
            $leftBox.css('top', $this.scrollTop() * -1)
            $topBox.css('left', $this.scrollLeft() * -1)
        })

        // 头部拖动
        var __left__ = $topBox.position.left,
            $divUnclick = $('#date_grid'),
            clickEvents = null

        $topBox.draggable({
            addClasses : false,
            scroll : false,
            axis : "x",
            start : function (e, ui) {
                $topBox.data('startLeft', $centerBox.scrollLeft()).data("maxleft", $centerBox[0].scrollWidth - $centerBox[0].clientWidth)

                clickEvents = clickEvents || $._data($divUnclick[0], 'events')
                $._data($divUnclick[0], 'events', null)
            },
            drag : function (e, ui) {
                var start = $topBox.data('startLeft');
                var max = $topBox.data('maxleft');
                var mileage = ui.position.left - ui.originalPosition.left;
                if (start <= __left__ && ui.position.left > __left__) {
                    ui.position.left = __left__;
                    return;
                }
                ui.position.left = __left__;
                if (Math.abs(ui.position.left) >= max) {
                    $centerBox.scrollLeft(max);
                    return;
                }
                $centerBox.scrollLeft(start - mileage);
            },
            stop : function (e, ui) {
                $topBox.css('left', $centerBox.scrollLeft() * -1)
                setTimeout(function () {
                    $._data($divUnclick[0], 'events', clickEvents);
                }, 2000)
            }
        })

        var firstBox = $centerBox.find('td:first')
        roomBoxSize = {
            w : firstBox.outerWidth() + 1,
            h : firstBox.outerHeight() + 1
        }
        this.signCellPosition()
        this.adjustCss()
        this.adjustCssByXyRoomNumStat()
        return this
    },
    adjustCssByXyRoomNumStat : function () {
        if (_style == CONST.STYLE_XY) {
            var $roomGrid = $('#room_grid')
            $roomGrid.find('li dl dt').click(function () {
                var roomTypeFolder = $roomGrid.find('li[roomtype-folder]:visible'),
                    roomTypeCell = $roomGrid.find('li[roomtype-cell]'),
                    visibleRoomTypeCell = $roomGrid.find('li[roomtype-cell]:visible').length,
                    isFolder = $(this).grandParent().attr('roomtype-folder'),
                    roomTypeFolders = roomTypeFolder.length - visibleRoomTypeCell + (isFolder ? -1 : 1)
                //当为非折叠房型cell时+1
                roomTypeFolders = isFolder ? roomTypeFolders : roomTypeFolders + 1
                if (roomTypeFolders == roomTypeCell.length) {
                    $roomGrid.find('li[roomtype-folder] dl').removeClass('room-cell-folder')
                } else {
                    $roomGrid.find('li[roomtype-folder] dl').addClass('room-cell-folder')
                }
            })
        }
    },
    adjustCss : function () {
        // 非横版房态IE环境下content-box-panel格子高度兼容
        if (Roomcell.isXyStyle(_style)) {
            return;
        }
        if ('ActiveXObject' in window) {
            var h, v,
                isExcelStyle = Roomcell.isExcelStyle(_style),
                matchs = /msie \d{1,}(.\d{1,})*/i.exec(navigator.userAgent)
            if (matchs && matchs.length) {
                v = matchs[0].split(' ')[1]
            } else {
                if (tmsky.string.endsWith(navigator.userAgent.toLowerCase(), 'like gecko')) {//ie version >= 11
                    matchs = /rv:\d{1,}(.\d{1,})*/i.exec(navigator.userAgent)
                    if (matchs && matchs.length) {
                        v = matchs[0].split(':')[1]
                    }
                }
            }
            h = parseInt(v) < 10 ? (isExcelStyle ? 23 : 45) : (isExcelStyle ? 28 : 50)
            $(".room-num-section").css({
                'height' : h + 'px',
                /*'line-height' : h*/
            });
        }
    },
    signCellPosition : function () {
        var $roomgrid = $('#roomcell_grid'),
            posrow = "index",
            posx = "pos-x",
            posy = "pos-y";
        if (Roomcell.isXyStyle()) {
            this.toSignCellPosition($roomgrid.find('tr'), posrow, posx, posy)
        } else {
            this.toSignCellPosition($roomgrid.find('tr[roomtype]'), posrow, posx, posy)
            posrow = "index-fold", posx = "pos-x-fold", posy = "pos-y-fold";
            this.toSignCellPosition($roomgrid.find('tr[fold-roomtype]'), posrow, posx, posy)
        }
        return this
    },
    toSignCellPosition : function ($table, posrow, posx, posy) {
        var isXyStyle = Roomcell.isXyStyle()
        $table.each(function (i, tr) {
            var $tr = $(this),
                _i = i + 1;
            $tr.attr(posrow, _i);
            if (isXyStyle) {
                // xy non fold roomtype
                $tr.find("td[roomtype]>div").each(function (j, cell) {
                    $(cell).attr(posx, j + 1).attr(posy, _i)
                })
                // xy fold roomtype
                $tr.find("td[fold-roomtype]>div").each(function (j, cell) {
                    $(cell).attr(posx + "-fold", j + 1).attr(posy + "-fold", _i)
                })
            } else {
                // non xy style
                $tr.find("td>div").each(function (j, cell) {
                    $(cell).attr(posx, j + 1).attr(posy, _i).attr('id', 'clickToDay'+_i+j)
                })
            }
        })
        return this;
    },
    renderOrderItem : function (main, orderItem, isTurnOn) {

        if (orderItem.start >= orderItem.stop)
            return;

        var mainId = main.id,
            orderId = orderItem.id,
            cells = this._getOrderItemCells(orderItem, mainId),
            type = orderItem.type,
            count = cells.length

        if (count > 0) {
            var first = cells[0]
            // this._adjustCell(first)

            first.renderOrder(main, count, type, orderItem.id)
            if (isTurnOn) {
                first.turnOn()
            }

            var arr = cells, i, len, el
            for (i = 1, len = arr.length; i < len; i++) {
                el = arr[i]

                // this._adjustCell(el)
                el.turnOff()
                el.refUid = first.uid
                el.mainId = mainId
                el.orderId = orderId
                el.orderType = type
            }
        }
    },
    // 批量渲染 （单个渲染特别慢，估计是多层循环造成的）
    batchRender : function () {
        Roomcell.releaseRenderPool()
    },
    _adjustCell : function (cell) {
        if (cell.mainId && cell.orderType == CONST.SUB_OUT) {
            var $el = cell.$el,
                len = cell.mainLen,
                orderDom = $el.children('.order-item'),
                w = orderDom.width() / len,
                nextCell = this.next(cell, 1)

            var dom = orderDom.detach()
            if (nextCell.mainId === cell.mainId) {
                dom.width(w * (len - 1))
                nextCell.$el.empty().append(dom)
            }
        }
        cell.empty()
    },
    eraseOrderItem : function (orderItem, mainId) {

        var cells = this._getOrderItemCells(orderItem, mainId)

        if (cells.length > 0) {
            var arr = cells, i, len, el
            for (i = 0, len = arr.length; i < len; i++) {
                el = arr[i]
                el.empty()
            }
        }
    },
    getOrderItemFirstCell : function (orderItem, mainId) {
        var first = null,
            boundary = this.getDateDuration(),
            roomId = orderItem.roomId,
            start = orderItem.start,
            stop = orderItem.stop

        // 验证房间是否存在
        var room = RoomUtil.getById(roomId)
        if (!room)
            return;

        if (boundary) {
            if (stop <= boundary.min || start >= boundary.max)
                return;
            if (start < boundary.min) {
                start = boundary.min
            }
            if (stop > boundary.max) {
                stop = boundary.max
            }
        }
        var cell = this.getByRoomAndDate(roomId, start),
            days = tmsky.date.getDatePeriod(start, stop), i, el

        if (cell) {
            for (i = 0; i < days; i++) {
                el = this.next(cell, i)
                // 需找第一个
                if (el.mainId === mainId || el.orderType == null || el.orderType == CONST.SUB_OUT) {
                    first = el
                    break;
                }
            }
        }
        return first
    },
    _getOrderItemCells : function (orderItem, mainId) {
        var first = this.getOrderItemFirstCell(orderItem, mainId),
            ret = []

        if (first) {
            ret.push(first)
            var start = first.date,
                stop = orderItem.stop,
                days = tmsky.date.getDatePeriod(start, stop),
                i = 1, el

            for (; i < days; i++) {
                el = this.next(first, i)
                if (el && (el.mainId === mainId || el.orderType == null || el.orderType == CONST.SUB_OUT)) {
                    ret.push(el)
                }
            }
        }
        return ret
    },
    updateRoomGrid : function (days, start) {
        var dates = this._getDateArr(days, start)
        var wrap = _style == CONST.STYLE_XY ? $leftBox : $topBox

        wrap.find('.date-cell').each(function (i) {
            var $dateCell = $(this),
                el = dates[i]

            $dateCell.attr({
                'markdate' : el.value,
                'class' : 'date-cell ' + el.className + ' ' + el.weeklineClass
            }).find('b').html(el.text).end().find('em').html(el.week)
        })

        var k, el, uid, index, item
        for (k in _list) {
            el = _list[k]
            uid = el.uid
            index = uid % _uidSeed.MAX - 1
            item = dates[index]
            el.empty().resetDate(item.value)
        }
        return this
    },
    // 初始化
    init : function () {
        $('#roomcell_grid').find('td>div').each(function () {
            var $cell = $(this),
                date = $cell.attr('date'),
                roomId = $cell.attr('room'),
                roomtypeId = $cell.attr('roomtype'),
                posx = $cell.attr("pos-x"),
                posy = $cell.attr("pos-y"),
                roomNo = $cell.attr("roomNo")

            if (roomId) {
                var roomcell = new Roomcell(this, roomId, date, roomtypeId, {
                    row : posy,
                    cell : posx
                }, roomNo)
                roomcell.uid = _generator(roomId)
                roomcell.$el.attr('uid', roomcell.uid)
                // 放入容器
                _list[roomcell.uid] = roomcell
            }
        })

        /*开启折叠后的格子分割线*/
        if (Plug.hasFunc(Plug.F_FOLD)) {
            $('tr[fold-roomtype]').each(function (index) {
                $(this).prev('tr').find('td').css('border-bottom', '1px #7C362E solid')
            })

            $('.room-cell-right').each(function () {
                $(this).find('.room-num-section').last().css('border-bottom', '1px #7C362E solid')
            })
            $('.room-cell-left').css('border-bottom', '1px #7C362E solid')
        }

        return this
    },
    updateAllHasFoldRoomTypeRemainNums : function () {
        var roomtypes = RoomUtil.getRoomtypes(), el
        for (var i = 0; i < roomtypes.length; i++) {
            el = roomtypes[i]
            var $foldType = $centerBox.find('[fold-roomtype=' + el.id + ']')
            if ($foldType.attr("class") != 'hide') {
                this.foldRoomtype(el.id)
            }
        }
    },
    foldRoomtype : function (roomtypeId) {
        var roomtype = RoomUtil.getRoomtypeById(roomtypeId),
            rooms = roomtype.rooms,
            rs = []
        rooms.forEach(function (room) {
            var last = _uidSeed[room.id],
                len = last % _uidSeed.MAX,
                first = last - len + 1, i, cell

            for (i = 0; i < len; i++) {
                cell = _list[first + i]
                if (cell.mainId == null && !cell.isLock) {
                    rs[i] = rs[i] == null ? 1 : rs[i] + 1
                }
                // 隐藏
                if (_style == CONST.STYLE_XY) {
                    cell.$el.closest('td').addClass('hide')
                } else {
                    if (i == 0) {
                        cell.$el.closest('tr').addClass('hide')
                    }
                }
            }
        })

        var $foldType = $centerBox.find('[fold-roomtype=' + roomtypeId + ']')
        $foldType.find('.fold-cell-num').each(function (index) {
            var num = rs[index] || 0
            if (num == 0) {
                $(this).text('满房').addClass('ft-color-red')
            } else {
                $(this).text('剩' + num + '间').removeClass('ft-color-red')
            }
        })
        $foldType.removeClass('hide')
        roomtype.setFold(true)
    },
    unfoldRoomtype : function (roomtypeId) {
        var roomtype = RoomUtil.getRoomtypeById(roomtypeId)
        $centerBox.find('[fold-roomtype=' + roomtypeId + ']').each(function () {
            var $foldType = $(this).addClass('hide')
            $foldType.parent().children('[roomtype=' + roomtypeId + ']').removeClass('hide')
        })
        roomtype.setFold(false)
    },
    updateRoomtypeView : function () {
        var roomtypes = RoomUtil.getRoomtypes()
        roomtypes.forEach(function (el) {
            var tag = _style == CONST.STYLE_XY ? 'td' : 'tr',
                $roomtarget = _style == CONST.STYLE_XY ? $topBox : $leftBox,
                roomtypeId = el.id

            if (el.isHide) {
                $centerBox.find(tag + '[roomtype=' + roomtypeId + '],' + tag + '[fold-roomtype=' + roomtypeId + ']').addClass('hide')

                $roomtarget.find('li[roomtype-cell=' + roomtypeId + '],li[roomtype-folder=' + roomtypeId + ']').addClass('hide')
            } else {
                $centerBox.find(tag + '[roomtype=' + el.id + ']').removeClass('hide')
                $roomtarget.find('li[roomtype-cell=' + roomtypeId + ']').removeClass('hide')
            }
        })
    },
    scrollToBox : function (x, y) {
        if (!x || !y)
            return
        // if(_style == CONST.STYLE_XY) {
        // var temp = x
        // x = y,
        // y = temp
        // }
        $centerBox.scrollLeft(0) && $centerBox.scrollLeft((x - 1) * roomBoxSize.w)
        $centerBox.scrollTop(0) && $centerBox.scrollTop((y - 1) * roomBoxSize.h)
    },
    getCellSite : function (cell) {
        return {
            x : cell.pos.cell,
            y : cell.pos.row
        }
    },
    // 获取剩余房间数
    updateRemainRooms : function () {
        var ret = [], uid, el, i

        for (i = 0; i < CONST.VIEW_DAYS; i++) {
            ret[i] = 0
        }
        for (uid in _list) {
            el = _list[uid]
            i = (uid - 1) % CONST.VIEW_DAYS
            if (el && el.mainId == null && !el.isLock) {
                ret[i]++
            }
        }

        var target = _style == CONST.STYLE_XY ? $leftBox : $topBox

        var $timeLis = target.find(".date-cell")

        $timeLis.each(function (i) {
            var text = ret[i] == 0 ? '满房' : "剩" + ret[i] + "间"
            $(this).find("dd").html(text)
        });

        return ret;
    }

}