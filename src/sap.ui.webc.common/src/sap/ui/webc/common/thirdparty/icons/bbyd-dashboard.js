sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/bbyd-dashboard', './v4/bbyd-dashboard'], function (Theme, bbydDashboard$2, bbydDashboard$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? bbydDashboard$1 : bbydDashboard$2;
	var bbydDashboard = { pathData };

	return bbydDashboard;

});
