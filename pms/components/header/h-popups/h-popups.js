/**
 * 头部弹窗
 */
//var dialog = require('dialog')
var user = require('../user.js')

var resetPwdTpl = __inline('resetpwd.tpl');
var loginoutTpl = __inline('loginout.tpl');
var downloadTpl = __inline('download.tpl');
// var funcexplainTpl = __inline('funcexplain.tpl');
var tuliTpl = __inline('tuli.tpl');
var fanqieWxPublicNoTpl = __inline('fanqieWxPublicNo.tpl');
var removeWxBoundTpl = __inline('removeWxBound.tpl');
var inited = false

module.exports = {
	init : function(target) {
		if (!inited) {
			inited = true
			var body = document.body || document.getElementsByClassName('body')[0];

			var $pwdPopups = $(resetPwdTpl), $loginoutPopups = $(loginoutTpl), $removeWxBoundPopups = $(removeWxBoundTpl);
			var $oldPwd = $pwdPopups.find('input[name=old_pwd]'), $newPwd = $pwdPopups.find('input[name=new_pwd]'), $confirmPwd = $pwdPopups.find('input[name=confirm_pwd]');
			var $confirmBtn = $pwdPopups.find('[name=confirm_btn]');
			var $loginoutOk = $loginoutPopups.find('[callback="ok"]');
			var $removeWxBoundOk = $removeWxBoundPopups.find('[callback="ok"]');
			// $(downloadTpl + tuliTpl + funcexplainTpl).appendTo(body)

			$(downloadTpl + tuliTpl + fanqieWxPublicNoTpl).appendTo(body)

			var validatePwd = function(params) {
				var result = {
					result : true,
					error : ''
				}
				if (!params.oldPwd) {
					result.result = false;
					result.error = '原密码不能为空';
					result.id = 'old_pwd';
					return result
				}
				if (!params.newPwd) {
					result.result = false;
					result.error = '新密码不能为空';
					result.id = 'new_pwd';
					return result
				}
				if (params.newPwd !== params.confirm) {
					result.result = false;
					result.error = '新密码两次输入不一致';
					result.id = 'confirm_pwd';
					return result
				}
				return result
			}

			var showPwdErrorTips = function(error) {
				var message;
				if (typeof error === "string") {
					message = error;
				} else {
					$.each(error, function(index) {
						message += error[index] + "<br/>";
					});
				}
				$(".pwd-popups-tips").text(message).stop().slideDown().delay(5000).slideUp();
			}

			// 提交
			$confirmBtn.on('click', function(e) {
				e.preventDefault()
				var params = {
					"oldPwd" : $oldPwd.val().trim(),
					"newPwd" : $newPwd.val().trim(),
					"confirm" : $confirmPwd.val().trim()
				}
				// validate
				var validateResult = validatePwd(params);
				if (!validateResult.result) {
					$("#pwd_popups #" + validateResult.id).focus();
					showPwdErrorTips(validateResult.error)
					return;
				} else {
					$(".pwd-popups-tips").slideUp();
				}
				tmsky.ui.dialog.loading()
				$.post('/passWord/update', params).done(function(rs) {
					tmsky.ui.dialog.loading.close()
					if (rs.status == 200) {
						$pwdPopups.popups('hide')
						tmsky.ui.dialog.tips('操作成功', 'success')
					} else {
						showPwdErrorTips(rs.message)
					}
				})
			})

			// 清除上次填写记录
			$pwdPopups.on('shown.tc.popups', function(e) {
				$oldPwd.val('')
				$newPwd.val('')
				$confirmPwd.val('')
			})

			// 退出系统
			$loginoutOk.on('click', function(event) {
				event.preventDefault()
				window.location.href = user.getUserInfo().logoutUrl
			});

			// 获取该用户对应的微信绑定二维码
			var hasBoundWx = user.getUserInfo().hasBoundWx
			if (!hasBoundWx) {
				if (target == "#fanqie_wx_public_no_popups") {
					tmsky.ui.dialog.loading()
				}
				$.get('/weixin/getQrcode').done(function(rs) {
					if (rs.status == 200 && rs.qrCode) {
						$('#fanqie_wx_public_no_popups img').attr("src", "http://oss.fanqiele.com/qrcode?s=8&l=H&t=" + rs.qrCode.url)
				   	} else {
						if (target == "#fanqie_wx_public_no_popups") {
							tmsky.ui.dialog.tips('请稍后再试！', 'error')
						}
						inited = false
						//setTimeout(function(){
						//	window.location.reload()
						//},2000);
					}
					tmsky.ui.dialog.loading.close()
				})
			}

			// 解除微信公众号绑定
			$removeWxBoundOk.on('click', function(event) {
				event.preventDefault()
				tmsky.ui.dialog.loading()
				$.post('/weixin/unbindWxOpendId').done(function(rs) {
					tmsky.ui.dialog.loading.close()
					if (rs.status == 200) {
						tmsky.ui.dialog.tips('解除绑定成功！', 'success')
						$removeWxBoundPopups.popups('hide')
					} else {
						tmsky.ui.dialog.tips('解除绑定失败！', 'error')
					}
				})
			});

			$loginoutPopups.appendTo(body)
			$pwdPopups.appendTo(body)
			$removeWxBoundPopups.appendTo(body)
		}
	}
}