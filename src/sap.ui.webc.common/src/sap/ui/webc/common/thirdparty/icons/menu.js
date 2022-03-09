sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/menu', './v4/menu'], function (Theme, menu$2, menu$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? menu$1 : menu$2;
	var menu = { pathData };

	return menu;

});
