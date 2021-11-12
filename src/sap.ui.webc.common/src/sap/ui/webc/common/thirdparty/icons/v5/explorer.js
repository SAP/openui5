sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "explorer";
	const pathData = "M256.5 0c140 0 255 115 255 255 0 141-115 256-255 256-141 0-256-115-256-256 0-140 115-255 256-255zm0 460c112 0 204-92 204-205 0-112-92-204-204-204-113 0-205 92-205 204 0 113 92 205 205 205zm0-383c14 0 25 11 25 25s-11 26-25 26-26-12-26-26 12-25 26-25zm89 53c10-5 23-2 31 5 7 8 10 21 5 31l-77 128c-2 4-3 5-7 7l-128 77c-10 5-23 5-31-5-8-8-10-20-5-31l77-127c2-5 3-6 7-8z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
