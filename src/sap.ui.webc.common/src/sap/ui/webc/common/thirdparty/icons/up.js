sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/up', './v4/up'], function (Theme, up$2, up$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? up$1 : up$2;
	var up = { pathData };

	return up;

});
