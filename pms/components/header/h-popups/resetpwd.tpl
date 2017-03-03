<!--修改密码-->
<div class="tomasky-ui-popups" id="pwd_popups">
    <div class="ui-popups-dialog reset-pwd-dialog">
        <em class="close" data-dismiss="popups">×</em>
        <div class="ui-popups-head">
            <h3 class="ui-popups-title">密码修改</h3>
        </div>
        <div class="ui-popups-body">
        	<div class="input-group">
				<label class="input-group-addon adjust">原密码：</label>
				<input class="form-control" maxlength="20" type="password" name="old_pwd" id="old_pwd">
			</div>
			<div class="input-group">
				<label class="input-group-addon adjust">新密码：</label>
				<input class="form-control" maxlength="20" type="password" name="new_pwd" id="new_pwd">
			</div>
			<div class="input-group">
				<label class="input-group-addon">新密码确认：</label>
				<input class="form-control" maxlength="20" type="password" name="confirm_pwd" id="confirm_pwd">
			</div>
        </div>
        <div class="ui-popups-foot">
        	<button class="btn btn-success btn-lg btn-block" name="confirm_btn">确定修改</button>
        </div>
        <div class="tip css3_2 shake pwd-popups-tips"></div>
    </div>
</div>