sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pharmacy', './v4/pharmacy'], function (Theme, pharmacy$2, pharmacy$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pharmacy$1 : pharmacy$2;
	var pharmacy = { pathData };

	return pharmacy;

});
