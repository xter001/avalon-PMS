<div class="bottomBar">
    <ul class="fl">
        <li class="fl"><a  class="icon1" data-ui="popups" data-target="#today_finance_popups" href="javascript:;" >单日财务</a></li>
        <li class="fl"><a class="icon2" id="mini_map" target="_blank">共享房态</a></li>
        <li class="fl" data-ui="popups" data-target="#style_select_popups"  href="javascript:;"><a class="icon3">房态风格</a></li>
    </ul>
    <ul class="fr">
        <li class="fl"><a class="icon4" href="tencent://message/?uin=1070375586&Site=番茄来了&Menu=yes">客服QQ</a></li>
        <li class="fl"><a  ms-controller="vm_bottombar" ms-click=bdOpen() class="icon7">客户经理</a></li>
        <li class="fl" ms-controller="vm_bottombar" ms-click="barOpen()"><a  ms-class-icon6="hasNewOrders" ms-class-icon5="!hasNewOrders">消息中心</a></li>
    </ul>
</div>
<!--<div class="content-foot">-->
	<!--<div class="nav-launch-wrapper">-->
		<!--<div class="nav-launch">-->
			<!--<em class="nav-launch-foot"></em>-->
			<!--&lt;!&ndash;<a class="qq-link" href="tencent://message/?Menu=yes&amp;amp;uin=938062840&amp;amp;Service=58&amp;amp;SigT=A7F6FEA02730C9883990CD5D19271A46BE22B2CAAC936E523D384B6957A1C4F2A81D18D3D1345E30702F32987DDF42DDEBBD265CCA3BCFBA6A8BC3D03220A437002CDBCC1FD2E1BCD50ADA559E6C8EFF870DACE6D1A6A4B268DBDB94AE9AFCD3BC2098B73D5927489469EF574FC66F15FD27DC8AA2A058CE&amp;amp;SigU=30E5D5233A443AB24DED9B7AAE8FC1C725F5D2DD81A867220803EEEEB9CC3A0B1F58A62F0E376672B4C1CD37136B0F453C33709FDD2AE1F7450D4A551DCD637964B7BBA89BF9BB8B">&ndash;&gt;-->
				<!--&lt;!&ndash;<span>在线客服</span>&ndash;&gt;-->
			<!--&lt;!&ndash;</a>&ndash;&gt;-->
            <!--<a class="qq-link" target="_blank" onclick="window.open ('https://afanqie.kf5.com/kchat/19631', '在线客服', 'height=500, width=400, top=150, left=400, toolbar=no,menubar=no, scrollbars=no, resizable=yes, location=no, status=no');">-->
                <!--<span>在线客服</span>-->
            <!--</a>-->
			<!--&lt;!&ndash;-->
			<!--<a data-ui="popups" data-target="#ota_popups" id="ota_popups_trigger" href="javascript:;">-->
				<!--<i class="iconfont icon-grid"></i>-->
				<!--<span>卖房网站房态</span>-->
			<!--</a>-->
			<!--&ndash;&gt;-->
			<!--<a data-ui="popups" data-target="#today_finance_popups" href="javascript:;" >-->
				<!--<i class="iconfont icon-finance"></i>-->
				<!--<span>单日财务</span>-->
			<!--</a>-->
			<!--<a id="mini_map" target="_blank">-->
				<!--<i class="iconfont icon-suolue"></i>-->
				<!--<span>共享房态</span>-->
			<!--</a>-->
			<!--<a data-ui="popups" data-target="#style_select_popups"  href="javascript:;">-->
				<!--<i class="iconfont icon-roomstyle"></i>-->
				<!--<span>房态风格</span>-->
			<!--</a>-->
		<!--</div>-->
	<!--</div>-->
	<!--<div class="nav-circle"></div>-->
<!--</div>-->
<!-- 房态风格 -->
<div class="tomasky-ui-popups" id="style_select_popups">
    <div class="ui-popups-dialog">
        <em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">选择房态风格</h3>
        </div>
        <div class="ui-popups-body">
        	<ul class="style-select">
        		<li data-value="1">
        			<i class="iconfont icon-right"></i>
        		</li>
        		<li data-value="2">
        			<i class="iconfont icon-right"></i>
        		</li>
        		<li data-value="4">
        			<i class="iconfont icon-right"></i>
        		</li>
                <li data-value="5">
                    <i class="iconfont icon-right"></i>
                </li>
        	</ul>
        </div>
    </div>
</div>
<!-- 今日财务汇总 -->
<div class="tomasky-ui-popups" id="today_finance_popups">
    <div class="ui-popups-dialog today-finance">
        <em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">今日财务汇总</h3>
        </div>
        <div class="ui-popups-body">
        	<h4>
        		<input id="finance_from" type="text" readonly="readonly" class="form-control">
                <span class="division">~</span>
                <input id="finance_to" type="text" readonly="readonly" class="form-control">
                <button class="btn btn-xs btn-success" id="finance_search">搜索</button>
        	</h4>
        	<table class="table table-bordered"></table>
        </div>
    </div>
</div>

