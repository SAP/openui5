sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-objects-mobile', './v4/business-objects-mobile'], function (exports, Theme, businessObjectsMobile$1, businessObjectsMobile$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessObjectsMobile$1.pathData : businessObjectsMobile$2.pathData;
	var businessObjectsMobile = "business-objects-mobile";

	exports.accData = businessObjectsMobile$1.accData;
	exports.ltr = businessObjectsMobile$1.ltr;
	exports.default = businessObjectsMobile;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
