sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "print";
	const pathData = "M0 127q0-13 9-22.5T32 95h64V31q0-13 9-22.5T128-1h256q13 0 22.5 9.5T416 31v64h64q13 0 22.5 9.5T512 127v160q0 14-9.5 23t-22.5 9h-64v160q0 14-9.5 23t-22.5 9H128q-14 0-23-9t-9-23V319H32q-14 0-23-9t-9-23V127zm128 128v224h256V255H128zm-32 32v-32q0-13 9-22.5t23-9.5h256q13 0 22.5 9.5T416 255v32h64V127H32v160h64zm32-192h256V31H128v64zm64 320v-32h128v32H192zm0-96h128v32H192v-32zm160-144q0-6 4.5-11t11.5-5h64q7 0 11.5 5t4.5 11q0 16-16 16h-64q-16 0-16-16z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var print = { pathData };

	return print;

});
