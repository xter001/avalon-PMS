/**
 * jQuery ajax upload util
 * 注：目前此工具类的默认设置是结合oms提供的图片上传接口而开发
 * Created by hai on 2016/3/18.
 */
var COMMON_CONST = require('../const.js'),
    _unit_ = 1024 * 1024,//MB
    _extensions_ = 'jpg,jpeg,png',
    MESSAGE_TIME_INTERVAL = 3500

function AjaxFileUploadUtil(options) {

    //ajax upload fields
    this.domain = COMMON_CONST.DOMAIN.OMS
    this.url = this.domain + '/web/uploadImg'
    this.name = 'imgFile'
    this.autoSubmit = true
    this.dataType = 'json'
    this.aspectRatio = 160 / 100 //宽高比
    this.selection = [0, 0, 256, 160]//选中区域设置
    this.jcropWidth = 450
    this.jcropHeight = 300
    this.imgScaleMode = 'fixed'//图片展示模式（fixed：固定尺寸；scale：缩放比例）

    //business fields
    this.resourceTempDomain = COMMON_CONST.DOMAIN.OMS
    //this.resourceDomain = COMMON_CONST.DOMAIN.FTP_IMG
    this.deleteTempPictureUrl = this.domain + '/web/deleteTempImg'

    // callbacks
    this.beforeSend = null
    this.success = null
    this.uploaded = null
    this.imgSorted = null
    this.imgSortCanceled = null
    this.imgSetCovered = null
    this.imgDeleted = null

    //img selectors
    this.imgEditorPopups = '#imgEditorPopups'
    this.imgListSelector = '#imgListSelector'
    this.imgSortSelector = '.change-img-order'
    this.imgSortSaveSelector = '.save-img-order'
    this.imgSortCancelSelector = '.cancel-img-order'
    this.imgSetCoverSelector = '.set-img-cover'
    this.imgDeleteSelector = '.img-delete'

    //jcrop selectors
    this.uploadSelector = '.uploadImgSelector'
    this.jcropPopupSelector = '#cutImgPopupSelector'
    this.jcropFormSelector = '#cutImgFormSelector'
    this.jcropImgSelector = '#cutImgSelector'
    this.saveCutPicSelector = '#saveCutImgSelector'
    this.saveCutPicErrorSelector = '#saveCutPicErrorSelector'

    //restrict
    this.extensions = _extensions_
    this.minSize = null
    this.maxSize = 2

    var _max_size_ = 5

    if (options && !tmsky.isEmptyObject(options)) {
        for (name in options) {
            this[name] = options[name]
        }
    }

    if (this.minSize) {
        this.minSize *= this.unit
        this.minSize = this.maxSize <= 0 ? null : this.minSize >= this.maxSize ? null : this.minSize
    }
    this.maxSize = this.maxSize > _max_size_ ? _max_size_ : this.maxSize
    this.init()

    return this
}

AjaxFileUploadUtil.bind = function (options) {
    return new AjaxFileUploadUtil(options)
}

AjaxFileUploadUtil.prototype.isFixedImgScale = function () {
    return 'fixed' == this.imgScaleMode
}

AjaxFileUploadUtil.prototype.isValidImg = function (extension, size) {
    return AjaxFileUploadUtil.isValidImg(extension, this.extensions, size, this.maxSize, this.minSize)
}

AjaxFileUploadUtil.isValidImg = function (extension, pattern, size, max, min) {
    var validExtension = true,
        validMin = true,
        validMax = true,
        extension = extension && extension.toLowerCase(),
        max = max || 2 //unit MB
    if (pattern) {
        validExtension = pattern.indexOf(extension) != -1
    } else {
        pattern = _extensions_
        validExtension = /(jpg)|(jpeg)|(png)/i.test(extension)
    }
    if (!validExtension) {
        tmsky.ui.dialog.errorTips('请上传' + pattern.replace(',', '、') + '格式图片！', MESSAGE_TIME_INTERVAL)
        return false
    }
    if (min) {
        validMin = (size / _unit_) >= min
    }
    if (!validMin) {
        tmsky.ui.dialog.errorTips('图片过小，请选择大于' + min + 'M的图片上传！', MESSAGE_TIME_INTERVAL)
        return false
    }
    validMax = size <= max * _unit_
    if (!validMax) {
        tmsky.ui.dialog.errorTips('图片过大，请选择小于' + max + 'M的图片上传！', MESSAGE_TIME_INTERVAL)
        return false
    }
    return true
}

