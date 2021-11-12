sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sys-add";
	const pathData = "M256.5 1c140 0 255 115 255 256 0 140-115 255-255 255-141 0-256-115-256-255 0-141 115-256 256-256zm0 460c112 0 204-92 204-204 0-113-92-205-204-205-113 0-205 92-205 205 0 112 92 204 205 204zm76-230c16 0 26 11 26 26s-10 25-26 25h-51v52c0 15-10 25-25 25s-26-10-26-25v-52h-51c-15 0-25-10-25-25s10-26 25-26h51v-51c0-15 11-25 26-25s25 10 25 25v51h51z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