<!-- 卖房网站常态 -->
<div id="ota_room_status_div" class="tomasky-ui-popups" id="ota_popups" ms-controller="vm_ota">
    <div class="ui-popups-dialog ota-popups">
        <em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">卖房网站房态</h3>
        </div>
        <div class="ui-popups-body">
            <!-- 日期栏 -->
            <div class="ota-top-box">
                <table class="table-ota">
                    <thead>
                        <tr>
                            <td>
                                <!-- 时间选择 -->
                                <div class="ota-date-panel">
                                    <i id="ota_status_left_btn" class="iconfont icon-arrowleft"></i>
                                    <input type="text" ms-duplex="datas.from" id="ota_datepicker" readonly="readonly">
                                    <i id="ota_status_right_btn" class="iconfont icon-arrowright"></i>
                                </div>
                            </td>
                            <td>
                                <dl> 
                                    <dt>房量</dt> 
                                    <dd>类型</dd> 
                                </dl>
                            </td>
                            <td ms-repeat-el="dataList">
                                <dl> 
                                    <dt>{{el.date}}</dt> 
                                    <dd>{{el.week}}</dd> 
                                </dl>
                            </td>
                        </tr>
                    </thead>
                </table>
            </div>
            <div class="tomasky-ui-tabs" data-ui="tabs">
                <ul id="ota_id_list" class="ui-tabs-nav">
                    <li ota-id="1" class="active">去哪儿</li>
                    <li ota-id="2">携程</li>
                    <li ota-id="3">艺龙</li>
                </ul>
                <ul id="ul_content_list" class="ui-tabs-content">
                    <!-- 去哪儿 -->
                    <li ota-id="1" class="ui-tabs-panel active">
                        <div class="hotel-select">
                            <span>选择客栈：</span>
                            <div class="tomasky-ui-dropdown" data-ui="dropdown">
                                <input type="hidden" name="otainn" ms-duplex="datas.otaInnId" />
                                <a href="javascript:void(0)">
                                    <span ota-id="1" data-role="value" data-value="1"></span>
                                    <i class="iconfont icon-arrowdown"></i>
                                </a>
                                <div class="ui-dropdown-list">
                                    <a ms-repeat-el="qunarInnList" href="javascript:void(0)" data-role="item" ms-data-value="el.id">{{el.name}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="table-ota-wrap">
                            <table class="table-ota">
                                <tbody>
                                    <tr ms-repeat-el="roomStatus">
                                        <th><span>{{el.roomName}}</span></th>
                                        <td><span>剩余</span></td>
                                        <td ms-repeat-el="el.roomInfos"><span ms-class="{{el.clazz}}">{{el.remainNum}}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>
                    <!-- 携程 -->
                    <li ota-id="2" class="ui-tabs-panel">
                        <div class="hotel-select">
                            <span>选择客栈：</span>
                            <div class="tomasky-ui-dropdown" data-ui="dropdown">
                                <input id="xc_ota_inn_id" name="otainn" type="hidden" ms-duplex="datas.otaInnId" />
                                <a href="javascript:void(0)">
                                    <span ota-id="2" data-role="value" data-value="1"></span>
                                    <i class="iconfont icon-arrowdown"></i>
                                </a>
                                <div class="ui-dropdown-list">
                                    <a ms-repeat-el="xcInnList" href="javascript:void(0);" data-role="item" ms-data-value="el.id">{{el.name}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="table-ota-wrap">
                            <table class="table-ota">
                                <tbody>
                                    <tr ms-repeat-el="roomStatus">
                                        <th><span>{{el.roomName}}</span></th>
                                        <td><span>剩余</span></td>
                                        <td ms-repeat-el="el.roomInfos"><span ms-class="{{el.clazz}}">{{el.remainNum}}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>
                    <!-- 艺龙 -->
                    <li ota-id="3" class="ui-tabs-panel">
                        <div class="hotel-select">
                            <span>选择客栈：</span>
                            <div class="tomasky-ui-dropdown" data-ui="dropdown">
                                <input type="hidden" name="otainn" ms-duplex="datas.otaInnId" />
                                <a href="javascript:void(0)">
                                    <span ota-id="3" data-role="value" data-value="1"></span>
                                    <i class="iconfont icon-arrowdown"></i>
                                </a>
                                <div class="ui-dropdown-list">
                                    <a ms-repeat-el="ylInnList" href="javascript:void(0)" data-role="item" ms-data-value="el.id">{{el.name}}</a>
                                </div>
                            </div>
                        </div>
                        <div class="table-ota-wrap">
                            <table class="table-ota">
                                <tbody>
                                    <tr ms-repeat-el="roomStatus">
                                        <th><span>{{el.roomName}}</span></th>
                                        <td><span>剩余</span></td>
                                        <td ms-repeat-el="el.roomInfos"><span ms-class="{{el.clazz}}">{{el.remainNum}}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="ui-popups-foot">
            <span>图例：</span>
            <label class="legend-stop">关房</label>
            <label class="legend-sale">可售卖</label>
            <span class="fr">显示未来120天房型</span>
        </div>
    </div>
</div>

<div class="bdcover"></div>
<div class="bdmanage"  ms-controller="vm_bottombar">
    <i class="bd_close" ms-click="bdClose()"></i>
    <div class="bdmanageL">我的客户经理</div>
    <div class="bdmanageR">{{bdInfo.name||'番茄来了'}}</div>
    <div class="bdTelNo">{{bdInfo.mobile||'4000230190'}}</div>
</div>