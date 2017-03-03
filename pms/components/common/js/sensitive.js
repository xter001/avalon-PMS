/**
 * Created by X on 2016/3/4.
 */

module.exports = {
    _SENSI: {
        '【': ['【'],
        '】': ['】'],
        '别': ['别墅'],
        '装': ['装修'],
        '地': ['地产'],
        '房': ['房产']
    },
    init : function () {

    },
    filter : function (msg) {
        var tip = ''
        for (var i = 0; i < msg.length; i++){
            var key = msg.charAt(i)
            if(this._SENSI[key]){
                tip += this.isSensitive(msg, this._SENSI[key])
            }
        }
        return tip
    },
    isSensitive : function (msg, list){
        var word = ''
        for(var i = 0; i < list.length; i++){
            if(msg.indexOf(list[i]) != -1){
                word = list[i]
                break
            }
        }
        return word
    }

}