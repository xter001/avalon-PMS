/**
 * 系统公用常量
 * Created by hai on 2016/1/14.
 */
//各环境，各系统域名
var _DOMAIN_CONST_ = {
        LOCAL : {
            ZSW : 'http://192.168.1.195:8080',
            PMS : 'http://localhost:9000',
            OMS : 'http://oms.local.fanqiele.com',
            FQXZ : 'http://xzms.local.fanqielaile.com',
            CRM : 'http://crm.local.afanqie.com',
            FTP_IMG : 'http://img.local.fanqiele.com',
            FQMS : 'http://fqms.local.afanqie.com',
            SSO : 'http://passport.local.fanqiele.com/login?service=http%3A%2F%2F127.0.0.1%3A9000%2Findex',
            FQFX : 'http://d.local.fanqielaile.com',
            ROOM_SELL : 'http://localhost:5000',
            DIS : 'http://dis.local.fanqiele.com',
            RP : 'http://rp.local.fanqiele.com',
            PSB: 'http://localhost:13579'
        },
        INNER_TEST : {
            PMS : 'http://pms.local.fanqiele.com',
            OMS : 'http://oms.local.fanqiele.com',
            FQXZ : 'http://xzms.local.fanqielaile.com',
            CRM : 'http://crm.local.afanqie.com',
            FTP_IMG : 'http://img.local.fanqiele.com',
            FQMS : 'http://fqms.local.afanqie.com',
            SSO : 'http://passport.test.fanqiele.com/login?service=http%3A%2F%2Fpms.local.fanqielaile.com%2Findex',
            FQFX : 'http://d.local.fanqielaile.com',
            ROOM_SELL : 'http://pms.local.fanqiele.com/roomsell',
            MSGPAY : 'http://pay.local.fanqiele.com',
            DIS : 'http://dis.local.fanqiele.com',
            RP : 'http://rp.local.fanqiele.com',
            PSB: 'http://localhost:13579'
        },
        ONLINE_TEST : {
            PMS : 'http://pms.test.fanqiele.com',
            OMS : 'http://openapi.test.fanqielaile.com',
            FQXZ : 'http://xzms.test.fanqielaile.com',
            CRM : 'http://crm.test.afanqie.com',
            FTP_IMG : 'http://img.test.fanqiele.com',
            FQMS : 'http://fqms.test.afanqie.com',
            SSO : 'http://passport.test.fanqiele.com/login?service=http%3A%2F%2Fpms.test.fanqielaile.com%2Findex',
            FQFX : 'http://d.test.fanqielaile.com',
            ROOM_SELL : 'http://pms.test.fanqiele.com/roomsell',
            MSGPAY : 'http://wxpay.afanqie.com',
            DIS : 'http://dis.test.fanqiele.com',
            RP : 'http://rp.test.fanqiele.com',
            PSB: 'http://localhost:13579'
        },
        ONLINE : {
            PMS : 'http://www.fanqiele.com',
            OMS : 'http://oms.fanqiele.com',
            FQXZ : 'http://xzms.fanqiele.com',
            CRM : 'http://crm.afanqie.com',
            FTP_IMG : 'http://img.fanqiele.com',
            FQMS : 'http://www.afanqie.com',
            SSO : 'http://passport.fanqiele.com/login?service=http%3A%2F%2Fwww.fanqiele.com%2Findex',
            FQFX : 'http://d.fanqielaile.com',
            ROOM_SELL : 'http://www.fanqiele.com/roomsell',
            MSGPAY : 'http://www.fanqielaile.com',
            DIS : 'http://dis.fanqiele.com',
            RP : 'http://rp.fanqiele.com',
            PSB: 'http://localhost:13579'
        }
    },

//当前所用环境域名，开发用非_DOMAIN_CONST_.ONLINE，生成环境用_DOMAIN_CONST_.ONLINE
    DOMAIN = _DOMAIN_CONST_.LOCAL

//系统接口调用白名单
var _AUTH_WHITE_URI_ = {
    PMS : {},
    OMS : {}
}

