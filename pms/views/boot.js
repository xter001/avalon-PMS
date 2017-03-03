if (avalon) {
    avalon.config({
        loader : false,
        debug : false
    })
}

require.config(__FRAMEWORK_CONFIG__)

var BootLaunchUtil = {
    __STAT__ : {
        BAIDU : {
            FANQIELE : 'https://hm.baidu.com/hm.js?0973f65b53ae7e57f9418dfcd41357a8'
        }
    },
    bootHouse : function () {
        this.backspaceKeydown()
        require.async(['house', 'validator'], function (house) {
            house()
        })
    },
    bootOrder : function () {
        require.async(['order', 'validator'], function (order) {
            order.launch()
        })
    },
    bootFinance : function () {
        require.async(['finance'], function (finance) {
            finance.launch()
        })
    },
    bootReport : function () {
        require.async(['report'], function (report) {
            report.launch()
        })
    },
    /*    bootRoomSell : function () {
     require.async(['room-sell'], function (roomSell) {
     roomSell.launch()
     })
     },*/
    bootRoomSell : function () {
        require.async(['room-sell-iframe'], function (roomSell) {
            roomSell.launch()
        })
    },
    bootMessageManage : function () {
        require.async(['message-manage'], function (messageManage) {
            messageManage.launch()
        })
    },
    bootInnManage : function () {
        InnManageBootLaunchUtil.boot()
    },
    bootActivity : function () {
        require.async(['activity'], function (activity) {
            activity.launch()
        })
    },
    bootFunctions : function () {
        require.async(['function-plug'], function (Functions) {
            Functions.launch()
        })
    },
    bootDistribution : function () {
        require.async(['distribution'], function (distribution) {
            distribution.launch()
        })
    },
    bootIntegral : function () {
        require.async(['integral'], function (integral) {
            integral.launch()
        })
    },
    bootCustomers : function () {
        require.async(['customers'], function (customers) {
            customers.launch()
        })
    },


    boot : function () {
        this.addStatistic(this.__STAT__.BAIDU.FANQIELE)
        var boot = $('#tomasky-boot-flag').val()
        if (boot) {
            this['boot' + boot]()
        }
    },
    addStatistic : function (src) {
        if (src) {
            (function () {
                var hm = document.createElement("script");
                hm.src = src;
                var s = document.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
            })();
        }
    },
    backspaceKeydown : function () {
        // 屏蔽浏览器backspace 键回退 点击 space 默认点击上一个按钮
        document.onkeydown = function (event) {
            event = event ? event : window.event
            var code = event.keyCode || event.which,
                tag = event.srcElement.tagName.toUpperCase()

            if ((code == 8 || code == 32 || code == 13) && tag != "INPUT" && tag != "TEXTAREA" && tag != "TEXT") {
                event.returnValue = false
                return false
            }
        }
    }
}

BootLaunchUtil.boot()
