/**
 * Created by yu on 2016/4/15.
 */
// var Dialog = require('dialog')
//var Controller = require('../js/control.js')
var User = require('../../header/user.js')

var vm_common_pay, $quickPay, $saomaPay, $saomaInput, timer,
    PMS_DOMAIN_NAME = 'www.fanqiele.com',
    PAY_MODE = {
        1 : '支付宝',
        2 : '微信',
        3 : '银联'
    }

module.exports = {
    init : function () {
        if (!$quickPay) {
            $quickPay = $(__inline('quick-pay.tpl')).appendTo($('body'))
            $saomaPay = $(__inline('saoma-pay.tpl')).appendTo($('body'))
            $saomaInput = $saomaPay.find('input')

            vm_common_pay = avalon.define({
                $id : 'vm_common_pay',
                financeId : '',
                uniqueCode : null,
                userName : '',
                money : '',
                financeName : '',
                firstRoom : '',
                rooms : [],
                done : false,
                closed : false,
                failed : false,
                succ : false,

                QRcode : '',
                payMode : '',

                keyupHandle : function (e) {
                    var vm = vm_common_pay,
                        authCode = $saomaInput.val().trim(),
                        innId = User.getUserInfo().innId,
                        financeId = vm.financeId,
                        payDes = ''
                    vm.rooms.forEach(function (el) {
                        payDes += el.typeName + '(' + el.roomNo + '),' + el.checkIn.substr(5) + '入住，住' + el.days + '晚;';
                    })
                    if (e.which === 13) {
                        // 提交条码支付
                        var getData = {
                            innId : innId,
                            authCode : authCode,
                            financeId : financeId,
                            uniqueCode : vm.uniqueCode,
                            payPrice : vm.money,
                            payDes : payDes,
                            temp : new Date().valueOf()
                        }
                        $.get('/finance/askBarCodeAlipay', getData).done(function (rs) {
                            vm_common_pay.done = true
                            if (rs.status == 200) {
                                vm_common_pay.succ = true
                                scanPaySuccCb(financeId);// 回调显示
                            } else {
                                vm_common_pay.failed = true
                            }
                        })
                    }
                },
                // 条码支付 失败后从新支付
                repay : function () {
                    var vm = vm_common_pay

                    vm.done = vm.closed = vm.failed = vm.succ = false; // 状态
                    $saomaInput.val('').focus()
                }
            })
            avalon.scan($quickPay[0])
            avalon.scan($saomaPay[0])

            $quickPay.on('click', '.close', function (e) {
                clearInterval(timer)
                $quickPay.popups('hide')
            })
        }
    },
    openSaomaPay : function (financeId) {
        var info = getPayInfo(financeId);
        if (!info.financeName) {
            tmsky.ui.dialog.alert('没有找到条码支付的财务记录！');
            return;
        }
        // 赋值
        this._commonOpen(info)
        $saomaPay.popups()
        $saomaInput.val('').focus()
    },
    // 打开快捷支付
    openQuickPay : function (financeId, data) {
        var info = getPayInfo(financeId, data);
        if (!info.financeName) {
            tmsky.ui.dialog.alert('没有找到快捷支付的财务记录！');
            return;
        }
        // 获取二维码
        _getQRcode(info);
        // 赋值
        this._commonOpen(info)
        $quickPay.popups()
        _listen(info.financeId); // 监听支付状态
    },
    _commonOpen : function (info) {
        vm_common_pay.financeId = info.financeId
        vm_common_pay.uniqueCode = info.uniqueCode
        vm_common_pay.userName = info.userName ? (info.userName + ',') : '';
        vm_common_pay.financeName = info.financeName;
        vm_common_pay.money = info.money;
        vm_common_pay.firstRoom = info.rooms[0];
        vm_common_pay.rooms = info.rooms;
        vm_common_pay.done = vm_common_pay.closed = vm_common_pay.failed = vm_common_pay.succ = false; // 状态
    }

}
function scanPaySuccCb(financeId) {
    var i, len, el,
        arr = avalon.vmodels.vm_finance_detail.datas

    for (i = 0, len = arr.length; i < len; i++) {
        el = arr[i]
        if (el.id == financeId) {
            el.payStatus = "1";
            el.canModify = false;
            break;
        }
    }
    // 改变主订单中信息
    //arr = g_mainOrder.financeRecords
    //for (i = 0, len = arr.length; i < len; i++) {
    //    el = arr[i];
    //    if (el.id == financeId) {
    //        el.payStatus = "1";
    //        el.canModify = "0";
    //        break;
    //    }
    //}
}
// 获取支付需要的信息
function getPayInfo(financeId, data) {
    //rsone = {
    //    financeId : financeId,
    //    money : e.price,
    //    financeName : e.item,
    //
    //    //rooms : [
    //    //    {
    //    //        checkIn : "2016-04-15",
    //    //        checkOut : "2016-04-16",
    //    //        days : 1,
    //    //        roomNo : "5",
    //    //        typeName : "test"
    //    //    }
    //    //
    //    //],
    //
    //    contact : order.contactPhone,
    //    userName : order.contactUser,  //mainPerson
    //
    //    totalAmount : order.totalAmount,
    //    uniqueCode : order.uniqueCode
    //}

    var rs = {};
    var roomsArray = [],
        data = avalon.vmodels.vm_order_operate.finance.$model.values,
        order = avalon.vmodels.vm_order_operate.order.$model;
    data.forEach(function (e, i) {
        if (e.payChannel.id == 1) {
            rs = {
                financeId : financeId,
                money : e.price,
                financeName : avalon.vmodels.vm_order_operate.finance.items[e.item].name,
            }

        }
    })


    for (var i = 0, len = order.subOrders.length; i < len; i++) {
        var el = order.subOrders[i];
        roomsArray.push({
            roomNo : el.room.roomNo,
            typeName : el.room.roomType.name,
            checkIn : el.checkInAt,
            checkOut : el.checkOutAt,
            days : el.days
        });
    }
    rs.rooms = roomsArray;

    rs.contact = order.contactPhone || ''
    rs.userName = order.contactUser || ''
    rs.totalAmount = order.totalAmount || 0
    rs.uniqueCode = order.uniqueCode

    return rs
}
// 监听支付状态
function _listen(financeId) {
    timer = setInterval(function () {
        var urls = '/order/checkstand/pollCheckstandStatus/' + financeId + "?temp=" + new Date().valueOf();
        $.get(urls).done(function (rs) {
            if (rs.status == 200) {
                // 0：待支付，1：支付成功，2：已关闭，3：支付失败
                var status = rs.payStatus;
                switch (status) {
                    case '1':
                        vm_common_pay.succ = true
                        vm_common_pay.payMode = PAY_MODE[rs.payMode] || '其他'
                        scanPaySuccCb(financeId);// 回调显示
                        break;
                    case '2':
                    case undefined:
                        vm_common_pay.closed = true;
                        break;
                    case '3':
                        vm_common_pay.failed = true;
                        break;
                    default:
                }
                if (status !== '0') {
                    vm_common_pay.done = true;
                    clearInterval(timer);
                    return;
                }
            }
        });
    }, 5000);
}

// 获取二维码
function _getQRcode(info) {
    var descption = ''
    info.rooms.forEach(function (el) {
        descption += '<div>' + el.typeName + '(' + el.roomNo + '),' + el.checkIn.substr(5) + '入住，住' + el.days + '晚;</div>';
    });
    var datas = {
        payUser : info.userName || '',
        contact : info.contact || '',
        item : info.financeName || '',
        orderId : info.financeId,
        orderPrice : info.totalAmount,
        payPrice : info.money,
        desc : descption
    }
    vm_common_pay.QRcode = '';
    $.post('/order/checkstand/scanToPay', datas).done(function (rs) {
        if (rs.status == 200) {
            vm_common_pay.QRcode = 'http://' + PMS_DOMAIN_NAME + '/files/' + rs.qrCodePath;
        } else {
            tmsky.ui.dialog.tips('加载二维码失败！', 'error');
        }
    });
}