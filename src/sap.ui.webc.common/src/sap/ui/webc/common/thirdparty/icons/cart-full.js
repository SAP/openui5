sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-full', './v4/cart-full'], function (Theme, cartFull$2, cartFull$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cartFull$1 : cartFull$2;
	var cartFull = { pathData };

	return cartFull;

});
