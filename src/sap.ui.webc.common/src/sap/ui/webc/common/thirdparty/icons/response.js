sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/response', './v4/response'], function (Theme, response$2, response$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? response$1 : response$2;
	var response = { pathData };

	return response;

});
