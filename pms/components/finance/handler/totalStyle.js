/**
 * Created by dai on 2016/6/29.
 */
module.exports = {
    cssInit : function (goalDiv, liNum) {
        //设置li的宽度
        var difH = 0;
        var liW = parseInt(goalDiv.width() / liNum) - 1
        $('.table-footer li').width(liW)
        //判断是固定还是跟随
        difH = $(window).height() - goalDiv.height() - $('#header').height() - 20
        if (difH > 0) {
            $('.table-footer').removeClass('fixedBottom')
            goalDiv.find('.table').css({'margin-bottom':'0'})
        } else {
            goalDiv.find('.table').css({'margin-bottom':'50px'})
            $('.table-footer').addClass('fixedBottom')

        }
    },
}