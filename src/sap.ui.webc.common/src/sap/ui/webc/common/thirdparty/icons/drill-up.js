sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drill-up', './v4/drill-up'], function (Theme, drillUp$2, drillUp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? drillUp$1 : drillUp$2;
	var drillUp = { pathData };

	return drillUp;

});
