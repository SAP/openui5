sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chart-table-view', './v4/chart-table-view'], function (exports, Theme, chartTableView$1, chartTableView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chartTableView$1.pathData : chartTableView$2.pathData;
	var chartTableView = "chart-table-view";

	exports.accData = chartTableView$1.accData;
	exports.ltr = chartTableView$1.ltr;
	exports.default = chartTableView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
