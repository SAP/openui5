sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-2', './v4/cart-2'], function (exports, Theme, cart2$1, cart2$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart2$1.pathData : cart2$2.pathData;
	var cart2 = "cart-2";

	exports.accData = cart2$1.accData;
	exports.ltr = cart2$1.ltr;
	exports.default = cart2;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
