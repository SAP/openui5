sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/trend-down', './v4/trend-down'], function (exports, Theme, trendDown$1, trendDown$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? trendDown$1.pathData : trendDown$2.pathData;
	var trendDown = "trend-down";

	exports.accData = trendDown$1.accData;
	exports.ltr = trendDown$1.ltr;
	exports.default = trendDown;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
