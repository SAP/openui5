sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/official-service', './v4/official-service'], function (Theme, officialService$2, officialService$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? officialService$1 : officialService$2;
	var officialService = { pathData };

	return officialService;

});
