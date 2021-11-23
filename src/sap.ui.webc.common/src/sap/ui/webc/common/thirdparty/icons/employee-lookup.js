sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/employee-lookup', './v4/employee-lookup'], function (Theme, employeeLookup$2, employeeLookup$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? employeeLookup$1 : employeeLookup$2;
	var employeeLookup = { pathData };

	return employeeLookup;

});
