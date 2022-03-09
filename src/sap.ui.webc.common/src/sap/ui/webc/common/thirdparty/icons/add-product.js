sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-product', './v4/add-product'], function (Theme, addProduct$2, addProduct$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addProduct$1 : addProduct$2;
	var addProduct = { pathData };

	return addProduct;

});
