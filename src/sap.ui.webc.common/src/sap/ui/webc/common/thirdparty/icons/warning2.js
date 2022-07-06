sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/warning2', './v4/warning2'], function (exports, Theme, warning2$1, warning2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? warning2$1.pathData : warning2$2.pathData;
	var warning2 = "warning2";

	exports.accData = warning2$1.accData;
	exports.ltr = warning2$1.ltr;
	exports.default = warning2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
