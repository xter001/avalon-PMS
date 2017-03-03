<div class="tomasky-ui-popups">
    <div class="ui-popups-dialog pay-popups" ms-controller="vm_common_pay">
        <em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">扫码支付</h3>
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
			<div class="pay-content" ms-visible="!done">
                <input type="text" class="pay-code-input" placeholder="扫描付款码" ms-on-keyup="keyupHandle">
                <div class="img-explain"></div>
			</div>
        </div>
        <div class="ui-popups-foot">
        	<div class="pay-result" ms-visible="done">
                <h3 ms-visible="failed" class="error"><i class="iconfont icon-error-fill"></i>抱歉，支付失败</h3>
                <a ms-visible="failed" href="javascript:;" class="repay-link" ms-on-click="repay">重新发起付款</a>

                <h3 ms-visible="succ" class="success"><i class="iconfont icon-right-fill"></i>你已经成功支付</h3>
        	</div>
        </div>
    </div>
</div>