sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/menu2', './v4/menu2'], function (Theme, menu2$2, menu2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? menu2$1 : menu2$2;
	var menu2 = { pathData };

	return menu2;

});
