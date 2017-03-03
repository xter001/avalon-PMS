var user = require('../user.js')

module.exports = {
    /**
     * bind events after header loaded
     */
    addApplyEvent : function () {

        $(".J_permission-level-2-apply").on("click", function (e) {
            // 是否审核中
            // if (user.getCurrentInn().applyAt) {
            var level = $("#applyLevel").text()
            if ( level === "审核中") {
                $("#after_apply_popups").popups()
            } else if(level === "新手版") {
                $("#before_apply_popups").popups()
                // 模拟点击 header 中的版本区域，弹出申请框
                $(".J_go-upgrade").on("click", function (e) {
                    tmsky.getVm("vm_apply").applyPopup()
                    $("#applyLevel").click()
                })
            }
        })
    },
    /**
     * bind events ApplySuccess
     */
    addApplySuccessEvent : function () {
        $("#go-to-functions-plug").on("click", function (e) {
            window.location.href = "/public/views/1/functions-plug.html"
            if (localStorage) {
                localStorage.removeItem("inn_account_status")
            }
        })
    }
}