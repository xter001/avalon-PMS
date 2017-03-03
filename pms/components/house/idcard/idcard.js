var Controller = require('../js/control.js')
var CONST = require('../../common/js/const.js')

var timer = null

function readIdCard() {
	var g_status = Controller.getGlobalStatus()

	try {
		switch (g_status) {
			//预订或入住
			case CONST.G_ROOMS:
			case CONST.G_BOOKING:
			case CONST.G_PART_INING:
			case CONST.G_INING:
				break;
			default:
				return;
		}
		//注意：第一个参数为对应的设备端口，USB型为1001，串口型为1至16
		var rs = IdCardReader.ReadCard("1001", "");
		if (rs == 1) {
			//插件判断
			var name = IdCardReader.GetName(),
				cardNo = IdCardReader.GetCode(),
				nation = IdCardReader.GetFolk(),
				address = IdCardReader.GetAddress(),
				picStream = IdCardReader.GetJPGPhotobuf() //头像

			var item = {
				name: name,
                cardNo: cardNo,
                address: address,
                picStream: picStream,
                nation: nation
			}
			//添加多人信息
			Controller.readIdCardGuest(item);
		} else {
			if (rs == -1) {
				console && console.log('身份证读卡器，端口初始化失败, 建议重新连接设备！');
				clearInterval(timer);
			}
			// if (rs == -2)
			// 	console && console.log('请重新将卡片放到读卡器上！');
			if (rs == -3) {
				console && console.log('读取数据失败！');
			}
		}
	} catch (e) {
		console && console.log('身份证读卡器读取出错（未连接），停止读取。e：' + e);
		clearInterval(timer);
	}
}


module.exports = {
	start: function(){
		timer = setInterval(readIdCard, 1500);
	}
}