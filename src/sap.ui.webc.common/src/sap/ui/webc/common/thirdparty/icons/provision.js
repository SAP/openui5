sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/provision', './v4/provision'], function (Theme, provision$2, provision$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? provision$1 : provision$2;
	var provision = { pathData };

	return provision;

});
