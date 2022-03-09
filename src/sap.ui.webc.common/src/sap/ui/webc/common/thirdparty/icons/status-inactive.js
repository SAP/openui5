sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-inactive', './v4/status-inactive'], function (Theme, statusInactive$2, statusInactive$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusInactive$1 : statusInactive$2;
	var statusInactive = { pathData };

	return statusInactive;

});
