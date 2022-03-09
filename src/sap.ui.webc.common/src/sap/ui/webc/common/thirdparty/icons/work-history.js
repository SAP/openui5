sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/work-history', './v4/work-history'], function (Theme, workHistory$2, workHistory$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? workHistory$1 : workHistory$2;
	var workHistory = { pathData };

	return workHistory;

});
