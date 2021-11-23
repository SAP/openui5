sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "play";
	const pathData = "M256 2c141 0 256 115 256 255 0 141-115 256-256 256C116 513 1 398 1 257 1 117 116 2 256 2zm0 459c113 0 205-92 205-204S369 53 256 53C144 53 52 145 52 257s92 204 204 204zm-10-301l102 77c6 5 11 12 11 20s-5 15-11 20l-102 77c-7 5-18 8-25 3-8-5-16-13-16-23V180c0-10 5-17 16-23 7-5 20-2 25 3z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
