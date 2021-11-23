sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/cloud', './v4/cloud'], function (Theme, cloud$2, cloud$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? cloud$1 : cloud$2;
	var cloud = { pathData };

	return cloud;

});
