sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "status-completed";
	const pathData = "M399 32q35 0 58 24t23 56v289q0 33-23 56t-58 23H111q-33 0-56-23t-23-56V112q0-16 6-30.5T55 56t25-17.5 31-6.5h288zm17 74q0-4-3-7.5T403 95H107q-5 0-8 3.5t-3 7.5v299q0 11 11 11h296q3 0 8-1.5t5-9.5V106z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var statusCompleted = { pathData };

	return statusCompleted;

});
