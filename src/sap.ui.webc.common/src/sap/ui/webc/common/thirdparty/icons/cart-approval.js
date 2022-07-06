sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-approval', './v4/cart-approval'], function (exports, Theme, cartApproval$1, cartApproval$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cartApproval$1.pathData : cartApproval$2.pathData;
	var cartApproval = "cart-approval";

	exports.accData = cartApproval$1.accData;
	exports.ltr = cartApproval$1.ltr;
	exports.default = cartApproval;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
