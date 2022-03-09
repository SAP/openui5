sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/home', './v4/home'], function (Theme, home$2, home$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? home$1 : home$2;
	var home = { pathData };

	return home;

});
