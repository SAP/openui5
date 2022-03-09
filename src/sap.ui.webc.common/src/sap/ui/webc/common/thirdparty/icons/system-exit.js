sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/system-exit', './v4/system-exit'], function (Theme, systemExit$2, systemExit$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? systemExit$1 : systemExit$2;
	var systemExit = { pathData };

	return systemExit;

});
