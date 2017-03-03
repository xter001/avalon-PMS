template.helper('dateFormat', function (date, format) {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    var map = {
        "M" : date.getMonth() + 1, //月份
        "d" : date.getDate(), //日
        "h" : date.getHours(), //小时
        "m" : date.getMinutes(), //分
        "s" : date.getSeconds(), //秒
        "q" : Math.floor((date.getMonth() + 3) / 3), //季度
        "S" : date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
});
/**
 * 对长字符串进行截短
 * @param  {[type]} max
 * @param  {[type]} truncation 默认 ...
 * @return {[type]}
 */
template.helper('truncate', function (str, max, truncation) {
    var rs = str || '';
    truncation = truncation || '...';
    if (rs.length > max) {
        rs = rs.substr(0, max) + truncation;
    }
    return rs;
});

/**
 * 转化为小写
 * @return {[type]}
 */
template.helper('lowercase', function (str) {
    str = str || '';
    return str.toLowerCase();
});

template.helper('uppercase', function (str) {
    return str ? str.toUpperCase() : ''
});