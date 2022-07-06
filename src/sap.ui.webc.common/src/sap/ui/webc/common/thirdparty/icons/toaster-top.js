sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/toaster-top', './v4/toaster-top'], function (exports, Theme, toasterTop$1, toasterTop$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? toasterTop$1.pathData : toasterTop$2.pathData;
	var toasterTop = "toaster-top";

	exports.accData = toasterTop$1.accData;
	exports.ltr = toasterTop$1.ltr;
	exports.default = toasterTop;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
