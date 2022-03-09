sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-down', './v4/toaster-down'], function (Theme, toasterDown$2, toasterDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterDown$1 : toasterDown$2;
	var toasterDown = { pathData };

	return toasterDown;

});
