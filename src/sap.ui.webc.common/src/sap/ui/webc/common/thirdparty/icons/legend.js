sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/legend', './v4/legend'], function (exports, Theme, legend$1, legend$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? legend$1.pathData : legend$2.pathData;
	var legend = "legend";

	exports.accData = legend$1.accData;
	exports.ltr = legend$1.ltr;
	exports.default = legend;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
