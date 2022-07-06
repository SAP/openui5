sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/compare-2', './v4/compare-2'], function (exports, Theme, compare2$1, compare2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? compare2$1.pathData : compare2$2.pathData;
	var compare2 = "compare-2";

	exports.accData = compare2$1.accData;
	exports.ltr = compare2$1.ltr;
	exports.default = compare2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
