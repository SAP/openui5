sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-column', './v4/table-column'], function (exports, Theme, tableColumn$1, tableColumn$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableColumn$1.pathData : tableColumn$2.pathData;
	var tableColumn = "table-column";

	exports.accData = tableColumn$1.accData;
	exports.ltr = tableColumn$1.ltr;
	exports.default = tableColumn;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
