sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/heading1', './v4/heading1'], function (Theme, heading1$2, heading1$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? heading1$1 : heading1$2;
	var heading1 = { pathData };

	return heading1;

});
