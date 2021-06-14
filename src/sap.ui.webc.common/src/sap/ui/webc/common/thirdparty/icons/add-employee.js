sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "add-employee";
	const pathData = "M288 448q0-41-27.5-68.5T192 352h-64q-41 0-68.5 27.5T32 448v32h256v-32zM160 288q26 0 45-19t19-45q0-27-18.5-45.5T160 160t-45.5 18.5T96 224q0 26 19 45t45 19zm96-64q0 41-27.5 68.5T160 320h32q26 0 48.5 10t42.5 27q37 40 37 91v64H0v-64q0-27 10-50t27.5-40.5 41-27.5 49.5-10h32q-41 0-68.5-27.5T64 224t27.5-68.5T160 128t68.5 27.5T256 224zM512 96v32h-96v96h-32v-96h-96V96h96V0h32v96h96z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var addEmployee = { pathData };

	return addEmployee;

});
