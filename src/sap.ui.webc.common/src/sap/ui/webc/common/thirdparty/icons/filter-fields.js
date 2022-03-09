sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter-fields', './v4/filter-fields'], function (Theme, filterFields$2, filterFields$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filterFields$1 : filterFields$2;
	var filterFields = { pathData };

	return filterFields;

});
