sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/leads', './v4/leads'], function (Theme, leads$2, leads$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? leads$1 : leads$2;
	var leads = { pathData };

	return leads;

});
