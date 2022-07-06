sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort-descending', './v4/sort-descending'], function (exports, Theme, sortDescending$1, sortDescending$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sortDescending$1.pathData : sortDescending$2.pathData;
	var sortDescending = "sort-descending";

	exports.accData = sortDescending$1.accData;
	exports.ltr = sortDescending$1.ltr;
	exports.default = sortDescending;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
