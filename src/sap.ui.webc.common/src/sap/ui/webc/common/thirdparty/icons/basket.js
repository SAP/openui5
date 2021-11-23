sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/basket', './v4/basket'], function (Theme, basket$2, basket$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? basket$1 : basket$2;
	var basket = { pathData };

	return basket;

});
