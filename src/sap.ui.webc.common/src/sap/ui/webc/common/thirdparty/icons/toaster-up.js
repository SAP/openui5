sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-up', './v4/toaster-up'], function (Theme, toasterUp$2, toasterUp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterUp$1 : toasterUp$2;
	var toasterUp = { pathData };

	return toasterUp;

});
