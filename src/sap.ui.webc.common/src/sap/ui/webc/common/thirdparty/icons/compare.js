sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/compare', './v4/compare'], function (exports, Theme, compare$1, compare$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? compare$1.pathData : compare$2.pathData;
	var compare = "compare";

	exports.accData = compare$1.accData;
	exports.ltr = compare$1.ltr;
	exports.default = compare;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
