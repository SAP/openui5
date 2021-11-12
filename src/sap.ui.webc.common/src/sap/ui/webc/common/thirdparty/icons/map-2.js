sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/map-2', './v4/map-2'], function (Theme, map2$2, map2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? map2$1 : map2$2;
	var map2 = { pathData };

	return map2;

});
