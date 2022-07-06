sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-down', './v4/toaster-down'], function (exports, Theme, toasterDown$1, toasterDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterDown$1.pathData : toasterDown$2.pathData;
	var toasterDown = "toaster-down";

	exports.accData = toasterDown$1.accData;
	exports.ltr = toasterDown$1.ltr;
	exports.default = toasterDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
