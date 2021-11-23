sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/building', './v4/building'], function (Theme, building$2, building$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? building$1 : building$2;
	var building = { pathData };

	return building;

});
