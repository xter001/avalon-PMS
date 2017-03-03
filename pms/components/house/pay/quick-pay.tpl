<div class="tomasky-ui-popups">
    <div class="ui-popups-dialog pay-popups" ms-controller="vm_common_pay">
        <em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">快捷支付</h3>
        </div>
        <div class="ui-popups-body">
        	<ul>
        		<li>
        			<label>需收款：</label>
        			<span class="fr c-red">￥{{money}}</span>
        		</li>
        		<li class="clearfix">
        			<label>描述：</label>
	        		<div class="dec">
	        			<span >{{firstRoom.typeName}}（{{firstRoom.roomNo}}），{{firstRoom.checkIn}}入住，住{{firstRoom.days}}晚</span>
	        			<i class="iconfont icon-more-menu"></i>
						<div class="bumb">
							<p ms-repeat-el="rooms">{{el.typeName}}（{{el.roomNo}}），{{el.checkIn}}入住，住{{el.days}}晚</p>
						</div>
	        		</div>
        		</li>
        		<li class="clearfix">
        			<span class="fr">{{userName}} {{financeName}}</span>
        		</li>
        	</ul>
			<div class="pay-content">
				<p>您的收款二维码贴在收款处，客人付款更方便</p>
				<p>请到“功能库-快捷支付”中下载</p>
				<img width="159" height="159" alt="二维码" ms-attr-src="QRcode">
			</div>
        </div>
        <div class="ui-popups-foot">
        	<div ms-visible="!done">
	        	<div class="scan-img"></div>
	        	<p>请客人打开微信</p>
	        	<p>扫描二维码以完成支付，在支付完成前，请勿关闭该窗口。</p>
        	</div>
        	<div class="pay-result" ms-visible="done">
                <h3 ms-visible="closed" class="error"><i class="iconfont icon-error-fill"></i>抱歉，支付关闭</h3>
                <h3 ms-visible="failed" class="error"><i class="iconfont icon-error-fill"></i>抱歉，支付失败</h3>
                <h3 ms-visible="succ" class="success"><i class="iconfont icon-right-fill"></i>你已经成功支付</h3>
        		<p ms-visible="succ">{{userName}}已通过{{payMode}}成功支付房费￥{{money}}，你可进入”报表-快捷支付“查看收款详情。</p>
        	</div>
        </div>
    </div>
</div>