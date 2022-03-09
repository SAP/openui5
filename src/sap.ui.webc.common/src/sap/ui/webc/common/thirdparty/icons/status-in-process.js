sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-in-process', './v4/status-in-process'], function (Theme, statusInProcess$2, statusInProcess$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusInProcess$1 : statusInProcess$2;
	var statusInProcess = { pathData };

	return statusInProcess;

});
