sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/call', './v4/call'], function (Theme, call$2, call$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? call$1 : call$2;
	var call = { pathData };

	return call;

});
