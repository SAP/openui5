sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-bar-chart-2', './v4/vertical-bar-chart-2'], function (exports, Theme, verticalBarChart2$1, verticalBarChart2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? verticalBarChart2$1.pathData : verticalBarChart2$2.pathData;
	var verticalBarChart2 = "vertical-bar-chart-2";

	exports.accData = verticalBarChart2$1.accData;
	exports.ltr = verticalBarChart2$1.ltr;
	exports.default = verticalBarChart2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
