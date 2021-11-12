sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/log', './v4/log'], function (Theme, log$2, log$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? log$1 : log$2;
	var log = { pathData };

	return log;

});
