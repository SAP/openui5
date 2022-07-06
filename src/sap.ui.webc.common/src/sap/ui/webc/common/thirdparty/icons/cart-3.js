sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-3', './v4/cart-3'], function (exports, Theme, cart3$1, cart3$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart3$1.pathData : cart3$2.pathData;
	var cart3 = "cart-3";

	exports.accData = cart3$1.accData;
	exports.ltr = cart3$1.ltr;
	exports.default = cart3;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
