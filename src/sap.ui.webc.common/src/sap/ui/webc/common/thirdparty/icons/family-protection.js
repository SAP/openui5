sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/family-protection', './v4/family-protection'], function (exports, Theme, familyProtection$1, familyProtection$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? familyProtection$1.pathData : familyProtection$2.pathData;
	var familyProtection = "family-protection";

	exports.accData = familyProtection$1.accData;
	exports.ltr = familyProtection$1.ltr;
	exports.default = familyProtection;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
