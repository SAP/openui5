sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/header', './v4/header'], function (Theme, header$2, header$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? header$1 : header$2;
	var header = { pathData };

	return header;

});
