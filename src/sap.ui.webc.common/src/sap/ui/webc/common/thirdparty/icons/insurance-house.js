sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-house', './v4/insurance-house'], function (exports, Theme, insuranceHouse$1, insuranceHouse$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? insuranceHouse$1.pathData : insuranceHouse$2.pathData;
	var insuranceHouse = "insurance-house";

	exports.accData = insuranceHouse$1.accData;
	exports.ltr = insuranceHouse$1.ltr;
	exports.default = insuranceHouse;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
