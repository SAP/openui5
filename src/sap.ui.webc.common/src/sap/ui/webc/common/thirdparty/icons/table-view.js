sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/table-view', './v4/table-view'], function (exports, Theme, tableView$1, tableView$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tableView$1.pathData : tableView$2.pathData;
	var tableView = "table-view";

	exports.accData = tableView$1.accData;
	exports.ltr = tableView$1.ltr;
	exports.default = tableView;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
