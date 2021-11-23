sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/value-help', './v4/value-help'], function (Theme, valueHelp$2, valueHelp$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? valueHelp$1 : valueHelp$2;
	var valueHelp = { pathData };

	return valueHelp;

});
