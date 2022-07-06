sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/insurance-life', './v4/insurance-life'], function (exports, Theme, insuranceLife$1, insuranceLife$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? insuranceLife$1.pathData : insuranceLife$2.pathData;
	var insuranceLife = "insurance-life";

	exports.accData = insuranceLife$1.accData;
	exports.ltr = insuranceLife$1.ltr;
	exports.default = insuranceLife;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
