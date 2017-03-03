/**
 * Created by hai on 2016/1/14.
 */
module.exports = {
    MAIN_ORDER_PAGE_SIZE: 20,
    MIN_TIME_PREFIX: " 00:00:00",
    MAX_TIME_PREFIX: " 23:59:59",
    MAIN_ORDER_TYPE: {
        BOOK: "BOOK",
        CHECKIN: "CHECKIN",
        CHECKOUT: "CHECKOUT",
        CANCEL: "CANCEL",
        NEW_TODAY: 'NEW_TODAY',
        YAFANG: "YAFANG",
        ALL: "ALL",
        ERROR:'ERROR',
        TEXT: {
            CHECKIN: '办理入住',
            CHECKOUT: '办理退房',
            VIEW: '查看订单',
            OPERATE: '操作订单'
        }
    },
    ORDER_OPERATE: {
        OPR: 'operate',
        VIEW: 'view',
        FROM: -6
    },
    ORDER_CONFIG: {
        SYNC: {
            SEARCH_TYPE: true
        },
        FLAG: {
            // 查询订单可选时间段
            ORDER_QUERY_AVAILABLE_DAYS: 31
        },
        FIELDS: {
            SEARCH_TYPE: {
                CHECK_IN_AT: 'CHECK_IN_AT',
                CREATED_AT: 'CREATED_AT'
            },
            DATA_RESPONSE_TYPE: 'API'
        }
    },
    URLS: {
        QUERY: '/inn/orders/query',
        STAT: '/inn/orders/stat'
    }
}
