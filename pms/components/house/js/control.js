var CONST = require('../../common/js/const.js')
var MainOrderUtil = require('./order/main-order-util.js')
var CellUtil = require('./room/roomcell-util.js')
var RoomUtil = require('./room/room-util.js')
var Pms2PsbOrderUtil = require('../../common/js/utils/pms-to-psb-util.js')
var RoomcellDrag = require('./room/roomcell-drag.js')
var Plug = require('header/plug.js')
var Access = require('header/access.js')
var User = require('header/user.js')

// 循环依赖没法注入 （注意手动注入以及设计）
var Editor = null,
    PayModule = null;

var g_status = CONST.G_NORMAL,
    prev_status = null,
    g_mainOrder = {
        id: null,
        orderStatus: null
    }, roomCellLength,
    today = tmsky.date.today(), $centerBox,
    actMainOrder = null,
    checkout_status = null,
    BTN_ENUM = CONST.BTN_ENUM;

// vmodels
var vm_orders, vm_guests, vm_finances, vm_btns, vm_remark, vm_msg, vm_finance_detail, vm_b_checkout_model, vm_order_log
// 操作区路由
var router = {
    setInputView: function (bool) {
        var bool = !!bool
        vm_orders.inputView = bool
        vm_orders.showAddSpend = true
        vm_guests.inputView = bool
        vm_finances.inputView = bool
        // vm_btns.inputView = bool
        vm_remark.inputView = bool
        vm_finances.additionView = false
    },
    setInfoView: function (bool) {
        var bool = !!bool
        vm_orders.infoView = bool
        vm_orders.showAddSpend = false
        vm_guests.infoView = bool
        vm_finances.infoView = bool
        // vm_btns.infoView = bool
        vm_remark.infoView = bool
        vm_finances.additionView = false
        vm_orders.additionView = false
    },
    // 设置追加的视图（主要用于退房情况）
    setAdditionView: function (bool) {
        this.setInfoView(bool)
        this.setInputView(!bool)
        vm_finances.additionView = bool
        vm_orders.additionView = bool
    },
    setPenaltyVisible: function () {
        vm_finances.penaltyVisible = g_mainOrder.penalty ? true : false;
    },
    cleanEditor: function (close) {
        this.setInfoView(false)
        this.setInputView(false)
        vm_btns.install()
        cellStackTool.resetCellsAndVm()
        if (close) {
            Editor.close()
        }
    },
    // 更新全局状态
    changeStatus: function (status) {
        if (status == CONST.G_OUTING) {
            //退房模块的显隐
            $('.checkOutView').show()
            $('.noCheckOutView').hide()
        } else {
            $('.checkOutView').hide()
            $('.noCheckOutView').show()
        }
        if (status != null) {
            // 未到/取消不计入状态栈
            prev_status = (g_status === CONST.G_BOOK_CANCLEING || g_status === CONST.G_RATEPLAN_CANCLEING) ? CONST.G_BOOK :
                (g_status === CONST.G_RATEPLAN_OUTING ? CONST.G_IN : g_status === CONST.G_RATEPLAN_UPDATE ? CONST.G_OUT : g_status)
            g_status = status
        } else {
            g_status = prev_status || CONST.G_NORMAL
            prev_status = null
        }
        // 触发监听
        vm_orders.gStatusOnChange(g_status, prev_status)
        vm_finances.financeAlert = false;
        vm_finances.gStatusOnChange(g_status, prev_status, MainOrderUtil.isNCO(g_mainOrder))
        return this
    },
    setCheckOutStatus: function () {
        if (g_mainOrder && MainOrderUtil.isCheckInMainOrder(g_mainOrder)) {
            if (MainOrderUtil.isBeforehandCO(g_mainOrder)) {
                checkout_status = CONST.CHECK_OUT_STATUS.BEFOREHAND;
                if (MainOrderUtil.isTBHCO(g_mainOrder)) {
                    checkout_status = CONST.CHECK_OUT_STATUS.TOTALLY_BEFOREHAND;
                }
            } else {
                checkout_status = CONST.CHECK_OUT_STATUS.NORMAL;
            }
        } else {
            checkout_status = null;
        }
    },
    // 按钮响应
    btnClick: function (fn) {
        var self = router, jsonData, oldMain, main;
        checkout_status = null;
        router.setPenaltyVisible()
        //新办订单姓名不能为空
        //if (fn != BTN_ENUM.cancle.fn && tmsky.isEmpty(vm_orders.$g_mainOrder) && !controller.orderLimitName(self))return false
        //  _hmt.push...  - -  百度统计
        switch (fn) {
            // 取消办理
            case BTN_ENUM.cancle.fn:
                self.changeStatus(CONST.G_NORMAL)
                vm_orders.additionView = false
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.cancle.text]);
                break;
            // 办理未到/取消
            case BTN_ENUM.book_cancle_act.fn:
                self.changeStatus(CONST.G_BOOK_CANCLEING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.book_cancle_act.text]);
                break;
            // 办理信用住未入住取消
            case BTN_ENUM.rateplan_cancle_act.fn:
                self.changeStatus(CONST.G_RATEPLAN_CANCLEING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.rateplan_cancle_act.text]);
                break;
            // 办理入住
            case BTN_ENUM.in_act.fn:
                self.changeStatus(CONST.G_INING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.in_act.text]);
                break;
            // 办理部分入住
            case BTN_ENUM.part_in_act.fn:
                self.changeStatus(CONST.G_PART_INING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.part_in_act.text]);
                break;
            // 办理信用住退房
            case BTN_ENUM.rateplan_out_comfirm_act.fn:
                self.changeStatus(CONST.G_RATEPLAN_OUTING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.rateplan_out_comfirm_act.text]);
                break;
            // 触发修改信用住财务按钮
            case BTN_ENUM.rateplan_edit_act.fn:
                self.changeStatus(CONST.G_RATEPLAN_UPDATE)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.rateplan_edit_act.text]);
                break;
            // 保存修改后的信用住财务
            case BTN_ENUM.rate_plan_update.fn:
                ajaxTool.updateRatePlan(function (paidAmount, incidentalOldPrice, ratePlanRecordAt) {
                    vm_finances.refreshFinance(paidAmount, null, incidentalOldPrice, ratePlanRecordAt)
                    self.changeStatus(CONST.G_OUT).viewRoute()
                })
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.rate_plan_update.text]);
                return self;
            // 办理退房
            case BTN_ENUM.out_act.fn:
                self.setCheckOutStatus();
                if (checkout_status == CONST.CHECK_OUT_STATUS.NORMAL) {
                    //正常退房
                    vm_b_checkout_model.CHECK_OUT_STATUS = 1
                }
                if (checkout_status == CONST.CHECK_OUT_STATUS.BEFOREHAND) {
                    //部分提前退房
                    vm_b_checkout_model.CHECK_OUT_STATUS = 2
                    vm_b_checkout_model.choice('checkout')
                }
                if (checkout_status == CONST.CHECK_OUT_STATUS.TOTALLY_BEFOREHAND) {
                    vm_b_checkout_model.CHECK_OUT_STATUS = 3
                    vm_b_checkout_model.choice('checkout')
                }
                vm_b_checkout_model.reset()
                self.changeStatus(CONST.G_OUTING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.out_act.text]);
                break;
            // 办理提前退房
            // case BTN_ENUM.b_out_act.fn:
            // self.changeStatus(CONST.G_OUT_BEFOREING)
            // break;
            // 撤销退房
            case BTN_ENUM.out_revoke.fn:
                ajaxTool.revokeCheckout();
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.out_revoke.text]);
                return self;
            // 修改
            case BTN_ENUM.edit.fn:
                vm_b_checkout_model.reset()
                self.changeStatus(g_status === CONST.G_IN || g_status === CONST.G_RATEPLAN_OUTING ? CONST.G_INING : g_status === CONST.G_PART_IN ? CONST.G_PART_IN_UPDATE : g_status === CONST.G_PART_OUT
                    ? CONST.G_PART_OUTING : g_status === CONST.G_OUT ? CONST.G_OUT_UPDATE : g_status === CONST.G_RATEPLAN_UPDATE ? CONST.G_OUT_UPDATE : CONST.G_BOOKING)
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.edit.text]);
                break;
            // 返回
            case BTN_ENUM.back.fn:
                self.changeStatus()
                cellStackTool.resetCells()
                cellStackTool.flushMainOrder('back')
                actMainOrder = oldMain = MainOrderUtil.getById(g_mainOrder.id)
                oldMain && oldMain.turnOn()
                router.setPenaltyVisible()
                vm_b_checkout_model.reset()
                vm_orders.additionView = false
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.back.text]);
                break;
            // 保存预定
            case BTN_ENUM.book_save.fn:
                jsonData = cellStackTool.convertData(CONST.SUB_BOOK)
                if (!jsonData)
                    return self;

                jsonData = MainOrderUtil.mappingOrderIdCard(jsonData);

                ajaxTool.saveOrder(jsonData, function (mainOrder) {
                    self.changeStatus(CONST.G_BOOK).viewRoute()
                })
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.book_save.text]);
                return self;
            // 保存入住
            case BTN_ENUM.in_save.fn:
                jsonData = cellStackTool.convertData(CONST.SUB_IN)
                if (!jsonData) {
                    return self;
                }
                // 保存入住时，如果vm_idcard_main.idcardType.roomToPerson_func == true，那么需要校验入住房间号是否关联入住人
                if (!MainOrderUtil.validOrderBeforeSave(jsonData)) return
                jsonData = MainOrderUtil.mappingOrderIdCard(jsonData);

                // 根据是否开通psb做数据处理
                Pms2PsbOrderUtil.orderBeforeCurd(jsonData.subOrders, 1)

                ajaxTool.saveOrder(jsonData, function (mainOrder) {
                    var afterStatus = mainOrder.orderStatus === CONST.M_IN ? CONST.G_IN : mainOrder.orderStatus === CONST.M_PART_OUT ? CONST.G_PART_OUT : mainOrder.orderStatus === CONST.M_PART_IN
                        ? CONST.G_PART_IN
                        : CONST.G_OUT
                    self.changeStatus(afterStatus).viewRoute()
                    if (jsonData.orderAction == CONST.ACT_PART_IN || jsonData.orderAction == CONST.ACT_IN) {
                        var currentInn = User.getCurrentInn()
                        var hasCheckInTip = currentInn.hasCheckInTip
                        if (hasCheckInTip) {
                            audioRemind("tishi.mp3")
                        }
                        // 如果开通了打印功能，弹出是否打印的弹出框
                        if (Plug.hasFunc(Plug.F_PRINT)) {
                            tmsky.ui.dialog.confirm('是否打印入住凭证？', function () {
                                $('#print_btn').click()
                            })
                        }
                    }
                })
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.in_save.text]);
                return self;
            // 保存退房
            case BTN_ENUM.out_save.fn:
                self.setCheckOutStatus()
                jsonData = cellStackTool.convertData(CONST.SUB_OUT)
                if (!jsonData) {
                    return self;
                } else if (vm_orders.isRatePlan && vm_finances.ratePlan.incidentals && Number(tmsky.number.filt(vm_finances.ratePlan.incidentals)) > 300) {
                    tmsky.ui.dialog.alert('杂费金额不能大于300！')
                    return self;
                }
                // 根据是否开通psb做数据处理
                Pms2PsbOrderUtil.orderBeforeCurd(jsonData.subOrders, 4, jsonData.id)

                ajaxTool.saveOrder(jsonData, function (mainOrder, isClearStatusOfEditor) {
                    if (router.isCheckoutStatus(mainOrder)) {
                        //如果当日住当日退，提示实住半天不占格子
                        var orders = vm_orders.orders.$model
                        var hasHalfOrder = false
                        orders.forEach(function (el, i) {
                            if (el.start == el.stop) {
                                hasHalfOrder = true
                            }
                        })
                        if (hasHalfOrder) {
                            tmsky.ui.dialog.alert('实住半天房态页不占格子！')
                        }
                        vm_b_checkout_model.reset()
                    }
                    var afterStatus = g_status
                    if (!isClearStatusOfEditor) {
                        afterStatus = mainOrder.orderStatus === CONST.M_OUT ? CONST.G_OUT :
                            // (g_status === CONST.G_OUT_BEFOREING || g_status === CONST.G_OUT_BEFORE_UPDATE ? CONST.G_OUT_BEFORE : CONST.G_OUT) :
                            (mainOrder.orderStatus === CONST.M_PART_OUT ? CONST.G_PART_OUT : CONST.G_IN)
                    }
                    self.changeStatus(afterStatus).viewRoute()
                })
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.out_save.text]);
                return self;
            // 保存未到/取消(含信用住)
            case BTN_ENUM.book_cancle.fn:
                jsonData = cellStackTool.convertData(vm_orders.isRatePlan ? CONST.SUB_BOOK : CONST.SUB_CANCLE)
                if (!jsonData) {
                    return self;
                } else if (vm_orders.isRatePlan && !jsonData.isToCharge) {
                    tmsky.ui.dialog.alert('请选择是否扣款！')
                    return self;
                } else if (!vm_orders.isRatePlan && !vm_finances.backRoomFee.amount) {
                    if (vm_finances.paidAmount > 0) {
                        tmsky.ui.dialog.alert('请填写退还金额！不退请填“0”')
                        return self;
                    } else if (vm_finances.paidAmount < 0) {
                        tmsky.ui.dialog.alert('请填写支付金额！不付请填“0”')
                        return self;
                    }
                }
                ajaxTool.saveOrder(jsonData, function (mainOrder) {
                    self.changeStatus(CONST.G_NORMAL).viewRoute()
                })
                _hmt.push(['_trackEvent', 'order', 'click', BTN_ENUM.book_cancle.text]);
                return self;
        }
        self.viewRoute()
        return self;
    },
    // 根据全局状态 显示操作区视图
    viewRoute: function (roomcell) {
        var bookBtn = null,
            checkinBtn = null,
            checkoutBtn = null,
            firstDate = null,
            endDate = null

        if (!Editor.isOpen() && roomcell) {
            // 判断是否需要移动滚动条 让格子可视
            Editor.open()
            if ($(window).width() - roomcell.$el.offset().left < 450) {
                $centerBox = $centerBox || $('.content-box-grid')
                $centerBox.scrollLeft($centerBox.scrollLeft() + 360)
            }
        }
        $('#editor_error').html("")
        // 路由页面
        switch (g_status) {
            case CONST.G_NORMAL:
                this.cleanEditor(true)
                break
            case CONST.G_ROOMS:
                this.setInfoView(false)
                this.setInputView(true)
                firstDate = vm_orders.firstDate
                endDate = vm_orders.endDate
                if (Access.access(Access.AC_BOOK) && firstDate >= today) {
                    bookBtn = BTN_ENUM.book_save
                }
                if (Access.access(Access.AC_CHECK_IN)) {
                    if (firstDate == today) {
                        checkinBtn = BTN_ENUM.in_save
                    } else if (firstDate < today) {
                        checkinBtn = BTN_ENUM.bulu_in_save
                        if (endDate < today) {
                            checkinBtn = BTN_ENUM.bulu_out_save
                        }
                    }
                }
                vm_btns.install({
                    left: bookBtn,
                    center: checkinBtn,
                    right: BTN_ENUM.cancle
                })
                break
            case CONST.G_BOOK:
                if (!vm_orders.important) {
                    vm_btns.install({
                        left: null,
                        center: null,
                        right: null
                    })
                    $('#editor_error').html("您已提交信用住订单取消申请，请等待审核！")
                } else {
                    var rightBtn = null
                    if (vm_orders.isRatePlan) {
                        rightBtn = BTN_ENUM.rateplan_cancle_act
                    } else if (!vm_orders.isFromDx) {
                        rightBtn = vm_orders.isFromOTA ? BTN_ENUM.book_noshow_act : BTN_ENUM.book_cancle_act
                    }
                    vm_btns.install({
                        left: Access.access(Access.AC_CHECK_IN) ? router.isCan2CheckIn() ? BTN_ENUM.part_in_act : null : null,
                        center: Access.access(Access.AC_BOOK) ? BTN_ENUM.edit : null,
                        right: Access.access(Access.AC_BOOK_CANCEL) ? rightBtn : null
                    })
                }
                this.setInfoView(true)
                this.setInputView(false)
                break
            case CONST.G_PART_IN:
                vm_btns.install({
                    left: Access.access(Access.AC_CHECK_IN) ? BTN_ENUM.part_in_act : null,
                    right: Access.access(Access.AC_BOOK) ? BTN_ENUM.edit : null
                })
                this.setInfoView(true)
                this.setInputView(false)
                break
            case CONST.G_PART_OUT:
            case CONST.G_IN:
                firstDate = vm_orders.firstDate, hasCheckOutAuth = Access.access(Access.AC_CHECK_OUT);
                if (hasCheckOutAuth && firstDate <= today) {
                    checkoutBtn = BTN_ENUM.out_act
                    if (vm_orders.isRatePlan && vm_orders.orderAllChecked()) {
                        checkoutBtn = BTN_ENUM.rateplan_out_comfirm_act
                    }
                }
                var btns = {
                    printAct: Plug.hasFunc(Plug.F_PRINT) ? BTN_ENUM.print_act : null,
                    left: checkoutBtn,
                    right: Access.access(Access.AC_CHECK_IN) ? BTN_ENUM.edit : null
                }
                // if(MainOrderUtil.isBeforehandCO(g_mainOrder)){
                // btns.center = hasCheckOutAuth ? BTN_ENUM.b_out_act : null;
                // }
                vm_btns.install(btns)
                this.setInfoView(true)
                this.setInputView(false)
                break
            case CONST.G_OUT:
                var hasAuthCOE = Access.access(Access.AC_CHECK_OUT_EDIT) // COE: CHECK OUT EDIT
                vm_btns.install({
                    printAct: Plug.hasFunc(Plug.F_PRINT) ? BTN_ENUM.print_act : null,
                    left: hasAuthCOE ? (!vm_orders.isRatePlan ? BTN_ENUM.out_revoke : BTN_ENUM.rateplan_edit_act) : null,
                    right: hasAuthCOE ? BTN_ENUM.edit : null
                })
                this.setInfoView(true)
                this.setInputView(false)
                break
            case CONST.G_BOOKING:
                vm_btns.install({
                    left: BTN_ENUM.book_save,
                    right: BTN_ENUM.back
                })
                this.setInfoView(false)
                this.setInputView(true)
                break
            case CONST.G_PART_IN_UPDATE:
                vm_btns.install({
                    left: BTN_ENUM.book_save,
                    right: BTN_ENUM.back
                })
                this.setInfoView(false)
                this.setInputView(true)
                break
            case CONST.G_OUT_UPDATE:
                // case CONST.G_OUT_BEFORE_UPDATE:
                vm_btns.install({
                    // left: g_status === CONST.G_OUT_BEFORE_UPDATE ? BTN_ENUM.b_out_save : BTN_ENUM.out_save,
                    left: BTN_ENUM.out_save,
                    right: BTN_ENUM.back
                })
                this.setInfoView(false)
                this.setInputView(true)
                break
            case CONST.G_PART_OUTING:
            case CONST.G_PART_INING:
            case CONST.G_INING:
                vm_btns.install({
                    left: BTN_ENUM.in_save,
                    right: BTN_ENUM.back
                })
                this.setInfoView(false)
                this.setInputView(true)
                break
            case CONST.G_OUTING:
                vm_btns.install({
                    left: BTN_ENUM.out_save,
                    right: BTN_ENUM.back
                })
                // this.setAdditionView(true)
                break
            case CONST.G_BOOK_CANCLEING:
                break
        }
        return this;
    },
    cellReclick: function (status, mainId) {
        if (status) {
            prev_status = g_status;
            g_status = status;
        }
        var main = MainOrderUtil.getById(mainId || g_mainOrder.id), first, cell
        if (main) {
            first = main.getFirstGroup()
            if (first) {
                var clickId = ''
                main.orders.forEach(function (el, i) {
                    if (el.start != el.stop && el.start == MainOrderUtil.getValidOrderFristDate(g_mainOrder)) {
                        clickId = el.roomId
                    }
                })
                cell = CellUtil.getByRoomAndDate(clickId, /* first.id */MainOrderUtil.getValidOrderFristDate(g_mainOrder))
                if (cell) {
                    var offset,
                        $target = cell.$el
                    if ($target.parent().attr('role') === 'orderitem') {
                        $target = $target.parent() // 兼容还旧版
                    }
                    offset = $target.attr('days')
                    if (cell.isLock)
                        return;

                    // reclick
                    router.cellClickHandle(cell, offset, true)
                }
            }
        }
    }
    ,
    // 格子对象点击响应处理
    cellClickHandle: function (roomcell, offset, reclick) {
        var self = this,
            mainId = roomcell.mainId,
            isOn = roomcell.isOn(offset), current,
            financeAlert = vm_finances.financeAlert,
            resetFinanceAlert = function () {
                vm_finances.financeAlert = financeAlert;
            };

        vm_finances.financeAlert = false;
        vm_finances.penaltyVisible = false;
        vm_b_checkout_model.reset()
        // 订单点击
        if (mainId) {
            switch (g_status) {
                case CONST.G_NORMAL:
                case CONST.G_BOOK:
                case CONST.G_PART_IN:
                case CONST.G_IN:
                case CONST.G_PART_OUT:
                case CONST.G_OUT:
                    if (mainId !== g_mainOrder.id || reclick) {
                        cellStackTool.resetCellsAndVm()
                        ajaxTool.getOrder(mainId, function (main) {
                            actMainOrder && actMainOrder.turnOff()
                            cellStackTool.flushMainOrder()
                            actMainOrder = MainOrderUtil.parse(main)
                            actMainOrder && actMainOrder.render(true)
                            current = main.orderStatus === CONST.M_BOOK ? CONST.G_BOOK : main.orderStatus === CONST.M_OUT ? CONST.G_OUT : main.orderStatus === CONST.M_PART_IN
                                ? CONST.G_PART_IN : main.orderStatus === CONST.M_PART_OUT ? CONST.G_PART_OUT : CONST.G_IN
                            self.changeStatus(current).viewRoute(roomcell)
                            router.setPenaltyVisible()
                        }, reclick && !reclick)
                    } else {
                        // 取消订单选择
                        self.changeStatus(CONST.G_NORMAL)
                        self.viewRoute(roomcell)
                    }
                    return;
                case CONST.G_ROOMS:
                    // 判断是否编辑过
                    if (!controller.isEdited()) {
                        cellStackTool.resetCellsAndVm()
                        self.changeStatus(CONST.G_NORMAL)
                        self.cellClickHandle(roomcell, offset)
                        return;
                    }
                case CONST.G_PART_IN_UPDATE:
                case CONST.G_PART_OUTING:
                case CONST.G_BOOKING:
                case CONST.G_PART_INING:
                case CONST.G_INING:
                case CONST.G_OUTING:
                    if (mainId === g_mainOrder.id) {
                        if (cellStackTool.size() == 1 && isOn) {
                            return
                        }
                        break
                    }
                default:
                    // confirm
                    tmsky.ui.dialog.confirm('你正在进行办理操作，确定取消吗？', function () {
                        self.changeStatus(CONST.G_NORMAL)
                        cellStackTool.resetCellsAndVm()
                        self.viewRoute()
                        self.cellClickHandle(roomcell, offset)
                    }, resetFinanceAlert)
                    return
            }
        }

        // 格子增减
        switch (g_status) {
            case CONST.G_NORMAL:
                cellStackTool.pushOrPop(roomcell, offset)
                self.changeStatus(CONST.G_ROOMS)
                break
            case CONST.G_ROOMS:
                cellStackTool.pushOrPop(roomcell, offset)
                if (cellStackTool.size() === 0) {
                    self.changeStatus(CONST.G_NORMAL)
                }
                break
            case CONST.G_OUTING:
            case CONST.G_BOOK_CANCLEING:
                // confirm
                tmsky.ui.dialog.confirm('你正在进行办理操作，确定取消吗？', function () {
                    self.changeStatus(CONST.G_NORMAL)
                    cellStackTool.resetCellsAndVm()
                    self.viewRoute()
                    self.cellClickHandle(roomcell, offset)
                }, resetFinanceAlert)
                return
            // 相斥
            // case CONST.G_BOOK:
            // case CONST.G_PART_IN:
            // case CONST.G_IN:
            // case CONST.G_PART_OUT:
            // case CONST.G_OUT:
            case CONST.G_PART_IN_UPDATE:
            case CONST.G_PART_OUTING:
            case CONST.G_BOOKING:
            case CONST.G_PART_INING:
            case CONST.G_INING:
                if (!vm_orders.isRatePlan) {
                    if (!(cellStackTool.size() == 1 && isOn))
                        cellStackTool.pushOrPop(roomcell, offset)
                    break
                }
            default:
                cellStackTool.resetCellsAndVm()
                cellStackTool.pushOrPop(roomcell, offset)
                self.changeStatus(CONST.G_ROOMS)
                break
        }
        self.viewRoute(roomcell)
    }
    ,
    isTotallyBeforeCheckout: function () {
        return checkout_status && checkout_status == CONST.CHECK_OUT_STATUS.TOTALLY_BEFOREHAND;
    },
    isNormalCheckout: function () {
        return checkout_status && checkout_status == CONST.CHECK_OUT_STATUS.NORMAL;
    }
    ,
    isCan2CheckIn: function () {
        return g_mainOrder && g_mainOrder.checkInAt <= today;
    }
    ,
    isBeforeCheckoutStatus: function () {
        return checkout_status && (checkout_status == CONST.CHECK_OUT_STATUS.BEFOREHAND || checkout_status == CONST.CHECK_OUT_STATUS.TOTALLY_BEFOREHAND);
    }
    ,
    isCheckoutStatus: function (mainOrder) {
        return mainOrder && mainOrder.orderStatus === CONST.M_OUT || mainOrder.orderStatus === CONST.M_PART_OUT
    }
    ,
    // 客人提前退房
    isBCOAction: function () {
        return avalon.vmodels['vm_b_checkout_model'].isActionBCO()
    }
    ,
    // 老板提前办理退房
    isActionBCO: function () {
        return avalon.vmodels['vm_b_checkout_model'].isBCOAction()
    }
    ,
    isPartCheckout: function () {
        return g_mainOrder.orderStatus == CONST.M_PART_OUT;
    }
    ,
    cleanEditorByCheckout: function () {
        var isClearStatusOfEditor = false
        if (router.isClearStatusOfEditor()) {
            router.cleanEditor(true)
            g_status = CONST.G_NORMAL
            isClearStatusOfEditor = true
        }
        return isClearStatusOfEditor
    }
    ,
    isClearStatusOfEditor: function () {
        return !router.isPartCheckout() && router.isTotallyBeforeCheckout() && router.isBCOAction();
    }
}
var ajaxTool = {
    // 保存订单
    saveOrder: function (jsonData, okfn) {
        jsonData.uniqueCode = g_mainOrder.uniqueCode
        tmsky.ui.dialog.loading()
        $.ajax({
            type: "POST",
            url: "/order/save?innId=" + User.getUserInfo().innId,
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(jsonData)
        }).done(function (rs) {
            tmsky.ui.dialog.loading.close()
            if (rs.status == 200) {
                var mainOrder = rs.mainOrder, oldMain, main, isClearStatusOfEditor
                if (!mainOrder) {
                    tmsky.ui.dialog.tips('请等待审核', 'success')
                    if (typeof okfn === 'function') {
                        okfn()
                    }
                    return;
                }
                tmsky.ui.dialog.tips('保存成功', 'success')
                // 清除旧
                oldMain = MainOrderUtil.getById(g_mainOrder.id)
                oldMain && oldMain.erase()
                if (mainOrder.orderStatus !== CONST.M_CANCLE) {
                    // 智能发送短信
                    ajaxTool._sendMsg(mainOrder)
                    // 设置脏房
                    if (Plug.hasFunc(Plug.F_DIRTY_ROOM) && g_mainOrder.orderStatus !== CONST.M_OUT && (jsonData.orderStatus === CONST.M_PART_OUT || jsonData.orderStatus === CONST.M_OUT)) {
                        jsonData.subOrders.forEach(function (el) {
                            if (el.status === CONST.SUB_OUT) {
                                controller.setRoomDirtyStatus(el.room.id, true)
                            }
                        })
                    }
                    g_mainOrder = mainOrder
                    actMainOrder && actMainOrder.turnOff()
                    main = MainOrderUtil.parse(mainOrder)
                    main && main.render(true)
                    cellStackTool.flushMainOrder()

                    isClearStatusOfEditor = router.cleanEditorByCheckout();

                    // 快捷支付
                    if (rs.needPayFinanceId) {
                        PayModule.openQuickPay(rs.needPayFinanceId)
                    }
                    // 条码支付
                    if (rs.needBarFinanceId) {
                        PayModule.openSaomaPay(rs.needBarFinanceId)
                    }
                    // 剩余数量
                    CellUtil.updateRemainRooms()
                } else {
                    cellStackTool.resetCellsAndVm()
                }
                okfn(mainOrder, isClearStatusOfEditor)
            } else {
                tmsky.ui.dialog.tips('保存错误：' + rs.message, 'error')
            }
        })
    },
    deleteOrder: function () {
        if (!g_mainOrder.id)
            return
        // 根据是否开通psb做数据处理
        Pms2PsbOrderUtil.orderBeforeCurd(g_mainOrder.subOrders, 1)

        // tmsky.ui.dialog.loading()
        // $.get('/order/delOrder/' + g_mainOrder.id).done(function (rs) {
        //     tmsky.ui.dialog.loading.close()
        //     if (rs.status == 200) {
        //         tmsky.ui.dialog.tips('删除成功', 'success')
        //         // 清除旧
        //         oldMain = MainOrderUtil.getById(g_mainOrder.id)
        //         oldMain && oldMain.erase()
        //         cellStackTool.resetCellsAndVm()
        //         router.changeStatus(CONST.G_NORMAL).viewRoute()
        //     } else {
        //         tmsky.ui.dialog.tips('删除失败：' + rs.message, 'error')
        //     }
        // }).always(function (rs) {
        //     tmsky.ui.dialog.loading.close
        //     // 百度统计
        //     _hmt.push(['_trackEvent', 'order', 'click', '删除订单'])
        // })
    },
    // 获取订单
    getOrder: function (mainId, okfn, showLoading) {
        if (tmsky.isEmpty(showLoading) || showLoading) {
            tmsky.ui.dialog.loading()
        }
        $.get('/order/view/' + CONST.ORDER_FROM.WEB_ROOM_STATUS + "/" + mainId, {
            't': new Date().valueOf()
        }).done(function (rs) {
            tmsky.ui.dialog.loading.close()

            if (rs.status == 200) {
                g_mainOrder = rs.mainOrder
                roomCellLength = MainOrderUtil.calcRoomCellLength(g_mainOrder)
                okfn(g_mainOrder)
            } else {
                tmsky.ui.dialog.tips(rs.message, 'error')
            }
        })
    },
    revokeCheckout: function () {
        tmsky.ui.dialog.confirm("确认撤销退房？", function () {
            tmsky.ui.dialog.loading()
            $.get("/order/revokeCheckOut/" + g_mainOrder.id, function (rs) {
                var msg, icon;
                if (rs.status == 200) {
                    tmsky.ui.dialog.tips('撤销退房成功', 'success')
                    g_mainOrder = rs.mainOrder ? rs.mainOrder : g_mainOrder;
                    g_mainOrder.subOrders.forEach(function (el) {
                        if (el.checkInAt !== el.checkOutAt) {
                            controller.setRoomDirtyStatus(el.room.id, false)
                        }
                    })
                    //当日住当日退不点击  并且会收回订单侧边栏
                    if (rs.mainOrder.checkInAt != rs.mainOrder.checkOutAt) {
                        router.cellReclick(CONST.G_IN)
                    } else {
                        Editor.close()
                    }

                } else {
                    tmsky.ui.dialog.tips('撤销退房失败：' + rs.message, 'error')
                }
            }).always(tmsky.ui.dialog.loading.close);
        }, true, "撤销退房提醒");
    },
    // 智能发送短信
    _sendMsg: function (mainOrder) {
        var firstPerson = mainOrder.persons[0],
            mainId = mainOrder.id,
            orderStatus = mainOrder.orderStatus,
            oldStatus = g_mainOrder.orderStatus;
        if (!firstPerson) {
            return
        }
        var data = {
            mobile: firstPerson.phone,
            name: firstPerson.name,
            customerFromId: mainOrder.customerFrom.id
        },
            msgTypeMap = {
                1: 2,
                3: 3,
                5: 4
            };

        if (!data.mobile)
            return;

        // 新增预定、 入住， 预定转入住， 退房发送 预定 入住 退房 2 ，3, 4
        if (g_mainOrder.id == null || (oldStatus === CONST.M_BOOK && orderStatus === CONST.M_IN) || (oldStatus !== CONST.M_OUT && orderStatus === CONST.M_OUT)) {
            var type = msgTypeMap[orderStatus]
            if (!type)
                return;
            // $.post('/inns/msg/sendMsgsIntellectMany/'+type+'/'+mainId, data)
            // .done(function(rs) {
            // if (rs.noneed != "true") {
            // tmsky.ui.dialog.notify({
            // title: '智能短信发送提醒',
            // content: rs.errors + '',
            // time: 5
            // })
            // }
            // })
        }
    },
    updateRatePlan: function (okfn) {
        var vm = vm_finances, incidentalNewPrice = vm.ratePlan.incidentals, incidentalOldPrice = vm.ratePlan.incidentalOldPrice,
            paidAmount = vm.paidAmount ? vm.paidAmount : 0,
            postData = {
                id: vm.ratePlan.incidentalId,
                item: 9,
                operateType: 2, // 修改
                price: incidentalNewPrice ? incidentalNewPrice : 0,
                recordAt: tmsky.date.format(new Date(), 'yyyy-MM-dd hh:mm'),
                uniqueCode: vm.ratePlan.incidentalUniqueCode,
                payChannel: {
                    id: 7
                },
                rmk: vm.ratePlan.incidentalDetail
            }

        tmsky.ui.dialog.loading()
        $.ajax({
            type: "POST",
            url: "/finance/update",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(postData)
        }).done(function (rs) {
            if (!$.isEmptyObject(rs)) {
                if (rs.status === 200 && typeof okfn === 'function') {
                    tmsky.ui.dialog.tips('修改成功', 'success')
                    okfn(Number(incidentalNewPrice) - Number(incidentalOldPrice) + Number(paidAmount), incidentalNewPrice, postData.recordAt)
                } else {
                    tmsky.ui.dialog.tips(rs.message, 'error')
                }
            } else {
                okfn()
            }
        }).always(tmsky.ui.dialog.loading.close)
    }
}
var cellStackTool = {
    convertData: function (nullStatus) {
        try {
            ordersData = vm_orders.convertData(g_mainOrder, nullStatus)
            gustData = vm_guests.convertData()
            financesData = vm_finances.convertData()
            remarkDate = vm_remark.convertData()
        }
        catch (msg) {
            if (typeof msg === 'string') {
                Editor.showError(msg)
            }
            return;
        }
        jsonData = $.extend(true, {}, ordersData, gustData, financesData, remarkDate)
        jsonData.id = g_mainOrder.id
        return jsonData
    },
    pushOrPop: function (roomcell, offset) {
        if (roomcell.isOn(offset)) {
            this.removeCell(roomcell, offset)
        } else {
            this.addCell(roomcell, offset)
        }
        // 所选中格子的入住日期是否大于今天。是：不需要显示身份证录入以及名族
        vm_guests.setNeedCardAndNation()
    },
    addCell: function (roomcell, offset) {
        var date = roomcell.date,
            roomId = roomcell.roomId,
            uid = roomcell.uid,
            cellPrice = roomcell.getPrice(), item

        if (offset != null) {
            date = tmsky.date.plusDate(date, offset, 'd', 'yyyy-MM-dd')
        }

        item = {
            roomId: roomId,
            date: date,
            price: cellPrice,
            hasSpecialPrice: roomcell.hasSpecialPrice(),
            hasMainOrder: MainOrderUtil.hasMainOrder(g_mainOrder),
            roomCellLength: roomCellLength
        }

        vm_orders.addItem(item)
        vm_orders.composeOrders()

        roomcell.turnOn(offset)
        // 主订单最多少20个子订单
        if (vm_orders.orders.length > 30) {
            tmsky.ui.dialog.tips('一个订单最多选择30个连续日期的房间！', 'error')
            this.removeCell(roomcell, offset)
        }
        return this
    },
    removeCell: function (roomcell, offset) {
        var date = roomcell.date,
            roomId = roomcell.roomId

        if (offset != null) {
            date = tmsky.date.plusDate(date, offset, 'd', 'yyyy-MM-dd')
        }
        vm_orders.removeItem(roomId, date)
        vm_orders.composeOrders()

        roomcell.turnOff(offset)
        return this
    },
    size: function () {
        return vm_orders.$priceRep.length
    },
    // 刷新main信息到vm
    flushMainOrder: function (state) {
        if (!g_mainOrder.id)
            return;

        var arr = [vm_orders, vm_guests, vm_finances, vm_remark]

        arr.forEach(function (el) {
            el.flushMainOrder(g_mainOrder, state)
        })
    },
    _resetVm: function () {
        var arr = [vm_orders, vm_guests, vm_finances, vm_remark]

        arr.forEach(function (el) {
            el.reset()
        })
        g_mainOrder = {
            id: null,
            orderStatus: null
        }
    },
    resetCells: function () {
        // 格子清除样式
        vm_orders.$priceRep.forEach(function (el) {
            var cell = CellUtil.getByRoomAndDate(el.roomId, el.date)

            cell && cell.turnOff()
        })
        actMainOrder && actMainOrder.turnOff()
        actMainOrder = null
    },
    resetCellsAndVm: function () {
        this.resetCells()
        this._resetVm()
    }
}
// 订单摘要
var orderSummary = {

    init: function ($roomcellGrid) {
        var $tootip = $('<div class="house-tooltip" style="display:none;"></div>').appendTo($('body')),
            __tooltip_timer__ = null,
            orderTipTpl = __inline('../handlebars/order-tip.handlebars'),//TODO 编译替换到control.js后此句放开、保留，下一行的orderTipTpl删除
            container = $roomcellGrid.parent(),
            containerOffset = container.offset(),
            max_left = container.width() + containerOffset.left
        max_top = container.height() + containerOffset.top

        $(window).resize(function (e) {
            max_left = container.width() + containerOffset.left
            max_top = container.height() + containerOffset.top
        })

        $roomcellGrid.on("mouseenter", "div[uid]", function (event) {
            var $this = $(this),
                posi = {
                    left: event.pageX,
                    top: event.pageY
                }
            __tooltip_timer__ = setTimeout(function () {
                var uid = $this.attr('uid'),
                    cell = CellUtil.getByUid(uid),
                    contents = '', tplData, room, main, orderType, startAndStop

                if (cell) {
                    if (cell.mainId == null) {
                        room = RoomUtil.getById(cell.roomId)

                        tplData = {
                            mainId: cell.mainId,
                            date: cell.date,
                            roomNo: room.roomNo,
                            roomtypeName: room.roomtype.name,
                            price: cell.getPrice() || room.price
                        }
                    } else if (!cell.isOn()) {
                        main = MainOrderUtil.getById(cell.mainId)
                        orderType = cell.orderType
                        startAndStop = main.getStartAndStop()
                        if (main.discountAmount == null) {
                            main.discountAmount = 0
                        }

                        tplData = {
                            mainId: main.id,
                            guest: main.guest,
                            channelName: main.channelName,
                            totalAmount: main.totalAmount,
                            contact: main.contact,
                            needPlane: main.icon == 1 ? true : false,
                            needCar: main.icon == 2 ? true : false,
                            needSpe: main.icon == 3 ? true : false,
                            needRatePlan: main.icon == 4 ? true : false,
                            needdanbao: main.icon == 7 ? true : false,
                            hasRmk: main.hasRmk,
                            gradeName: main.gradeName,
                            gradeNum: vm_guests.getUnionIndexByName(main.gradeName),
                            hasRemind: main.hasRemind,
                            remind: main.remind,
                            needPay: tmsky.number.fixFloat(Math.abs(main.totalAmount - main.paidAmount - main.discountAmount), 2, 0),
                            needPayText: main.paidAmount + main.discountAmount > main.totalAmount ? '退' : '补',
                            weifu: main.totalAmount > main.paidAmount + main.discountAmount,
                            orderType: orderType == CONST.SUB_BOOK ? 'book' : orderType == CONST.SUB_IN ? 'in' : orderType == CONST.SUB_OUT ? 'out' : '',
                            start: startAndStop.start.substr(5),
                            stop: startAndStop.stop.substr(5),
                            days: startAndStop.days
                        }
                    }

                    if (tplData) {
                        $tootip.html(orderTipTpl(tplData))

                        // 修正范围
                        var w = $tootip.outerWidth(),
                            h = $tootip.outerHeight()
                        if (posi.left + w > max_left) {
                            posi.left = posi.left - w
                        }
                        if (posi.top + h > max_top) {
                            posi.top = posi.top - h
                        }
                        $tootip.css(posi).show()
                    }

                }
            }, 500)
        }).on("mouseleave", "div[uid]", function (e) {
            clearTimeout(__tooltip_timer__)
            $tootip.hide()
        })
    }
}
var controller = {
    router: router,
    // 获取房态
    renderRoomStatus: function (date, cb, showLoading) {
        if (tmsky.isEmpty(showLoading) || showLoading) {
            tmsky.ui.dialog.loading();
        }
        $.get('/index/roomStatus/' + date, {
            t: new Date().valueOf()
        }).done(function (rs) {
            if (rs.status == 200) {
                var arr = rs.roomStatus || []
                arr.forEach(function (el) {
                    if (CONST.M_CANCLE !== el.mainId) {
                        var main = MainOrderUtil.parseRoomStatus(el)
                        main.lazyRender(false)
                    }
                })

                CellUtil.batchRender()// 批量渲染
                CellUtil.updateRemainRooms() // 剩余数量
                if (Plug.hasFunc(Plug.F_FOLD)) {
                    CellUtil.updateAllHasFoldRoomTypeRemainNums()// 重新计算已经折叠的房型的房间剩余数量
                }
                setTimeout(function () {
                    controller.changeRoomOrder()
                }, 800)

                if (typeof cb === 'function') {
                    cb()
                }
            } else {
                tmsky.ui.dialog.tips('获取房态错误 ' + rs.message, 'error', 5000)
                setInterval(function () {
                    window.location.href = User.getUserInfo().logoutUrl;
                }, 5000);
            }
        }).always(tmsky.ui.dialog.loading.close);
    },
    // 获取周末价/锁房
    renderLockAndPrice: function (start) {
        var end = tmsky.date.plusDate(start, CONST.VIEW_DAYS, 'd', 'yyyy-MM-dd')
        $.post('/index/roomStatus/priceLocked', {
            start: start,
            end: end
        }).done(function (rs) {
            if (rs.status == 200) {
                var lockrooms = rs.lockedRooms,
                    givenPrices = rs.specialPrices,
                    weekPrices = rs.weekPrices, roomtypeId, roomtype, cell, cellArr, price, priceArr, weekArr, date;

                // 锁房
                lockrooms.forEach(function (el) {
                    cell = CellUtil.getByRoomAndDate(el.roomId, el.closeDate)
                    cell && cell.lock()
                })
                // 特殊价
                givenPrices.forEach(function (el) {
                    roomtypeId = el.roomTypeId
                    price = el.price
                    date = el.specialDate
                    roomtype = RoomUtil.getRoomtypeById(roomtypeId)
                    if (roomtype) {

                        roomtype.rooms.forEach(function (room) {
                            cell = CellUtil.getByRoomAndDate(room.id, date)
                            cell && cell.setGivenPrice(price)
                        })
                    }
                })
                // 周末价
                weekPrices.forEach(function (el) {
                    roomtypeId = el.roomTypeId
                    priceArr = el.price.split(',')
                    weekArr = el.week.split(',')
                    roomtype = RoomUtil.getRoomtypeById(roomtypeId)

                    if (roomtype && weekArr.length && weekArr[0] !== '') {
                        weekArr.forEach(function (week, index) {
                            price = priceArr[index]
                            roomtype.rooms.forEach(function (room) {
                                cellArr = CellUtil.getByRoomAndWeek(room.id, week) || []
                                cellArr.forEach(function (cell) {
                                    cell && cell.setWeekPrice(price)
                                })
                            })
                        })
                    }
                })
            } else {
                tmsky.ui.dialog.alert('获取锁房/周末价错误！')
            }
        })
    },
    bindEvent: function () {
        var self = this,
            $roomcellGrid = $('#roomcell_grid'),
            $roomGrid = $('#room_grid'),
            $dateGrid = $('#date_grid'),
            $dateRange = $('#date_range'),
            $datepicker = $("#datepicker"),
            startDate = tmsky.date.plusDate(today, CONST.VIEW_PRE_DAYS, 'd', 'yyyy-MM-dd'),
            $tishi = $('<span class="open-calendar"></span>'),
            $datePanel = $('.date-panel-wrap .date-panel'),
            $dateLi = $('#date_grid li'),
            $off_openTishi = $('.off_openTishi'),
            $xy_off_openTishi = $('.xy_off_openTishi'),
            $on_openTishi = $('.on_openTishi');
        $xy_on_openTishi = $('.xy_on_openTishi');

        //hover事件
        $datePanel.on('mouseover', function () {
            $tishi.text('点击打开日历')
            $tishi.appendTo($('.date-panel-wrap'))
        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })

        $dateLi.on('mouseover', function () {
            $tishi.text('点击查看日报')
            $tishi.appendTo($(this))
        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })

        $off_openTishi.on('mouseover', function () {
            $tishi.text('点击收缩房型')
            $tishi.appendTo($(this))
            $('.open-calendar').css({ 'top': '50%', 'left': '75%' })

        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })

        $on_openTishi.on('mouseover', function () {
            $tishi.text('点击展开房型')
            $tishi.appendTo($(this))
            $('.open-calendar').css({ 'top': '55%', 'left': '70%' })
        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })
        //横版房态
        $('#date_grid dl').on('mouseover', function () {
            $tishi.text('点击查看日报')
            $tishi.appendTo($(this))
            $('.open-calendar').css({ 'top': '30px' })
        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })

        $xy_off_openTishi.on('mouseover', function () {
            $tishi.text('点击收缩房型')
            $tishi.appendTo($(this).parent())
            $('.open-calendar').css({ 'top': '30%', 'left': '60%' })

        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })

        $xy_on_openTishi.on('mouseover', function () {
            $tishi.text('点击展开房型')
            $tishi.appendTo($(this))
            $('.open-calendar').css({ 'top': '55%', 'left': '70%' })
        }).on('mouseout', function () {
            $('.open-calendar').remove()
        })


        // 房间点击
        $roomcellGrid.on('click', 'div[uid]', function (e) {
            var $target = $(e.target),
                $el = $(this),
                uid = $el.attr('uid'),
                roomcell = CellUtil.getByUid(uid), offset

            if ($target.parent().attr('role') === 'orderitem') {
                $target = $target.parent() // 兼容还旧版
            }

            offset = $target.attr('days')
            if (!roomcell || roomcell.isLock)
                return;

            router.cellClickHandle(roomcell, offset)
        })

        // 日期选择
        $dateRange.on('click', function (e) {
            e.stopPropagation()
            $datepicker.show()
        }).html(startDate.substr(5))

        $datepicker.datepicker({
            changeMonth: true,
            onSelect: function () {
                $(this).hide()
                _pickDateAfter($datepicker.datepicker("getDate"))
            }
        }).on('click', function (e) {
            e.stopPropagation()
        }).val(startDate)

        $(document).on('click', function (event) {
            $datepicker.hide()
        })

        $(document).on('keydown', function (e) {
            var e = window.event || e;
            if (e.keyCode == 9 && $('.tabId:focus').length > 0) {
                var index = $('.tabId:focus').attr('tabInd')
                index++
                $('.tabId[tabInd=' + index + ']').focus()
                return false
            }
        })

        // 上一月
        $('#prev_month').on('click', function () {
            var date = tmsky.date.plusDate($datepicker.datepicker("getDate"), -1, 'M')
            $datepicker.datepicker("setDate", date)
            _pickDateAfter(date)
        })
        // 下一月
        $('#next_month').on('click', function () {
            var date = tmsky.date.plusDate($datepicker.datepicker("getDate"), 1, 'M')
            $datepicker.datepicker("setDate", date)
            _pickDateAfter(date)
        })

        // 选择日期后处理
        var _pickDateAfter = function (d) {
            router.cleanEditor(true)
            date = tmsky.date.format(d)
            $dateRange.html(date.substr(5))

            CellUtil.updateRoomGrid(CONST.VIEW_DAYS, date)
            MainOrderUtil.clear()

            self.renderRoomStatus(date)
            self.renderLockAndPrice(date)
        }

        // 隔行变色
        $roomGrid.find('[markroom]:odd').addClass('bg-room-gray');

        // 拖动换房
        if (Access.access(Access.AC_BOOK) || Access.access(Access.AC_CHECK_IN)) {
            RoomcellDrag.bindDrag($roomcellGrid)
        }

        // 订单摘要绑定
        orderSummary.init($roomcellGrid)

        var MARK = 'markon'
        // 位置提示
        $roomcellGrid.on("mouseenter", "li[role=orderitem], div[uid]", function (e) {
            var uid = $(this).closest('[uid]').attr('uid'),
                $target = $(e.target), cell

            if ($target.attr('role') === 'orderitem') {
                uid = (+uid) + parseInt($target.attr('days'), 10)
            }
            cell = CellUtil.getByUid(uid)

            if (cell) {
                var date = cell.date,
                    roomId = cell.roomId,
                    dates = $dateGrid.find('[markdate]').removeClass(MARK),
                    rooms = $roomGrid.find('[markroom]').removeClass(MARK)

                dates.filter('[markdate=' + date + ']').addClass(MARK)
                rooms.filter('[markroom=' + roomId + ']').addClass(MARK)
            }
        })

        // 脏房功能
        if (Plug.hasFunc(Plug.F_DIRTY_ROOM)) {
            // 初始化脏房
            var rooms = RoomUtil.getAll(),
                $handler = $('<div class="clean-status">置为脏房</div>').appendTo($('body')),
                activeRoomEle = null

            rooms.forEach(function (el) {
                var $roomEle = $roomGrid.find('[markroom=' + el.id + ']'),
                    $tag = $roomEle.children('.tag-zang')

                if (el.isDirty) {
                    $tag.show()
                    $roomEle.data('zang', true)
                }
            })
            // 绑定设置 (ie 下溢出无法显示，横向空白)
            $roomGrid.on('mouseenter', '.room-num-section', function (e) {
                activeRoomEle = $(this)
                var offset = activeRoomEle.offset(),
                    top = offset.top,
                    left = offset.left,
                    isDirty = activeRoomEle.data('zang'),
                    text = isDirty ? '置为净房' : '置为脏房'

                if (User.isXYRoomStyle()) {
                    top = top + 25
                } else {
                    left = left + 61.5
                }
                $handler.css({
                    top: top,
                    left: left
                }).html(text).show()

                activeRoomEle.addClass(MARK)
            }).on("mouseleave", '.room-num-section', function (e) {
                activeRoomEle.removeClass(MARK)
                $handler.hide()
            })

            $handler.on('click', function (e) {
                var isDirty = activeRoomEle.data('zang'),
                    roomId = activeRoomEle.attr('markroom'),
                    $tag = activeRoomEle.children('.tag-zang'),
                    room = RoomUtil.getById(roomId),
                    changeDirty = !isDirty

                if (changeDirty) {
                    $tag.show()
                    $handler.html('置为净房')
                } else {
                    $tag.hide()
                    $handler.html('置为脏房')
                }
                activeRoomEle.data('zang', changeDirty)
                room.setDirty(changeDirty)
            }).on('mouseenter', function (e) {
                activeRoomEle.addClass(MARK)
                $handler.show()
            }).on('mouseleave', function () {
                $handler.hide()
                activeRoomEle.removeClass(MARK)
            })
        }
        // 折叠房态
        if (Plug.hasFunc(Plug.F_FOLD)) {
            $roomGrid.on('click', '[foldhandle]', function () {
                var $this = $(this),
                    roomtypeId = $this.attr('roomtype'),
                    handle = $this.attr('foldhandle'),
                    $target = $this.closest('li')
                if (handle === 'on') {
                    // 打开 房型
                    CellUtil.unfoldRoomtype(roomtypeId, $roomcellGrid)
                    $target.addClass('hide').prev().removeClass('hide')
                } else {
                    // 计算剩余量 关闭
                    CellUtil.foldRoomtype(roomtypeId, $roomcellGrid)
                    $target.addClass('hide').next().removeClass('hide')
                }
            })
        }
        return self
    },
    initVModels: function (vmodels, editor) {
        vm_btns = vmodels.vm_btns
        vm_finances = vmodels.vm_finances
        vm_guests = vmodels.vm_guests
        vm_orders = vmodels.vm_orders
        vm_remark = vmodels.vm_remark
        vm_msg = vmodels.vm_msg
        vm_finance_detail = vmodels.vm_finance_detail
        vm_order_log = vmodels.vm_order_log
        vm_b_checkout_model = vmodels.vm_b_checkout_model

        Editor = editor

        editor.onClick(router.btnClick)

        // 绑定一些按钮处理
        if (Plug.hasFunc(Plug.F_MSG) && (Access.access(Access.AC_BOOK) || Access.access(Access.AC_CHECK_IN))) {
            $('#msg_popups').on('show.tc.popups', function (e) {
                // 判断是否弹出短信
                var person = vm_guests.getMainPerson(),
                    name = person.name || '',
                    phone = person.phone
                if (phone === '') {
                    e.preventDefault()
                    tmsky.ui.dialog.tips('主入住人没有填写手机号，无法发送！', 'error')
                }
                vm_msg.name = name
                vm_msg.phone = phone
                vm_msg.getMsgLogs(vm_guests.$g_mainOrder.id);
                vm_msg.reset()
            })
        } else {
            $('#msg_popups_trigger').hide()
        }
        // 删除订单
        if (Access.access(Access.AC_DEL_ORDER)) {
            vm_orders.isAccessDeleteOrder = true
            $(document).on('click', '#del_order_btn', function () {
                tmsky.ui.dialog.confirm('将删除该订单全部信息（非取消订单），只保留删除日志，确定要删除此订单？', function () {
                    ajaxTool.deleteOrder()
                })
            })
        } else {
            vm_orders.isAccessDeleteOrder = false
        }

        // 财务记录历史
        $('#finance_popups').on('show.tc.popups', function (e) {
            e.preventDefault()
            if (!g_mainOrder.uniqueCode) {
                // tmsky.ui.dialog.alert('暂无订单财务记录')
                return
            }
            vm_finance_detail.flushData(g_mainOrder.uniqueCode)
        })

        // 订单历史
        $('#order_log_popups').on('show.tc.popups', function (e) {
            e.preventDefault()
            if (!g_mainOrder.id) {
                return
            }
            vm_order_log.flushData(g_mainOrder.id)
        })

        // 打印
        $('#print_btn').on('click', function () {
            // 检验
            var printUtil = Editor.getPrintTplUtil(),
                mainId = g_mainOrder.id,
                type = g_status === CONST.G_IN ? 3 : 4

            if (type === 3 && !printUtil.hasCkinTpl()) {
                tmsky.ui.dialog.tips("您还没有设置[入住凭证打印模板]，请到功能库中设置", 'error')
                return;
            }
            if (type === 4 && !printUtil.hasCkoutTpl()) {
                tmsky.ui.dialog.tips("您还没有设置[结账单打印模板]，请到功能库中设置", 'error')
                return;
            }
            window.open("/inns/print/" + type + "/" + mainId);
        })
        // 验证
        $('#avalon_contrl').validator({
            onKeyup: true,
            eachValidField: function (event, status, options) {
                var $this = $(this),
                    parent = $this.parent(),
                    target = parent.hasClass('input-group') ? parent : $this

                target.removeClass('v-error')
                target.poptip('destroy')
            },
            eachInvalidField: function (event, status, options) {
                var $this = $(this),
                    parent = $this.parent(),
                    target = parent.hasClass('input-group') ? parent : $this

                target.addClass('v-error')
                target.poptip({
                    content: '' + status.msg
                }).poptip('show')
            }
        })
        return this
    },
    //新办订单必须要填姓名
    orderLimitName: function () {
        var persons = vm_guests.convertData().persons
        var noName = false
        persons.forEach(function (el, index) {
            if (tmsky.isEmpty(el.name)) {
                noName = true
            }
        })
        if (noName) {
            tmsky.ui.dialog.tips('姓名不能为空', 'error')
            return false
        } else {
            return true
        }
    },
    // 获取支付需要的信息
    getPayInfo: function (financeId) {
        var rs = {
            rooms: []
        },
            financeEnum = vm_finances.financeEnum,
            orders = vm_orders.orders.$model || [],

            financeArr = g_mainOrder.financeRecords,
            mainPerson = g_mainOrder.persons[0], i, len, el;

        for (i = 0, len = financeArr.length; i < len; i++) {
            el = financeArr[i]
            if (el.id == financeId) {
                rs.financeId = financeId
                rs.money = el.price
                rs.financeName = financeEnum[el.item].name
                break
            }
        }

        for (i = 0, len = orders.length; i < len; i++) {
            el = orders[i];
            rs.rooms.push({
                roomNo: el.roomNo,
                typeName: el.roomtypeName,
                checkIn: el.start,
                checkOut: el.stop,
                days: el.days
            });
        }

        if (mainPerson) {
            rs.contact = mainPerson.phone || ''
            rs.userName = mainPerson.name || ''
        }
        rs.totalAmount = g_mainOrder.totalAmount || 0
        rs.uniqueCode = g_mainOrder.uniqueCode

        return rs
    },
    scanPaySuccCb: function (financeId) {
        var i, len, el,
            arr = vm_finances.datas

        for (i = 0, len = arr.length; i < len; i++) {
            el = arr[i]
            if (el.id == financeId) {
                el.payStatus = "1";
                el.canModify = false;
                break;
            }
        }
        // 改变主订单中信息
        arr = g_mainOrder.financeRecords
        for (i = 0, len = arr.length; i < len; i++) {
            el = arr[i];
            if (el.id == financeId) {
                el.payStatus = "1";
                el.canModify = "0";
                break;
            }
        }
    },
    setPayModule: function (module) {
        PayModule = module
    },
    clearSelected: function () {
        cellStackTool.resetCellsAndVm()
        router.changeStatus(CONST.G_NORMAL)
        Editor.close()
    },
    LinkMainOrder: function (mainId, date, topos, hasDel) {
        var main = MainOrderUtil.getById(mainId),
            self = this, first, cell, site, subDate;

        if (main) {
            first = main.getFirstGroup()
            cell = CellUtil.getByRoomAndDate(first.roomId, first.start)
            if (cell) {
                cell.$el.click()
                if (undefined !== topos && null !== topos && '' !== topos && !topos)
                    return
                site = CellUtil.getCellSite(cell)
                CellUtil.scrollToBox(site.x, site.y)
                //cb && cb()
            } else {
                subDate = date.substr(5)
                //长订单，切main存在
                CellUtil.updateRoomGrid(CONST.VIEW_DAYS, date)
                MainOrderUtil.clear()

                this.renderRoomStatus(date, function () {
                    self.LinkMainOrder(mainId, date, true, true)
                }, false)
                this.renderLockAndPrice(date)

                $('#date_range').html(subDate)
                $("#datepicker").val(date)
                tmsky.ui.dialog.mask.close();
                tmsky.ui.dialog.loading.close();
            }
        } else {
            if (hasDel) {
                tmsky.ui.dialog.tips('该订单已经被取消或者删除!', 'error')
                var url = location.href.split('?changeRoom=')[1]
                if (url) {
                    setTimeout(function () {
                        location.href = 'index.html'
                    }, 1000)
                }

                return
            }
            subDate = date.substr(5)

            CellUtil.updateRoomGrid(CONST.VIEW_DAYS, date)
            MainOrderUtil.clear()

            this.renderRoomStatus(date, function () {
                self.LinkMainOrder(mainId, date, true, true)
            }, false)
            this.renderLockAndPrice(date)

            $('#date_range').html(subDate)
            $("#datepicker").val(date)
            tmsky.ui.dialog.mask.close();
            tmsky.ui.dialog.loading.close();
        }
    },
    // 是否编辑啦
    isEdited: function () {
        // 名字 手机 证件号 佣金 订单号 备注 财务金额
        var guests = vm_guests.datas.$model,
            mainGuest = guests[0] || null

        if (guests.length > 1 || mainGuest.name || mainGuest.phone || mainGuest.cardNo) {
            return true
        }
        if (vm_guests.commission || vm_guests.orderNo) {
            return true
        }

        if (vm_remark.content) {
            return true
        }

        var financeArr = vm_finances.datas.$model || []

        var i, len, el;
        for (i = 0, len = financeArr.length; i < len; i++) {
            el = financeArr[i]
            if (el.amount) {
                return true
            }
        }
        return false
    },
    // 身份证读卡器 读卡
    readIdCardGuest: function (data) {
        vm_guests && vm_guests.addFirst(data)
    },
    getGlobalStatus: function () {
        return g_status
    },
    setRoomDirtyStatus: function (roomId, isDirty) {
        var room = RoomUtil.getById(roomId),
            $roomEle = $('#room_grid').find('[markroom=' + roomId + ']'),
            $tag = $roomEle.children('.tag-zang')
        isDirty ? $tag.show() : $tag.hide()
        $roomEle.data('zang', isDirty)
        // 移植到后台处理了
        // room.setDirty(true)
    },
    changeRoomOrder: function () {
        //判断是否来自去调房命令
        var url = location.href
        var url2 = url.split('?changeRoom=')[1]
        if (url2) {
            url = url2.split('&&checkInAt=')
            var changeRoomId = url[0];
            var charDate = url[1];
            try {
                this.LinkMainOrder(changeRoomId, charDate)
            } catch (e) {

            }

        }
    },
    set_g_mainOrder: function (mainOrder) {
        g_mainOrder = mainOrder
    }
}

module.exports = controller