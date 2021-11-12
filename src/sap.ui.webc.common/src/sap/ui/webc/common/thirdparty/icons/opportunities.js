sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/opportunities', './v4/opportunities'], function (Theme, opportunities$2, opportunities$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? opportunities$1 : opportunities$2;
	var opportunities = { pathData };

	return opportunities;

});
