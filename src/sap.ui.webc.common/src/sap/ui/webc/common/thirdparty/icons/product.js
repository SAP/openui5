sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/product', './v4/product'], function (exports, Theme, product$1, product$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? product$1.pathData : product$2.pathData;
	var product = "product";

	exports.accData = product$1.accData;
	exports.ltr = product$1.ltr;
	exports.default = product;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
