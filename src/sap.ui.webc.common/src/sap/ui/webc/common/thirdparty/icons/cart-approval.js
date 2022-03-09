sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-approval', './v4/cart-approval'], function (Theme, cartApproval$2, cartApproval$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cartApproval$1 : cartApproval$2;
	var cartApproval = { pathData };

	return cartApproval;

});
