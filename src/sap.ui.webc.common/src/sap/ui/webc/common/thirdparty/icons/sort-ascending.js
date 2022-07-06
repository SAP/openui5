sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sort-ascending', './v4/sort-ascending'], function (exports, Theme, sortAscending$1, sortAscending$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sortAscending$1.pathData : sortAscending$2.pathData;
	var sortAscending = "sort-ascending";

	exports.accData = sortAscending$1.accData;
	exports.ltr = sortAscending$1.ltr;
	exports.default = sortAscending;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
