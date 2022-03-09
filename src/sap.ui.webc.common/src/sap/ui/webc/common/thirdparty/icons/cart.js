sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart', './v4/cart'], function (Theme, cart$2, cart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart$1 : cart$2;
	var cart = { pathData };

	return cart;

});
