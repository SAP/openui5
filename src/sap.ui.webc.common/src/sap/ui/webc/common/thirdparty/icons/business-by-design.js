sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-by-design', './v4/business-by-design'], function (exports, Theme, businessByDesign$1, businessByDesign$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessByDesign$1.pathData : businessByDesign$2.pathData;
	var businessByDesign = "business-by-design";

	exports.accData = businessByDesign$1.accData;
	exports.ltr = businessByDesign$1.ltr;
	exports.default = businessByDesign;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
