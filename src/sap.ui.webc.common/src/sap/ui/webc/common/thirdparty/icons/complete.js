sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/complete', './v4/complete'], function (exports, Theme, complete$1, complete$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? complete$1.pathData : complete$2.pathData;
	var complete = "complete";

	exports.accData = complete$1.accData;
	exports.ltr = complete$1.ltr;
	exports.default = complete;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
