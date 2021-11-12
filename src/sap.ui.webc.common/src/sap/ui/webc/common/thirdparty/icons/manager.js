sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/manager', './v4/manager'], function (Theme, manager$2, manager$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? manager$1 : manager$2;
	var manager = { pathData };

	return manager;

});
