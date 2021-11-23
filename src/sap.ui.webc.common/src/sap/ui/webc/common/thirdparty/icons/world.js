sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/world', './v4/world'], function (Theme, world$2, world$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? world$1 : world$2;
	var world = { pathData };

	return world;

});
