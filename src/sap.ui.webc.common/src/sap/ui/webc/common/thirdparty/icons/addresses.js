sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/addresses', './v4/addresses'], function (Theme, addresses$2, addresses$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addresses$1 : addresses$2;
	var addresses = { pathData };

	return addresses;

});
