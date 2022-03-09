sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/retail-store', './v4/retail-store'], function (Theme, retailStore$2, retailStore$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? retailStore$1 : retailStore$2;
	var retailStore = { pathData };

	return retailStore;

});
