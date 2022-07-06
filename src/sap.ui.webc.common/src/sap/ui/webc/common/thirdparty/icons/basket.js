sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/basket', './v4/basket'], function (exports, Theme, basket$1, basket$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? basket$1.pathData : basket$2.pathData;
	var basket = "basket";

	exports.accData = basket$1.accData;
	exports.ltr = basket$1.ltr;
	exports.default = basket;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
