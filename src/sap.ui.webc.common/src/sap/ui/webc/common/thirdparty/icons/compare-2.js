sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/compare-2', './v4/compare-2'], function (Theme, compare2$2, compare2$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? compare2$1 : compare2$2;
	var compare2 = { pathData };

	return compare2;

});
