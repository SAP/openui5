sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/org-chart', './v4/org-chart'], function (Theme, orgChart$2, orgChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? orgChart$1 : orgChart$2;
	var orgChart = { pathData };

	return orgChart;

});
