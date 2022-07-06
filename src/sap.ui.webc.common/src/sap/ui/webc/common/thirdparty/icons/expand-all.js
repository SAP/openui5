sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand-all', './v4/expand-all'], function (exports, Theme, expandAll$1, expandAll$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expandAll$1.pathData : expandAll$2.pathData;
	var expandAll = "expand-all";

	exports.accData = expandAll$1.accData;
	exports.ltr = expandAll$1.ltr;
	exports.default = expandAll;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