//初始化
AjaxFileUploadUtil.prototype.init = function () {
    var upload = this
    var uploadConfig = {
        url : upload.url + tmsky.util.generateUrlEndStr(),
        type : 'POST',
        name : upload.name,
        autoSubmit : upload.autoSubmit,
        dataType : upload.dataType,

        beforeSend : function (el, info) {
            tmsky.log('jQuery Ajax Upload beforeSend..')
            var file = (info && info.files && info.files.length && info.files[0]) || {},
                fileName = file.name,
                extension = fileName && fileName.substring(fileName.indexOf('.') + 1),
                size = file.size
            if (upload.isValidImg(extension, size)) {
                if (upload.beforeSend && tmsky.isFunction(upload.beforeSend)) upload.beforeSend(file, size, extension)
            } else {
                return false
            }
        },

        onprogress : function (e) {
            tmsky.ui.dialog.loading('图片上传中...')
            tmsky.log('jQuery Ajax Upload progress');
        },

        success : function (response) {
            tmsky.log('jQuery Ajax Upload success..')
            var data = response || {};
            if (data.status != 200) {
                tmsky.ui.dialog.errorTips(data.message || '图片上传出错')
                return false
            }

            var $form = $(upload.jcropFormSelector);
            $form.find('input[name="imgName"]').val(data.imgName);
            upload.imgPreView(data)
        },

        onload : function (e) {
            tmsky.log('jQuery Ajax Upload onload..');
        },

        error : function () {
            tmsky.log('jQuery Ajax Upload error..')
            tmsky.ui.dialog.loading.close()
            tmsky.ui.dialog.errorTips('图片上传出错')
        }
    }

    $(this.uploadSelector).ajaxUploadPrompt(uploadConfig)

    this.bindEvent()

}

/**
 * 上传临时图片、生产预览，去裁剪
 * @param data
 */
AjaxFileUploadUtil.prototype.imgPreView = function (data) {

    var img = new Image(),
        path = this.resourceTempDomain + data.imgUrl,
        $image = $(this.jcropPopupSelector).find(this.jcropImgSelector).hide(),
        upload = this

    img.src = path
    img.onload = function () {

        //延时500ms座浏览器兼容处理
        setTimeout(function () {
            $(upload.jcropPopupSelector).popups('show')
            $image.attr('src', path)
            tmsky.ui.dialog.loading.close()

            //按比例缩放
            var width = img.width,
                height = img.height,
                m = Math.max(width, height * 1.58),
                imsScale = upload.jcropWidth / m
            upload.imgScall = imsScale
            if (upload.isFixedImgScale()) {
                //按固定比例
                $image.attr('width', upload.jcropWidth).attr('height', upload.jcropHeight)
            } else {
                $image.attr('width', width).attr('height', height)
                if ('zoom' in $image[0].style) {
                    $image.css({zoom : imsScale})
                } else {
                    $image.css({
                        '-webkit-transform' : "scale(" + imsScale + ")",
                        '-moz-transform' : "scale(" + imsScale + ")",
                        '-ms-transform' : "scale(" + imsScale + ")",
                        '-o-transform' : "scale(" + imsScale + ")",
                        'transform' : "scale(" + imsScale + ")"
                    })
                }
            }
            $image.show()
            upload.jcrop(imsScale, data.imgUrl)
            //触发回调
            if (upload.success && tmsky.isFunction(upload.success)) upload.success(data)
        }, 500)

    }

    img.onerror = function () {
        tmsky.log('img.onerror...')
        tmsky.ui.dialog.loading.close()
        tmsky.ui.dialog.errorTips('图片加载出错，请重新登录')
    }

}