module.exports = {
    DOMAIN: DOMAIN,

    // 房态页天数量
    VIEW_DAYS : 40,
    VIEW_PRE_DAYS : -3, // 初始今天前的几天
    MAX_SELECT_DAYS : 100,
    DOMAIN : DOMAIN,
    AUTH_WHITE_URI : _AUTH_WHITE_URI_,

    // 主订单状态（-2：删除, -1：哑房, 0：取消，1：预定/未入住，2：部分入住，3：入住/未退房，4：部分退房，5：已退房)
    M_NONE : null,
    M_DELETE : -2,
    M_NULL : -1,
    M_CANCLE : 0,
    M_BOOK : 1,
    M_PART_IN : 2,
    M_IN : 3,
    M_PART_OUT : 4,
    M_OUT : 5,
    STATUS_MAP : {
        1 : '预定',
        2 : '部分入住',
        3 : '入住',
        4 : '部分退房',
        5 : '已退房'
    },

    // 子订单状态(2:预定; 3:入住; 4:退房; 5:取消)
    SUB_BOOK : 2,
    SUB_IN : 3,
    SUB_OUT : 4,
    SUB_CANCLE : 5,

    // orderAction 后台对应
    ACT_BOOK : 2, // 新增预定
    ACT_BOOK_UPDATE : 22, // 预定更新
    ACT_PART_IN : 23, // 预定转入住[含部分入住]
    ACT_IN : 3, // 新增入住
    ACT_IN_UPDATE : 33, // 入住更新
    ACT_PART_OUT : 34, // 部分退房
    ACT_OUT : 4, // 全部退房
    ACT_OUT_UPDATE : 44, // 退房修改
    ACT_BOOK_CANCLE : 5, // 未到/取消

    // 控制器状态
    G_NORMAL : 10,
    G_ROOMS : 20,
    G_BOOK : 30,
    G_BOOKING : 31,
    G_BOOK_CANCLEING : 32,
    G_RATEPLAN_CANCLEING : 33,
    G_PART_IN : 40,
    G_PART_INING : 41,
    G_PART_IN_UPDATE : 42,
    G_IN : 43,
    G_INING : 44,
    G_PART_OUT : 50,
    G_PART_OUTING : 51, // 修改部分退房
    G_OUT : 52,
    G_OUTING : 53,
    G_OUT_UPDATE : 54,
    G_OUT_REVOKE : 55,
    G_RATEPLAN_OUTING : 56,
    G_RATEPLAN_UPDATE : 57,
    // G_OUT_BEFOREING : 56,
    // G_OUT_BEFORE : 57,
    // G_OUT_BEFORE_UPDATE : 58,

    CHECK_OUT_STATUS : {
        NORMAL : 1,
        BEFOREHAND : 2,
        TOTALLY_BEFOREHAND : 3,
        isBCOStatus : function (status) {
            return status == this.BEFOREHAND || status == this.TOTALLY_BEFOREHAND;
        }
    },

    //订单操作来源(-1：WEB（房态）、-2：PAD、-3：ANDROID、-4：CLIENT、-5：IPHONE、-6：WEB（订单）)
    ORDER_FROM : {
        WEB_ROOM_STATUS : -1,
        PAD : -2,
        ANDROID : -3,
        CLIENT : -4,
        IPHONE : -5,
        WEB_ORDER_MODULE : -6,
        DXPT : [102, 105, 903, 905, 906, 916, 113],
        OTA : [107, 108, 3]
    },

    //客人来源ID
    CUSTOMER_FROM_ID : {
        FQXZ : 1,
        DXPT : 2,
        QITA : 4,
        QUNAR : 5,
        XC : 6,
        YL : 7,
        XYZ : 8
    },

    BTN_ENUM : {
        def : {
            text : ''
        },
        book_save : {
            success : true,
            text : '确认预订',
            fn : 'book_save'
        },
        book_cancle : {
            danger : true,
            text : '确认取消',
            fn : 'book_cancle'
        },
        book_cancle_act : {
            text : '取消订单',
            fn : 'book_cancle_act'
        },
        book_noshow_act : {
            text : '未到NoShow',
            fn : 'book_cancle_act'
        },
        rateplan_cancle_act : {
            text : '发起取消',
            fn : 'rateplan_cancle_act'
        },
        part_in_act : {
            danger : true,
            text : '办理入住',
            fn : 'part_in_act'
        },
        in_act : {
            danger : true,
            text : '办理入住',
            fn : 'in_act'
        },
        in_save : {
            danger : true,
            text : '确认入住',
            fn : 'in_save'
        },
        bulu_in_save : {
            danger : true,
            text : '补录订单',
            fn : 'in_save'
        },
        bulu_out_save : {
            danger : true,
            text : '补录订单',
            fn : 'out_save'
        },
        out_act : {
            danger : true,
            text : '办理退房',
            fn : 'out_act'
        },
        rateplan_out_comfirm_act : {
            danger : true,
            text : '确认退房',
            fn : 'rateplan_out_comfirm_act'
        },
        out_save : {
            danger : true,
            text : '确认退房',
            fn : 'out_save'
        },
        b_out_act : {
            danger : false,
            text : '提前退房',
            fn : 'b_out_act'
        },
        b_out_save : {
            danger : true,
            text : '确认退房',
            fn : 'b_out_save'
        },
        out_revoke : {
            danger : true,
            text : '撤销退房',
            fn : 'out_revoke'
        },
        rateplan_edit_act : {
            danger : true,
            text : '修改信用住财务',
            fn : 'rateplan_edit_act'
        },
        rate_plan_update : {
            fn : 'rate_plan_update'
        },
        back : {
            text : '返回',
            fn : 'back'
        },
        cancle : {
            text : '取消',
            fn : 'cancle'
        },
        edit : {
            text : '修改订单',
            fn : 'edit'
        },
        msg_act : {
            text : '短信',
            fn : 'msg_act'
        },
        print_act : {
            text : '打印订单',
            fn : 'print_act'
        },
        finance_act : {
            text : '财务记录',
            fn : 'finance_act'
        }
    },
    // 房态样式 // 1[默认房态坐标]，2[xy的房态], 4[excel房态] 4[怀旧房态]）
    STYLE_DEFAULT : 1,
    STYLE_XY : 2,
    STYLE_EXCEL : 4,
    STYLE_OLD : 5,

    KUAIJIE_PAY : 1,
    SAOMA_PAY : 6,

    //XZ_DOMAIN: "http://xzms.fanqiele.com",
    //OMS_DOMAIN: 'http://oms.fanqiele.com',
    //FQLL_DOMAIN: 'http://www.fanqiele.com',
    //PASSPORT_DOMAIN: 'http://passport.fanqiele.com/login?service=http%3A%2F%2Fwww.fanqiele.com%2Findex',

    // 主订单状态（-1: 哑房，0：取消，1：未入住(预定)，2：部分入住，3：未退房（入住），4：部分退房，5：已退房) // 以下为新增业务状态（6：违约，7：存款，8：挂账）
    MAIN_ORDER_STATUS : {
        NULL : -1,
        CANCEL : 0,
        NO_CHECKIN : 1,
        PART_CHECKIN : 2,
        NO_CHECKOUT : 3,
        PART_CHECKOUT : 4,
        ALL_CHECKOUT : 5,
        ALL_PENALTY : 6,
        ALL_DEPOSIT : 7,
        ALL_DEBT : 8,
        ALL : 10
    },
    CARD_TYPE : {1 : '身份证', 2 : '军官证', 3 : '通行证', 4 : '护照', 5 : '其它'},
    CARD_TYPE_VALUE : {ID : 1, OFFICER : 2, TRAFFIC : 3, PASSPORT : 4, OTHER : 5},
    NATIONS : [
        '汉族', '壮族', '满族', '回族', '苗族', '维吾尔族', '土家族', '彝族', '蒙古族', '藏族', '布依族',
        '侗族', '瑶族', '朝鲜族', '白族', '哈尼族', '哈萨克族', '黎族', '傣族', '畲族', '傈僳族', '仡佬族', '东乡族',
        '高山族', '拉祜族', '水族', '佤族', '纳西族', '羌族', '土族', '仫佬族', '锡伯族', '柯尔克孜族', '达斡尔族', '景颇族',
        '毛南族', '撒拉族', '塔吉克族', '阿昌族', '普米族', '鄂温克族', '怒族', '京族', '基诺族', '德昂族', '保安族',
        '俄罗斯族', '裕固族', '乌兹别克族', '门巴族', '鄂伦春族', '独龙族', '塔塔尔族', '赫哲族', '珞巴族', '布朗族'
    ],
    FINANCE_ITEMS : {
        1 : {name : '收取订金', value : 1},
        2 : {name : '收取房费', value : 1},
        3 : {name : '收取押金', value : 1},
        4 : {name : '退还订金', value : -1},
        5 : {name : '退还房费', value : -1},
        6 : {name : '退还押金', value : -1},
        9 : {name : '商品收入', value : 1},
        10 : {name : '商品支出', value : -1},
        11 : {name : '抵扣积分', value : 1, isHide : true}
    },
    FINANCE_ITEMS_ID : {
        ZFDJ : 1,  //收取订金
        ZFFF : 2,  //收取房费
        ZFYJ : 3,  //收取押金
        THDJ : 4,  //退还订金
        THFF : 5,  //退还房费
        THYJ : 6,  //退还押金
        QTSR : 9,  //商品收入
        QTZC : 10, //商品支出
        DKJF : 11  //抵扣积分
    },
    ORDER_FLAG : {
        0 : {value : 0, name : '订单标示'},
        1 : {value : 1, name : '接机'},
        2 : {value : 2, name : '用车'},
        3 : {value : 3, name : '重要订单'},
        4 : {value : 4, name : '信用住订单'},
        7 : {value : 7, name : '担保订单'}
    },

    UPLOADINGIMGMAXSIZE:2*1024*1024, //限制上传图片最大2M，目前只针对批量上传做全局控制，单位为B

    INN_ACCOUNT_STATUS: {
        NEW_VERSION: 1,
        UNDER_REVIEW: 2,
        FULL_VERSION: 3
    },

    // 对接PSB ------ begin
    // 上传旅客入住信息给PSB时的调用类型
    UPLOAD_TO_PSB_GESTTYPE: {
        // 入住：1, 修改信息：2, 换房：3, 退房：4
        CHECKIN: 1,
        MODIFY_INFO: 2,
        CHANGE_ROOM: 3,
        CHECKOUT: 4
    }
    // 对接PSB ------ end


}
