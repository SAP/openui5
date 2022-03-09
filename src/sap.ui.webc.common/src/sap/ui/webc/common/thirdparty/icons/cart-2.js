sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cart-2', './v4/cart-2'], function (Theme, cart2$2, cart2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? cart2$1 : cart2$2;
	var cart2 = { pathData };

	return cart2;

});
