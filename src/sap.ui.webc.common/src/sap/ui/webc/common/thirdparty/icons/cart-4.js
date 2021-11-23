sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-4', './v4/cart-4'], function (Theme, cart4$2, cart4$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cart4$1 : cart4$2;
	var cart4 = { pathData };

	return cart4;

});
