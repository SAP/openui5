sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/decline', './v4/decline'], function (Theme, decline$2, decline$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? decline$1 : decline$2;
	var decline = { pathData };

	return decline;

});
