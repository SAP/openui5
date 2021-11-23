sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/instance', './v4/instance'], function (Theme, instance$2, instance$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? instance$1 : instance$2;
	var instance = { pathData };

	return instance;

});
