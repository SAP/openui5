sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-3', './v4/cart-3'], function (Theme, cart3$2, cart3$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cart3$1 : cart3$2;
	var cart3 = { pathData };

	return cart3;

});
