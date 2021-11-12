sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-critical', './v4/status-critical'], function (Theme, statusCritical$2, statusCritical$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? statusCritical$1 : statusCritical$2;
	var statusCritical = { pathData };

	return statusCritical;

});
