sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/duplicate', './v4/duplicate'], function (Theme, duplicate$2, duplicate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? duplicate$1 : duplicate$2;
	var duplicate = { pathData };

	return duplicate;

});
