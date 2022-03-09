sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-top', './v4/toaster-top'], function (Theme, toasterTop$2, toasterTop$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterTop$1 : toasterTop$2;
	var toasterTop = { pathData };

	return toasterTop;

});
