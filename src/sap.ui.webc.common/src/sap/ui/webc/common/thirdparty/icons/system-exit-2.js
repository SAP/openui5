sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/system-exit-2', './v4/system-exit-2'], function (Theme, systemExit2$2, systemExit2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? systemExit2$1 : systemExit2$2;
	var systemExit2 = { pathData };

	return systemExit2;

});
