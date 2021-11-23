sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drill-down', './v4/drill-down'], function (Theme, drillDown$2, drillDown$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? drillDown$1 : drillDown$2;
	var drillDown = { pathData };

	return drillDown;

});
