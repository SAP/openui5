sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-up', './v4/toaster-up'], function (exports, Theme, toasterUp$1, toasterUp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterUp$1.pathData : toasterUp$2.pathData;
	var toasterUp = "toaster-up";

	exports.accData = toasterUp$1.accData;
	exports.ltr = toasterUp$1.ltr;
	exports.default = toasterUp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
