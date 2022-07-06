sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/error', './v4/error'], function (exports, Theme, error$1, error$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? error$1.pathData : error$2.pathData;
	var error = "error";

	exports.accData = error$1.accData;
	exports.ltr = error$1.ltr;
	exports.default = error;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
