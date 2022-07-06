sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/credit-card', './v4/credit-card'], function (exports, Theme, creditCard$1, creditCard$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? creditCard$1.pathData : creditCard$2.pathData;
	var creditCard = "credit-card";

	exports.accData = creditCard$1.accData;
	exports.ltr = creditCard$1.ltr;
	exports.default = creditCard;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
