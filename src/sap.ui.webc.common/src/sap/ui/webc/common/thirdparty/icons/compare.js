sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/compare', './v4/compare'], function (Theme, compare$2, compare$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? compare$1 : compare$2;
	var compare = { pathData };

	return compare;

});
