sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-cancel-2', './v4/sys-cancel-2'], function (Theme, sysCancel2$2, sysCancel2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysCancel2$1 : sysCancel2$2;
	var sysCancel2 = { pathData };

	return sysCancel2;

});
