sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-5', './v4/cart-5'], function (Theme, cart5$2, cart5$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cart5$1 : cart5$2;
	var cart5 = { pathData };

	return cart5;

});
