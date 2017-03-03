/**
 * Created by yu on 2016/3/18.
 */
var Header = require('header');

var distribution = {
    init : function () {
        //查询分销资格
        $.ajax({
            type : "GET",
            url : "/distribution/getDistribution",
            success : function (rs) {
                __inline('vm/vm_distribution.vm')
                if (rs.status == 200 && rs.spStatus == 1) {
                    document.getElementById('content').innerHTML = __inline('tpl/distribution-manage.html')
                    document.title = '分销信息'
                    avalon.vmodels.vm_distribution.fxpInfo.spid = rs.spid
                    avalon.vmodels.vm_distribution.fxpInfo.state = rs.spStatus
                    avalon.vmodels.vm_distribution.createdAt = rs.createdAt.substr(0,10)
                } else if (rs.status == 400) {
                    //尚未开通
                    document.getElementById('content').innerHTML = __inline('tpl/distribution.html')
                } else {
                    tmsky.ui.dialog.tips(rs.message)
                }
                tmsky.getVm('vm_distribution').scan()
                tmsky.getVm('vm_distribution').init()
            },
            error : function () {
                tmsky.ui.dialog.tips("网络错误！")
            }
        })
    },
    launch : function () {
        Header.active('distribution').ready(function () {
            distribution.init()
        })
    }
};

module.exports = distribution