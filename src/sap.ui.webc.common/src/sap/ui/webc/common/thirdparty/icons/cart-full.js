sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-full', './v4/cart-full'], function (exports, Theme, cartFull$1, cartFull$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cartFull$1.pathData : cartFull$2.pathData;
	var cartFull = "cart-full";

	exports.accData = cartFull$1.accData;
	exports.ltr = cartFull$1.ltr;
	exports.default = cartFull;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
