sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/duplicate', './v4/duplicate'], function (exports, Theme, duplicate$1, duplicate$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? duplicate$1.pathData : duplicate$2.pathData;
	var duplicate = "duplicate";

	exports.accData = duplicate$1.accData;
	exports.ltr = duplicate$1.ltr;
	exports.default = duplicate;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
