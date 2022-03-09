sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/status-completed', './v4/status-completed'], function (Theme, statusCompleted$2, statusCompleted$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? statusCompleted$1 : statusCompleted$2;
	var statusCompleted = { pathData };

	return statusCompleted;

});
