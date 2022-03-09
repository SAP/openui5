sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/kpi-managing-my-area', './v4/kpi-managing-my-area'], function (Theme, kpiManagingMyArea$2, kpiManagingMyArea$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? kpiManagingMyArea$1 : kpiManagingMyArea$2;
	var kpiManagingMyArea = { pathData };

	return kpiManagingMyArea;

});
