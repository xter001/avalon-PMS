<div class="tomasky-ui-popups" id="date_report_div" ms-controller="vm_dateReport" style="display: none;">
    <div class="ui-popups-dialog">
    	<em class="close" data-dismiss="popups"></em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">{{reportInfo.date}}销售信息</h3>
        </div>
        <div class="ui-popups-body" style="width: 500px;">
        	<table class="table table-bordered">
        		<tr>
        			<td>当日房费总收入:</td>
        			<td>￥{{reportInfo.totalRoomFee | toFixed}}</td>
        		</tr>
        		<tr>
        			<td>已售房间数:</td>
        			<td>{{reportInfo.saledRooms}}</td>
        		</tr>
        		<tr>
        			<td>当晚在住人数:</td>
        			<td>{{reportInfo.checkInMans}}</td>
        		</tr>
        		<tr>
        			<td>当日已离人数:</td>
        			<td>{{reportInfo.checkOutMans}}</td>
        		</tr>
        		<tr>
        			<td>未退押金（昨日剩余+今日新增）:</td>
        			<td>￥{{reportInfo.notReturnPayment}}</td>
        		</tr>
        		<tr>
        			<td>当日预离待退押金:</td>
        			<td>￥{{reportInfo.willReturnPayment}}</td>
        		</tr>
        	</table>
        
			<!-- <div class="tc-info-block tc-restRoom1">
				<div class="tc-info-content">
					<ul>
						<li class="tc-acc">当日房费总收入: <span class="tc-acc-c">￥{{reportInfo.totalRoomFee}}</span></li>
						<li>
							<div>已售房间数：{{reportInfo.saledRooms}}</div>
							<div class="tc-clear"></div>
						</li>
						<li>
							<div>当晚在住人数：{{reportInfo.checkInMans}}</div>
							<div>当日已离人数：{{reportInfo.checkOutMans}}</div>
							<div class="tc-clear"></div>
						</li>
						<li>截止当日未退押金总额：<span class="tc-acc-c">￥{{reportInfo.notReturnPayment}}</span></li>
						<li>当日预离待退押金：<span class="tc-acc-c">￥{{reportInfo.willReturnPayment}}</span></li>
					</ul>
				</div>
			</div> -->
			
        </div>
    </div>
</div>