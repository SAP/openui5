sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/opportunity', './v4/opportunity'], function (exports, Theme, opportunity$1, opportunity$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? opportunity$1.pathData : opportunity$2.pathData;
	var opportunity = "opportunity";

	exports.accData = opportunity$1.accData;
	exports.ltr = opportunity$1.ltr;
	exports.default = opportunity;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
