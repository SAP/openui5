sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/error', './v4/error'], function (Theme, error$2, error$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? error$1 : error$2;
	var error = { pathData };

	return error;

});
