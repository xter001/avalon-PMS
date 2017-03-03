<div class="top-search" ms-controller="vm_top_search">
	<i id="icon-search-i" class="iconfont icon-search" ms-click="toggle($event)"></i>
	<div class="search-area" ms-visible="open">
		<em class="search-angle"></em>
		<em class="close" ms-click="close"></em>
		<div class="search-head">
			<input id="order-search-ipt" ms-duplex="searchText" class="form-control input-condensed" placeholder="订单号/电话/姓名" type="text">
			<button id="order-search-btn" ms-click="searchHandle($event)">搜索</button>
		</div>
		<div class="search-body" ms-visible="showSearchResult">
			<div class="search-rs">搜索结果（共{{itemArr.size()}}条）</div>
			<ul class="search-list" ms-visible="itemArr.size()>0">
				<li ms-repeat-el="itemArr" ms-if-loop="el.show" ms-click="linkItem(el)">
					<p>开始于{{el.date}}（<span class="c-red">{{el.statusText}}</span>）</p> 
					<p>{{el.userName}}（{{el.contact}}）</p> 
					<p>{{el.customerFrom}}（{{el.orderNo}}）</p>
				</li>
			</ul>
		</div>
		<div class="search-foot" ms-visible="showSearchResult">
			<p ms-visible="itemArr.size()==0" class="c-red">很遗憾，没有你要找的信息！</p>
			<div id="search_page"></div>
		</div>
	</div>
</div>
