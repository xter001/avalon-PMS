<div class="filter-panel-head">
	<span>筛选房型</span>
	<i class="iconfont icon-arrowdown"></i>
</div>
<div class="filter-panel-main" ms-controller="vm_roomtypes">
	<ul>
		<li ms-click="checkAll">
			<label>
				<i class="iconfont" ms-class-icon-checked="allChecked" ms-class-icon-unchecked="!allChecked"></i>
				<span>全选</span>
			</label>
		</li>
		<li ms-repeat-el="roomtypes" ms-click="toggleChecked(el)">
			<label>
				<i class="iconfont" ms-class-icon-checked="el.checked" ms-class-icon-unchecked="!el.checked"></i>
				<span>{{el.name}}</span>
			</label>
		</li>
	</ul>
	<div class="clearfix">
		<button class="btn btn-danger" ms-click="submit">确认</button>
		<button class="btn" ms-click="reset">取消</button>
	</div>
</div>
