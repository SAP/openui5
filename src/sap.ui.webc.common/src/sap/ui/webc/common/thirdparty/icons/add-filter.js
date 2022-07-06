sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-filter', './v4/add-filter'], function (exports, Theme, addFilter$1, addFilter$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addFilter$1.pathData : addFilter$2.pathData;
	var addFilter = "add-filter";

	exports.accData = addFilter$1.accData;
	exports.ltr = addFilter$1.ltr;
	exports.default = addFilter;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
