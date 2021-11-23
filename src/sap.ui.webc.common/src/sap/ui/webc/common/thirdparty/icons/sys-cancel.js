sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-cancel', './v4/sys-cancel'], function (Theme, sysCancel$2, sysCancel$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sysCancel$1 : sysCancel$2;
	var sysCancel = { pathData };

	return sysCancel;

});
