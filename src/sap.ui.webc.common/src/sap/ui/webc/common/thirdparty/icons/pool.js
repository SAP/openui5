sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pool', './v4/pool'], function (Theme, pool$2, pool$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pool$1 : pool$2;
	var pool = { pathData };

	return pool;

});
