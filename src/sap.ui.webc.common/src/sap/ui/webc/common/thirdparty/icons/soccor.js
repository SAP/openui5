sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/soccor', './v4/soccor'], function (Theme, soccor$2, soccor$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? soccor$1 : soccor$2;
	var soccor = { pathData };

	return soccor;

});
