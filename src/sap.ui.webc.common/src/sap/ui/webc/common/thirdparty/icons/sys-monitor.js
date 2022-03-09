sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sys-monitor', './v4/sys-monitor'], function (Theme, sysMonitor$2, sysMonitor$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? sysMonitor$1 : sysMonitor$2;
	var sysMonitor = { pathData };

	return sysMonitor;

});
