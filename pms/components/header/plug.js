// 插件控制

var cache = {}, // 缓存结果
    datas// 数据


module.exports = {
    // 插件
    F_CASHIER: 'checkstand_func', // 快捷支付(收银台)
    F_SAOMA: 'barCode_func',  // 条码支付
    F_CARD: 'card_func',// 身份证
    F_ADDR: 'homeAddr_func', // 住址
    F_MSG: 'msg_func',// 短信
    F_SPEND: 'spend_func',// 消费
    F_ORIGIN: 'origin_func',// 客人来源
    F_ORDER_CODE: 'order_func',// 订单号
    F_PAY: 'payChannel_func',// 支付方式
    F_TUI_GRAY: 'tui_gray_func', // 退房后渠道变灰
    F_MULTI_INFO: 'peopleRegister_func',// 多人信息
    F_NOT_PAY: 'notPayAllSign_func',// 未付全款
    F_DIRTY_ROOM: 'dirtyRoom_func', // 脏房
    // REMIND_ALL: 'remindAll_func',// 提醒汇总
    F_PAYMENT: 'payMent_func', // 押金
    F_PRINT: 'print_func', // 打印
    F_HOUR_HOUSE: 'hourHouse_func', // 钟点房
    F_INNBOOK: 'accountBook_func', // 账本
    F_FOLD: 'foldRoomStatus_func',
    F_INTEGRAL: 'integral_func',
    F_UNION: 'union_func', // 会员联盟
    F_HANDOVER: 'handover_func', // 交接班,
    F_ROOMTOPERSON:'roomToPerson_func',
    F_CARD:'card_func',


    // 插件数据查询字符（后台对应）
    QF_PAY: 'PC', // 支付方式
    QF_ACCOUNT_ITEM: 'AC', // 支出收入项目
    QF_ORIGIN: 'CF', //客人来源
    QF_SPEND: 'GS', //其他消费项目
    QF_COMMISSION: 'CN', //佣金
    QF_MSG_TPL: 'MT', //短信模板
    QF_PRINT_TPL: 'PT', //打印模板
    QF_MEMBER_UNION: 'MU', //会员联盟

    init: function (data) {
        datas = [].concat(data)
        datas.forEach(function (el) {
            cache[el] = true
        })
        return cache
    },
    // 是否有对应插件
    hasFunc: function (code) {
        return code && cache[code] || false
    },
    // 是否没有对应插件
    hasNotFunc: function (code) {
        return !this.hasFunc(code);
    },
    getFuncs: function (getMapData) {
        return getMapData ? cache : datas
    }
}