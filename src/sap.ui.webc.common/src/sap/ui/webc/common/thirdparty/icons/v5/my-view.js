sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "my-view";
	const pathData = "M435 0c44 0 77 33 77 76v256c0 43-33 76-77 76h-94l12 51h31c15 0 26 11 26 26s-11 26-26 26H129c-16 0-26-11-26-26s10-26 26-26h30l13-51H77c-43 0-76-33-76-76V76C1 33 34 0 77 0h358zM302 459l-12-51h-67l-13 51h92zm159-127V76c0-15-11-25-26-25H77c-15 0-25 10-25 25v256c0 15 10 25 25 25h358c16 0 26-10 26-25zm-118-74c10 5 16 17 13 28-3 12-13 20-26 20H177c-13 0-23-8-25-20-3-11 2-23 12-28l44-21c10-5 23-7 33-7h28c13 0 23 2 33 7zm-87-156c29 0 51 23 51 51s-22 51-51 51c-28 0-51-23-51-51s23-51 51-51z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
