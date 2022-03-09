sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/nav-back', './v4/nav-back'], function (Theme, navBack$2, navBack$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navBack$1 : navBack$2;
	var navBack = { pathData };

	return navBack;

});
