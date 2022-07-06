sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-product', './v4/add-product'], function (exports, Theme, addProduct$1, addProduct$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addProduct$1.pathData : addProduct$2.pathData;
	var addProduct = "add-product";

	exports.accData = addProduct$1.accData;
	exports.ltr = addProduct$1.ltr;
	exports.default = addProduct;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
