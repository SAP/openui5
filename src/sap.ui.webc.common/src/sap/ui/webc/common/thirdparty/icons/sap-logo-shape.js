sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sap-logo-shape', './v4/sap-logo-shape'], function (exports, Theme, sapLogoShape$1, sapLogoShape$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sapLogoShape$1.pathData : sapLogoShape$2.pathData;
	var sapLogoShape = "sap-logo-shape";

	exports.accData = sapLogoShape$1.accData;
	exports.ltr = sapLogoShape$1.ltr;
	exports.default = sapLogoShape;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
