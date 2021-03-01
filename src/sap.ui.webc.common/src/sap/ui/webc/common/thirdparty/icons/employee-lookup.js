sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "employee-lookup";
	const pathData = "M0 384v-64q0-27 10-50t27.5-40.5 41-27.5 49.5-10h32q-40 0-68-28T64 96t28-68 68-28 68 28 28 68-28 68-68 28h32q30 0 56 13t43 35q-15 7-26 18-13-16-31.5-25t-41.5-9h-64q-40 0-68 28t-28 68v32h192q0 5 1.5 13t3.5 19H0zm256-32q0-40 28-68t68-28 68 28 28 68q0 29-18 55l82 82-22 23-82-82q-25 18-56 18-40 0-68-28t-28-68zm96 64q26 0 45-19t19-45q0-27-19-45.5T352 288t-45 18.5-19 45.5q0 26 19 45t45 19zM96 96q0 26 19 45t45 19 45-19 19-45q0-27-19-45.5T160 32t-45 18.5T96 96z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var employeeLookup = { pathData };

	return employeeLookup;

});
