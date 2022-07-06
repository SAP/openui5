sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspect', './v4/inspect'], function (exports, Theme, inspect$1, inspect$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? inspect$1.pathData : inspect$2.pathData;
	var inspect = "inspect";

	exports.accData = inspect$1.accData;
	exports.ltr = inspect$1.ltr;
	exports.default = inspect;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
