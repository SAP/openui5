sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-filter', './v4/add-filter'], function (Theme, addFilter$2, addFilter$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? addFilter$1 : addFilter$2;
	var addFilter = { pathData };

	return addFilter;

});
