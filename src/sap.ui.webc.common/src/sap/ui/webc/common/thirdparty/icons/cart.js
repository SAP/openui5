sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart', './v4/cart'], function (exports, Theme, cart$1, cart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart$1.pathData : cart$2.pathData;
	var cart = "cart";

	exports.accData = cart$1.accData;
	exports.ltr = cart$1.ltr;
	exports.default = cart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
