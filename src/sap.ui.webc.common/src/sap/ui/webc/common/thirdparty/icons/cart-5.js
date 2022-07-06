sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-5', './v4/cart-5'], function (exports, Theme, cart5$1, cart5$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart5$1.pathData : cart5$2.pathData;
	var cart5 = "cart-5";

	exports.accData = cart5$1.accData;
	exports.ltr = cart5$1.ltr;
	exports.default = cart5;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