//绑定图片裁剪
AjaxFileUploadUtil.prototype.jcrop = function (imsScale, imgUrl) {
    if (this.jcropImgSelector) {
        var upload = this
        $(upload.jcropPopupSelector).find(this.jcropImgSelector)
            .data('imgUrl', imgUrl).closest('div')
            .Jcrop({
                aspectRatio : upload.aspectRatio,
                setSelect : upload.selection,
                onChange : function (c) {
                    //截图时按原始比例计算
                    var $jcropForm = $(upload.jcropPopupSelector).find(upload.jcropFormSelector)
                    $jcropForm.find('input[name="x"]').val(Math.round(c.x / imsScale || upload.imgScall))
                    $jcropForm.find('input[name="y"]').val(Math.round(c.y / imsScale || upload.imgScall))
                    $jcropForm.find('input[name="width"]').val(Math.round(c.w / imsScale || upload.imgScall))
                    $jcropForm.find('input[name="height"]').val(Math.round(c.h / imsScale || upload.imgScall))
                }
            })
    }
}

//事件绑定
AjaxFileUploadUtil.prototype.bindEvent = function () {
    this.bindDeleteTempPicEbent()
    this.bindImgSaveEvent()
    this.bindImgSortEvent()
    this.bindImgSetCoverEvent()
    this.bindImgDeleteEvent()
}

AjaxFileUploadUtil.prototype.bindOperateEvent = function () {
    this.bindImgSetCoverEvent()
    this.bindImgDeleteEvent()
}

//绑定删除连图片
AjaxFileUploadUtil.prototype.bindDeleteTempPicEbent = function () {
    if (this.deleteTempPictureUrl) {
        var upload = this
        $(upload.jcropPopupSelector).on('click', '.close', function () {
            var imgUrl = upload.jcropImgSelector && $(upload.jcropImgSelector).data('imgUrl') || null
            if (tmsky.isEmpty(imgUrl)) return false
            $.get(upload.deleteTempPictureUrl + tmsky.util.generateUrlEndStr() + '&imgUrl=' + imgUrl, function (rs) {
                tmsky.log('删除图片' + imgUrl + (rs && rs.status == 200 ? '成功' : '失败'))
            })
        })
    }
}

//保存上传图片
AjaxFileUploadUtil.prototype.bindImgSaveEvent = function () {
    if (this.saveCutPicSelector) {
        var upload = this
        $(this.jcropPopupSelector).find(this.saveCutPicSelector).click(function () {
            var data = tmsky.ajax.formData(upload.jcropFormSelector) || {}
            if (tmsky.isEmptyObject(data)) return false

            data.seq = $(upload.imgListSelector).find('li.img-item').length + 1
            data.time = tmsky.date.date().getTime()
            tmsky.ui.dialog.loading('图片保存中...')

            $.get(upload.domain + '/web/cutImg', data, function (rs) {

                rs = (rs && tmsky.isString(rs) ? tmsky.json.parse(rs) : rs) || {}

                if (rs && rs.status == 200) {
                    var imgItem = {
                        id : rs.imgId,
                        imgName : data.imgName,
                        imgUrl : rs.imgUrl,
                        isCover : 0,
                        type : data.type,
                        seq : data.seq,
                        omsInnId : data.omsInnId || rs.omsInnId,
                        roomTypeId : data.roomTypeId
                    }
                    upload.uploaded && tmsky.isFunction(upload.uploaded) && upload.uploaded(imgItem, rs)
                    $(upload.jcropPopupSelector).popups('hide')
                    $(upload.jcropPopupSelector).find('.close').click()
                    tmsky.ui.dialog.successTips('图片保存成功')
                } else {
                    $(upload.jcropPopupSelector).find(upload.saveCutPicErrorSelector).text('图片保存出错').slideDown().delay(MESSAGE_TIME_INTERVAL).slideUp()
                }

            }).always(tmsky.ui.dialog.loading.close)
        })
    }
}

//绑定图片排序
AjaxFileUploadUtil.prototype.bindImgSortEvent = function () {
    if (this.imgListSelector) {
        this.bindImgSortInitEvent()
        this.bindImgSortSaveEvent()
        this.bindImgSortCancelEvent()
    }
}

