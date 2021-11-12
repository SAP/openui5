sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/shield', './v4/shield'], function (Theme, shield$2, shield$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? shield$1 : shield$2;
	var shield = { pathData };

	return shield;

});
