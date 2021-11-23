sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map-3', './v4/map-3'], function (Theme, map3$2, map3$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? map3$1 : map3$2;
	var map3 = { pathData };

	return map3;

});
