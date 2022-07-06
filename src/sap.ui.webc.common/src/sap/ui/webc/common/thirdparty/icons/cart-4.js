sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-4', './v4/cart-4'], function (exports, Theme, cart4$1, cart4$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart4$1.pathData : cart4$2.pathData;
	var cart4 = "cart-4";

	exports.accData = cart4$1.accData;
	exports.ltr = cart4$1.ltr;
	exports.default = cart4;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
