sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "employee-approvals";
	const pathData = "M320 512H0v-64q0-27 10-50t27.5-40.5 41-27.5 49.5-10h32q-40 0-68-28t-28-68 28-68 68-28 68 28 28 68-28 68-68 28h32q27 0 50 10t40.5 27.5T310 398t10 50v64zM32 448v32h256v-32q0-40-28-68t-68-28h-64q-40 0-68 28t-28 68zm128-160q26 0 45-19t19-45q0-27-19-45.5T160 160t-45 18.5T96 224q0 26 19 45t45 19zm137-180l32-32 50 51L480 0l32 32-132 159z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var employeeApprovals = { pathData };

	return employeeApprovals;

});