//开始图片排序
AjaxFileUploadUtil.prototype.bindImgSortInitEvent = function () {
    if (this.imgSortSelector) {
        var upload = this,
            $imgEditorPopups = $(this.imgEditorPopups),
            $imgList = $imgEditorPopups.find(this.imgListSelector)

        $imgEditorPopups.on('click', this.imgSortSelector, function () {
            $imgList.sortable({revert : true})
            $imgList.find('li').addClass('toChangeOrder');
            $imgList.find('.dragMask').show();
            $imgList.find('.plusImg').hide();
            $imgEditorPopups.find(upload.imgSortSelector).hide().siblings().show();
        })
    }
}

//保存图片排序
AjaxFileUploadUtil.prototype.bindImgSortSaveEvent = function () {
    if (this.imgSortSaveSelector) {
        var upload = this,
            $imgEditorPopups = $(this.imgEditorPopups),
            $imgList = $imgEditorPopups.find(this.imgListSelector)

        $imgEditorPopups.on('click', this.imgSortSaveSelector, function () {
            $imgList.find('.dragMask').hide();
            $imgList.find('.plusImg').show();
            $imgList.sortable('destroy');
            $imgEditorPopups.find(upload.imgSortSelector).show().siblings().hide();

            var imgList = [];
            $imgList.find('li.img-item').removeClass('toChangeOrder').each(function (i) {
                var seq = i + 1,
                    $this = $(this),
                    $id = $this.find('[name="id"]'),
                    $seq = $this.find('[name="seq"]').val(seq)
                imgList.push({
                    id : $id.val() || null,
                    seq : seq
                })
            });

            upload.updateAllImg(imgList, '', function (rs) {
                AjaxFileUploadUtil.fire(upload.imgSorted, imgList)
            })
        })
    }
}

AjaxFileUploadUtil.prototype.bindImgSortCancelEvent = function () {
    if (!this.imgSortCancelSelector) return false
    var upload = this,
        $imgEditorPopups = $(this.imgEditorPopups),
        $imgList = $imgEditorPopups.find(this.imgListSelector)

    $imgEditorPopups.on('click', this.imgSortCancelSelector, function () {
        $imgList.find('.dragMask').hide();
        $imgList.find('.plusImg').show();
        $imgList.sortable('destroy');
        $imgEditorPopups.find(upload.imgSortSelector).show().siblings().hide();

        //reset img-item
        //var $imgItems = $imgList.find('.toChangeOrder')
        //$imgItems.sort(function (el1, el2) {
        //    var seq1 = $(el1).find('input[name="seq"]').val(),
        //        seq2 = $(el2).find('input[name="seq"]').val()
        //    return seq1 > seq2 ? 1 : seq1 < seq2 ? -1 : 0
        //})
        //$imgList.html($imgItems)
        //upload.init()
        AjaxFileUploadUtil.fire(upload.imgSortCanceled)
    })
}

AjaxFileUploadUtil.prototype.bindImgSetCoverEvent = function () {
    if (!this.imgSetCoverSelector) {
        return
    }
    var upload = this
    $(upload.imgEditorPopups).on('click', this.imgSetCoverSelector, (function (e) {
        var imgList = [],
            $currLi = $(this).closest('li.img-item'),
            imgId = $currLi.find('input[name="id"]').val();

        if ($currLi.find('.covericon').length) return //已设置为封面

        $(upload.imgEditorPopups).find(upload.imgListSelector)
            .find('li.img-item').each(function (i) {
            var id = $(this).find('input[name="id"]').val();
            var isCover = imgId == id ? 1 : 0;
            imgList.push({id : id, isCover : isCover});
        });

        upload.updateAllImg(imgList, '设置封面失败', function (rs) {
            $currLi.find('input[name="isCover"]').val(1)
            AjaxFileUploadUtil.fire(upload.imgSetCovered, imgId)
        })
    }))
}

