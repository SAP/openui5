sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "status-negative";
	const pathData = "M64 256q0-40 15-75t41-61 61-41 75-15 75 15 61 41 41 61 15 75-15 75-41 61-61 41-75 15-75-15-61-41-41-61-15-75zm64 0q0 26 10 49.5t27.5 41 41 27.5 49.5 10 49.5-10 41-27.5 27.5-41 10-49.5-10-49.5-27.5-41-41-27.5-49.5-10q-41 0-73 23-20 12-32 32-23 32-23 73zm288 192l32-32 64 64-32 32zm0-384l64-64 32 32-64 64zM0 32L32 0l64 64-32 32zm64 384l32 32-64 64-32-32z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var statusNegative = { pathData };

	return statusNegative;

});
