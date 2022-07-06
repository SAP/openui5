sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trend-up', './v4/trend-up'], function (exports, Theme, trendUp$1, trendUp$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? trendUp$1.pathData : trendUp$2.pathData;
	var trendUp = "trend-up";

	exports.accData = trendUp$1.accData;
	exports.ltr = trendUp$1.ltr;
	exports.default = trendUp;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
