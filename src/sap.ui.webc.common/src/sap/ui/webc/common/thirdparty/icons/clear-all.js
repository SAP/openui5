sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/clear-all', './v4/clear-all'], function (Theme, clearAll$2, clearAll$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? clearAll$1 : clearAll$2;
	var clearAll = { pathData };

	return clearAll;

});
