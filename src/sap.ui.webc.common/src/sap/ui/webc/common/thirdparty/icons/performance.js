sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/performance', './v4/performance'], function (Theme, performance$2, performance$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? performance$1 : performance$2;
	var performance = { pathData };

	return performance;

});
