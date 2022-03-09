sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/request', './v4/request'], function (Theme, request$2, request$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? request$1 : request$2;
	var request = { pathData };

	return request;

});
