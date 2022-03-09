sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/retail-store-manager', './v4/retail-store-manager'], function (Theme, retailStoreManager$2, retailStoreManager$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? retailStoreManager$1 : retailStoreManager$2;
	var retailStoreManager = { pathData };

	return retailStoreManager;

});
