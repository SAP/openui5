sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clear-all', './v4/clear-all'], function (exports, Theme, clearAll$1, clearAll$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clearAll$1.pathData : clearAll$2.pathData;
	var clearAll = "clear-all";

	exports.accData = clearAll$1.accData;
	exports.ltr = clearAll$1.ltr;
	exports.default = clearAll;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
