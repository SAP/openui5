sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/receipt', './v4/receipt'], function (exports, Theme, receipt$1, receipt$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? receipt$1.pathData : receipt$2.pathData;
	var receipt = "receipt";

	exports.accData = receipt$1.accData;
	exports.ltr = receipt$1.ltr;
	exports.default = receipt;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
