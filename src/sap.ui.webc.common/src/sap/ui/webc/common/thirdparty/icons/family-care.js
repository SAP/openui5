sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/family-care', './v4/family-care'], function (exports, Theme, familyCare$1, familyCare$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? familyCare$1.pathData : familyCare$2.pathData;
	var familyCare = "family-care";

	exports.accData = familyCare$1.accData;
	exports.ltr = familyCare$1.ltr;
	exports.default = familyCare;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
