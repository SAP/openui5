sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/activate', './v4/activate'], function (Theme, activate$2, activate$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? activate$1 : activate$2;
	var activate = { pathData };

	return activate;

});
