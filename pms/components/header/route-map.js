var PLACEHOLDER = '<%currentInn%>'

module.exports = {
    HOUSE_STATUS : {
        'href' : '/public/views/1/index.html',
        'text' : '房态',
        'permissionLevel': 1
    },
    ORDER : {
        'href' : '/public/views/1/order.html',
        'text' : '订单',
        'permissionLevel': 1
    },
    REPORT : {
        'href' : '/inns/reports/index',
        'text' : '报表',
        'permissionLevel': 2
    },
    //INNBOOK : {
    //    'href' : '/innBook?switchroom=1',
    //    'text' : '账本'
    //},
    FINANCE : {
        'href' : '/public/views/1/finance.html',
        'text' : '财务',
        'class' : 'activity',
        'permissionLevel': 2
    },
    ACTIVITY : {
        'href' : '/public/views/1/activity.html',
        'text' : '活动',
        'permissionLevel': 2
    },
    FUNCTIONS : {
        'href' : '/public/views/1/functions-plug.html',
        'text' : '功能库',
        'class' : 'functions',
        'permissionLevel': 1
    },
    DISTRIBUTION : {
        'href' : '/public/views/1/distribution.html',
        'text' : '分销管理'
    },
    ROOM_SELL : {
        href : '/public/views/1/room-sell.html',
        text : '卖房管理',
        'permissionLevel': 1
    },
    MESSAGE_MANAGE : {
        href : '/public/views/1/message-manage.html',
        text : '消息管理',
        'permissionLevel': 1
    },
    BASEINFO : {
        'href' : '/refactor/baseInfo',
        'text' : '客栈信息',
        'permissionLevel': 1
    },
    ROOMS : {
        'href' : '/public/views/1/inn-manage/room-manage.html',
        'text' : '房间管理',
        'permissionLevel': 1
    },
    ACCESS : {
        'href' : '/authority',
        'text' : '账号管理',
        'permissionLevel': 2
    },
    PLUG : {
        'href' : '/public/views/1/functions-plug.html',
        'text' : '功能库',
        'permissionLevel': 1
    },
    CUSTOMERS : {
        'href' : '/public/views/1/inn-manage/customers.html',
        //'href' : '/inns/customers/index',
        'text' : '客户资料',
        'permissionLevel': 2
    },
    LOG : {
        'href' : '/inns/log',
        'text' : '操作记录',
        'permissionLevel': 2
    },
    OMS : {
        'href' : '/oms/index?innId=' + PLACEHOLDER + '&t=' + new Date().valueOf(),
        'text' : '分销管理',
        'target' : '_blank',
        'permissionLevel': 1
    },
    UPDATE_LOG : {
        'href' : '/updHistory',
        'text' : '更新记录',
        'permissionLevel': 1
    },
    INTEGRAL : {
        'href' : '/public/views/1/integral.html',
        'text' : '积分商城',
        'permissionLevel': 1
    },

    replaceHolder : function (val) {
        var arr = [this.REPORT, this.PLUG, this.CUSTOMERS, this.OMS]
        arr.forEach(function (el) {
            el.href = el.href.replace(PLACEHOLDER, val)
        })
    }
}