sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-chart', './v4/table-chart'], function (exports, Theme, tableChart$1, tableChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableChart$1.pathData : tableChart$2.pathData;
	var tableChart = "table-chart";

	exports.accData = tableChart$1.accData;
	exports.ltr = tableChart$1.ltr;
	exports.default = tableChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
