sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "current-stock";
	const pathData = "M451 243L292 478 124 243 292 8z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var currentStock = { pathData };

	return currentStock;

});
