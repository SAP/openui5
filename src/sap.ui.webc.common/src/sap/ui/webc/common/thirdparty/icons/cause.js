sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cause', './v4/cause'], function (exports, Theme, cause$1, cause$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cause$1.pathData : cause$2.pathData;
	var cause = "cause";

	exports.accData = cause$1.accData;
	exports.ltr = cause$1.ltr;
	exports.default = cause;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
