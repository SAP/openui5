sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-error', './v4/status-error'], function (Theme, statusError$2, statusError$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? statusError$1 : statusError$2;
	var statusError = { pathData };

	return statusError;

});
