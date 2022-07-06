sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/business-card', './v4/business-card'], function (exports, Theme, businessCard$1, businessCard$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? businessCard$1.pathData : businessCard$2.pathData;
	var businessCard = "business-card";

	exports.accData = businessCard$1.accData;
	exports.ltr = businessCard$1.ltr;
	exports.default = businessCard;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
