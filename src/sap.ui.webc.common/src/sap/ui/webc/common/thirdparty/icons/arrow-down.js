sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-down', './v4/arrow-down'], function (Theme, arrowDown$2, arrowDown$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowDown$1 : arrowDown$2;
	var arrowDown = { pathData };

	return arrowDown;

});
