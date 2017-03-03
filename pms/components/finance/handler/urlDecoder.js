module.exports = {
    init : function () {
        var searchStr = location.search;
        if (searchStr.length > 0)
            searchStr = searchStr.substring(1)

        return searchStr
    },
    paramStr : function () {
        return this.init();

    },
    decodeToJson : function () {
        var searchStr = this.init()
        var obj = {}

        if (searchStr.length > 0) {
            var arr = searchStr.split('&')
            for (var i = 0; i < arr.length; i++) {
                var objArray = arr[i].split('=')
                var key = objArray[0]
                if (key != '') obj[key] = objArray[1]
            }
        }

        return obj
    }
}
