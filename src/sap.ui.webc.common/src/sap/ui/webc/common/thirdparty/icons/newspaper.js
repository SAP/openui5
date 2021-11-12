sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/newspaper', './v4/newspaper'], function (Theme, newspaper$2, newspaper$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? newspaper$1 : newspaper$2;
	var newspaper = { pathData };

	return newspaper;

});
