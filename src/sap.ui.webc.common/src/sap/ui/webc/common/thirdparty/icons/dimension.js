sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/dimension', './v4/dimension'], function (Theme, dimension$2, dimension$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? dimension$1 : dimension$2;
	var dimension = { pathData };

	return dimension;

});
