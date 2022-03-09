sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map', './v4/map'], function (Theme, map$2, map$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? map$1 : map$2;
	var map = { pathData };

	return map;

});
