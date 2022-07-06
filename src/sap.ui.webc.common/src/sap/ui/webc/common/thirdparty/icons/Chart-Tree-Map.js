sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/Chart-Tree-Map', './v4/Chart-Tree-Map'], function (exports, Theme, ChartTreeMap$1, ChartTreeMap$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ChartTreeMap$1.pathData : ChartTreeMap$2.pathData;
	var ChartTreeMap = "Chart-Tree-Map";

	exports.accData = ChartTreeMap$1.accData;
	exports.ltr = ChartTreeMap$1.ltr;
	exports.default = ChartTreeMap;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
