sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sap-logo-shape";
	const pathData = "M509.416 113c6 12 3 23-5 32l-227 231c-6 5-12 8-20 8h-227c-17 0-29-11-29-28V125c0-17 12-29 29-29h454c11 0 23 6 25 17z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
