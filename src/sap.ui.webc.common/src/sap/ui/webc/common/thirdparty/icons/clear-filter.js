sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clear-filter', './v4/clear-filter'], function (exports, Theme, clearFilter$1, clearFilter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clearFilter$1.pathData : clearFilter$2.pathData;
	var clearFilter = "clear-filter";

	exports.accData = clearFilter$1.accData;
	exports.ltr = clearFilter$1.ltr;
	exports.default = clearFilter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
