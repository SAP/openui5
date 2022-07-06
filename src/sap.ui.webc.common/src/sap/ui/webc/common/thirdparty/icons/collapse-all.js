sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse-all', './v4/collapse-all'], function (exports, Theme, collapseAll$1, collapseAll$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? collapseAll$1.pathData : collapseAll$2.pathData;
	var collapseAll = "collapse-all";

	exports.accData = collapseAll$1.accData;
	exports.ltr = collapseAll$1.ltr;
	exports.default = collapseAll;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
