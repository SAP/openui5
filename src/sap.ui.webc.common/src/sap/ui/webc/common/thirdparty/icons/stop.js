sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/stop', './v4/stop'], function (Theme, stop$2, stop$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? stop$1 : stop$2;
	var stop = { pathData };

	return stop;

});
