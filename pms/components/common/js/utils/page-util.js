/**
 * Created by hai on 2016/1/14.
 */

var PageUtil = {
    //过滤模式
    FILTER_MODE : {
        // filter mode const
        EQ : "==",
        GT : ">",
        GE : ">=",
        LT : "<",
        LE : "<=",
        NE : "!=",
        LIKE : "LIKE",
        NULL : "IS NULL",
        NOT_NULL : "IS NOTNULL",
        STARS_WITH : "STARTS",
        ENDS_WITH : "ENDS"
    },
    /**
     * 获取过滤参数
     * @param options
     * options={
     *      selector:'#id'|'.class'|...,
     *      value:'searchvalue',
     *      fields:[
     *          {
     *              key:'过滤字段',
     *              mode:'过滤模式'//参考上 FILTER_MODE、默认'LIKE'
     *          },
     *          ...
     *      ]
     * }
     * 当value和selector都在时优先取value
     *
     * @params 附加参数
     *      当params为空时返回过滤参数，params不为空时将过滤参数附加到params中，params必须为对象类型
     * @returns {*}
     */
    getSearchParams : function (options, params) {
        if (options && tmsky.isEmptyObject(options)) {
            return params || null
        }
        var searchValue = options.value || (options.selector && $(options.selector).val())
        if (searchValue) {
            params = params || {}
            options.fields && options.fields.length && options.fields.forEach(function (item, index) {
                params['filters[0].or[' + index + '].key'] = item.key;
                params['filters[0].or[' + index + '].value'] = searchValue;
                params['filters[0].or[' + index + '].model'] = item.mode || PageUtil.FILTER_MODE.LIKE;
            })
            return params
        }
        return params || null
    }
}
module.exports = PageUtil