// 权限控制

var cache = {},// 缓存结果
    all = [],
    auth = {
        map : {},
        list : []
    },
    special = {
        map : {},
        list : []
    },
    datas  // 数据


module.exports = {
    // 权限列表
    AC_ROOM_STATUS : 'room_status_view',         // 房态查看
    AC_BOOK : 'room_book',                       //办理修改/预订
    AC_BOOK_CANCEL : 'room_book_cancel',         //未到/取消
    AC_CHECK_IN : 'room_check_in',               //办理/修改入住
    AC_CHECK_IN_CANCEL : 'room_check_in_cancel', //取消入住
    AC_CHECK_OUT_EDIT : 'room_check_out_modify', //修改退房
    AC_CHECK_OUT : 'room_check_out',             //办理退房
    AC_CANCEL_EDIT : 'order_modify_had_cancel',  //修改已取消订单

    AC_REPORTVIEW : 'report_view',
    AC_INNBOOK : 'account_book_check',
    AC_ROOM_MGR : 'room_management',
    AC_ACCESS_MGR : 'emploee_management',
    AC_PLUG_MGR : 'plug_management',
    AC_GUEST : 'customer_data',
    AC_LOG : 'log_view',
    AC_DR_MGR : 'dr_management',
    AC_ACC_OUT : 'account_book_out',
    AC_ACC_IN : 'account_book_in',
    AC_ACC_EDIT : 'account_book_remove_change',
    AC_ACC_VIEW : 'account_book_check',

    AC_DEL_ORDER : 'del_order',
    AC_EDITE_FINANCE : 'finance_modify',

    //special auths
    AC_ACCOUNT_BOOK_BATCH_ADD : 'account_book_batch_add',//账本批量添加
    AC_CHECK_IN_TIP : 'check_in_tip',//入住提醒


    init : function (normalAuth, specialAuth) {
        //auths
        datas = (normalAuth + '').split(",")
        datas.forEach(function (el) {
            if (el) {
                auth.map[el] = true
                auth.list.push[el]
                all.push[el]
                cache[el] = true
            }
        })

        //specialAuths
        datas = (specialAuth + '').split(',')
        datas.forEach(function (el) {
            if (el) {
                special.map[el] = true
                special.list.push[el]
                all.push[el]
                cache[el] = true
            }
        })

        return cache
    },
    // 是否有对应插件
    access : function (code) {
        return code && cache[code]
    },
    // 是否没有对应插件
    notAccess : function (code) {
        return !this.access(code);
    },
    getSpecialAuth : function (getMapData) {
        return getMapData ? special.map : special.list
    },
    getAuth : function (getMapData) {
        return getMapData ? auth.map : auth.list
    },
    getAllAuth : function (getMapData) {
        return getMapData ? cache : all
    }
}