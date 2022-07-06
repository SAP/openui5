sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-row', './v4/table-row'], function (exports, Theme, tableRow$1, tableRow$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableRow$1.pathData : tableRow$2.pathData;
	var tableRow = "table-row";

	exports.accData = tableRow$1.accData;
	exports.ltr = tableRow$1.ltr;
	exports.default = tableRow;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
