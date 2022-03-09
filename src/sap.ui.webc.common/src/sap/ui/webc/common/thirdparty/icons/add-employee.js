sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-employee', './v4/add-employee'], function (Theme, addEmployee$2, addEmployee$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addEmployee$1 : addEmployee$2;
	var addEmployee = { pathData };

	return addEmployee;

});
