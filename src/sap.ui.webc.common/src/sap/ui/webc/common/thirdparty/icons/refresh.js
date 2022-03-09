sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/refresh', './v4/refresh'], function (Theme, refresh$2, refresh$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? refresh$1 : refresh$2;
	var refresh = { pathData };

	return refresh;

});
