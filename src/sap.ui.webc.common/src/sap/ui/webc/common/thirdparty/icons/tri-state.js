sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tri-state', './v4/tri-state'], function (Theme, triState$2, triState$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? triState$1 : triState$2;
	var triState = { pathData };

	return triState;

});
