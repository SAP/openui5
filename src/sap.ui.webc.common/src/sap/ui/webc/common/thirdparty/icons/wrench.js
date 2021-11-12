sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/wrench', './v4/wrench'], function (Theme, wrench$2, wrench$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? wrench$1 : wrench$2;
	var wrench = { pathData };

	return wrench;

});
