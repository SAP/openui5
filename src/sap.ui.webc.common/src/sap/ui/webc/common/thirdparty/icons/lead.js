sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/lead', './v4/lead'], function (Theme, lead$2, lead$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? lead$1 : lead$2;
	var lead = { pathData };

	return lead;

});