AjaxFileUploadUtil.prototype.updateAllImg = function (imgList, errorMessage, cb) {

    if (!(imgList && imgList.length)) return tmsky.log('图片更新参数imgList为空')

    $.ajax({
        url : COMMON_CONST.DOMAIN.OMS + '/web/updateAllImg' + tmsky.util.generateUrlEndStr(),
        contentType : 'application/json;charset=utf-8', //设置请求头信息
        data : JSON.stringify({imgList : imgList}),
        type : 'post',
        success : function (rs) {
            if (!(rs && rs.status == 200)) {
                tmsky.ui.dialog.alert(errorMessage);
            } else {
                AjaxFileUploadUtil.fire(cb, rs)
            }
        },
        error : function () {
            tmsky.ui.dialog.alert('保存图片排序失败');
        }
    })
}

AjaxFileUploadUtil.prototype.bindImgDeleteEvent = function () {
    if (this.imgDeleteSelector) {
        var upload = this
        $(this.imgEditorPopups).on('click', this.imgDeleteSelector, (function () {
            var scop = this
            tmsky.ui.dialog.confirm('确认删除此图片？', function () {
                var imgId, imgUrl, $li = $(scop).closest('li.img-item')
                if (!$li.length) return

                imgId = $li.find('input[name="id"]').val()
                imgUrl = $li.find('input[name="imgUrl"]').val()

                tmsky.ui.dialog.loading('图片删除中...');
                $.get(COMMON_CONST.DOMAIN.OMS + '/web/deleteImg' + tmsky.util.generateUrlEndStr(), {
                    id : imgId,
                    imgUrl : imgUrl
                }, function (rs) {
                    //删除的时候会出现always 不会被调用的情况，需要在这里关闭提示
                    tmsky.ui.dialog.loading.close()

                    if (rs && rs.status != 200) return tmsky.ui.dialog.alert('删除图片出错')
                    $li.remove()
                    AjaxFileUploadUtil.fire(upload.imgDeleted, imgId)
                }).fail(function () {
                    //删除的时候会出现always 不会被调用的情况，需要在这里关闭提示
                    tmsky.ui.dialog.loading.close()

                    tmsky.ui.dialog.alert('图片删除失败');
                }).always(tmsky.ui.dialog.loading.close)
            })
        }))
    }
}

////////////////////////////////// utils api ////////////////////////////////////
AjaxFileUploadUtil.getFilePath = function (dom) {
    return dom && dom.value || ''
}

AjaxFileUploadUtil.prototype.getFilePath = function () {
    return AjaxFileUploadUtil.getFilePath(document.getElementById('absFileInput'))
}

AjaxFileUploadUtil.getFileName = function (dom) {
    var path = AjaxFileUploadUtil.getFilePath(dom)
    return path && path.substring(path.lastIndexOf('\\' + 1)) || ''
}

AjaxFileUploadUtil.prototype.getFileName = function () {
    var path = AjaxFileUploadUtil.getFilePath(document.getElementById('absFileInput'))
    return path && path.substring(path.lastIndexOf('\\' + 1)) || ''
}

AjaxFileUploadUtil.getFileExtension = function (dom) {
    var path = AjaxFileUploadUtil.getFilePath(dom)
    return path && path.substring(path.lastIndexOf('.' + 1)) || ''
}

AjaxFileUploadUtil.prototype.getFileExtension = function () {
    return AjaxFileUploadUtil.getFileExtension(document.getElementById('absFileInput'))
}

AjaxFileUploadUtil.getFileLength = function (dom) {
    var val = dom.value, len = 0
    if (!val) return len
    try {
        //对于IE判断要上传的文件的大小
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        len = parseInt(fso.getFile(val).size);
    } catch (e) {
        try {
            //对于非IE获得要上传文件的大小
            len = parseInt(dom.files[0].size);
        } catch (e) {
            len = 0
        }
    }
    return len
}

AjaxFileUploadUtil.fire = function (fn, rs) {
    fn && tmsky.isFunction(fn) && fn(rs)
}

AjaxFileUploadUtil.prototype.getFileLength = function () {
    return AjaxFileUploadUtil.getFileLength(document.getElementById('absFileInput'))
}

AjaxFileUploadUtil.OperateType = {
    UPLOAD : 'upload',
    SORT : 'sort',
    SETCOVER : 'setCover',
    DELETE : 'delete',
}

module.exports = AjaxFileUploadUtil