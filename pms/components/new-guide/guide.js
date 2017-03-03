/**
 * Created by yu on 2017/1/6.
 */
var NewGuide = {
    init : function () {

        //判断缓存中当前客栈id，若切换了账号导致主客栈变换，则清楚引导缓存
        if (window.localStorage) {
            var param = window.localStorage.getItem('innId');
            if (param) {
                //存在当前客栈Id
                var nowInnId = CommonCacheUtil.innBaseInfo.user.innId
                if (nowInnId != param) {
                    window.localStorage.removeItem('guide_new_user')
                    window.localStorage.removeItem('GUIDE_NEW_USER_FINISHED')
                    window.localStorage.removeItem('room_localStorage')
                    window.localStorage.removeItem('channelStep')
                    window.localStorage.removeItem('new_guide_done_id')
                }
                window.localStorage.setItem('innId', CommonCacheUtil.innBaseInfo.user.innId)
            } else {
                window.localStorage.setItem('innId', CommonCacheUtil.innBaseInfo.user.innId)
            }
        }
        __inline('vm/vm_new_guide.vm')
        tmsky.getVm('vm_new_guide').init()
    }
}

module.exports = NewGuide