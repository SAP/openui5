sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "minimize";
	const pathData = "M480 448q14 0 23 9.5t9 22.5q0 14-9 23t-23 9H32q-14 0-23-9t-9-23q0-13 9-22.5t23-9.5h448z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var minimize = { pathData };

	return minimize;

});
