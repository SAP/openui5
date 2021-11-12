sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/product', './v4/product'], function (Theme, product$2, product$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? product$1 : product$2;
	var product = { pathData };

	return product;

});
