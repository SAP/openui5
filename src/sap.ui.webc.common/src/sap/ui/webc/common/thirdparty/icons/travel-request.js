sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/travel-request', './v4/travel-request'], function (Theme, travelRequest$2, travelRequest$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? travelRequest$1 : travelRequest$2;
	var travelRequest = { pathData };

	return travelRequest;

});
