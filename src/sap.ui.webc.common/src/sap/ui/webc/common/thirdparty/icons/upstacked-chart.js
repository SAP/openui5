sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/upstacked-chart', './v4/upstacked-chart'], function (exports, Theme, upstackedChart$1, upstackedChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? upstackedChart$1.pathData : upstackedChart$2.pathData;
	var upstackedChart = "upstacked-chart";

	exports.accData = upstackedChart$1.accData;
	exports.ltr = upstackedChart$1.ltr;
	exports.default = upstackedChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
