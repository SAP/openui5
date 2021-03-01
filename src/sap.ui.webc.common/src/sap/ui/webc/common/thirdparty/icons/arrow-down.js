sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "arrow-down";
	const pathData = "M256 0q53 0 100 20t81.5 54.5T492 156t20 100-20 99.5-54.5 81.5-81.5 55-100 20-99.5-20T75 437t-55-81.5T0 256t20-100 55-81.5T156.5 20 256 0zm0 480q46 0 87-17.5t71.5-48 48-71.5 17.5-87-17.5-87-48-71.5-71.5-48T256 32t-87 17.5-71.5 48-48 71.5T32 256t17.5 87 48 71.5 71.5 48 87 17.5zm99-251q11-12 23 0 5 5 5 11t-5 11l-99 92q-10 9-23 9t-22-9l-101-92q-5-5-5-11.5t5-11.5 11.5-5 11.5 5l95 87q5 6 11 0z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var arrowDown = { pathData };

	return arrowDown;

});
