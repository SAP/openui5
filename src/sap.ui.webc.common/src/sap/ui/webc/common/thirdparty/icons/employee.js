sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee', './v4/employee'], function (Theme, employee$2, employee$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? employee$1 : employee$2;
	var employee = { pathData };

	return employee;

});
