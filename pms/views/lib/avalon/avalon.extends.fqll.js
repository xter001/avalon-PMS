;
(function (avl) {
    var filters = {
        toInt: function (num, opr) {
            return numFormat(num, opr)
        },
        toFixed: function (num, precision, returnNull) {
            if (!num || isNaN(num))
                return returnNull ? null : 0;
            return new Number(num).toFixed(precision || 2);
        },
        /**
         * 校验数值
         * @param str 校验值
         * @param type 校验类型【n：number型[int型及浮点型(默认)]；i：int型；f：浮点型】
         * @param filterNegative 是否拦截负数【true：拦截，只允许为正数；false：不拦截，允许为负数】
         * @param roundType 四舍五入类型，当type为i时此参数有效，同时precision参数无效。可取值【round：同Math.round；ceil：同Math.ceil；floor：同Math.floor】
         * @param precision 精度
         * @param def str为空时默认值
         */
        validNumber: function (str, type, filterNegative, roundType, precision, def, onblur) {
            var validByFilter = typeof str == 'string', ostr
            ostr = validByFilter ? null : str//作为拦截器方法调用
            str = validByFilter ? str : str.value
            if (!onblur && (!str || /^\d+\.$/.test(str))) {
                return str
            }
            type = type || 'n'
            filterNegative = isEmpty(filterNegative) ? false : ('true' != filterNegative && 'false' != filterNegative ? false : 'true' == filterNegative)
            var num
            switch (type) {
                case 'n':
                    num = Number(str)
                    break
                case 'i':
                    if (roundType) {
                        num = Math[roundType].call(this, Number(str))
                    } else {
                        num = parseInt(str)
                    }
                    break
                case 'f':
                    num = parseFloat(str)
                    break
            }
            if (!isNaN(num) && !isNull(num)) {
                if (type != 'i' && precision) {
                    num = new Number(num).toFixed(precision)
                }
                if (filterNegative && num < 0) {
                    num = null
                }
            }
            num = isNaN(num) || isNull(num) ? def || null : num
            ostr ? (ostr.value = num) : void(0)
            return num
        },
        truncate: function (str, max, truncation) {
            tmsky.log('entry method avalon.extends.fqll.js.truncate. str is: ' + str + '; length: ' + max + '; truncation: ' + truncation)
            return tmsky.string.truncate(str, max, truncation)
        }
    }

    function numFormat(num, opr) {
        if (!num) {
            return
        }
        if (!opr) {
            var n = num + ''
            return n.substring(0, n.indexOf('.'));
        }
        return Math[opr].call(this, num);
    }

    function isNull(o) {
        return null == 0 || undefined == o
    }

    function isEmpty(o) {
        return isNull(o) || o == ''
    }

    extendsAvalon(avl.filters, filters);
})(avalon);

function extendsAvalon(avl, exts) {
    if (!exts) {
        return
    }
    for (name in exts) {
        avl[name] = exts[name]
    }
}