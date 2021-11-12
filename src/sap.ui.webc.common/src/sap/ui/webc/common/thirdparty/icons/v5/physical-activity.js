sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "physical-activity";
	const pathData = "M320 102c-28 0-51-23-51-51 0-29 23-51 51-51s51 22 51 51c0 28-23 51-51 51zm115 141c14 0 26 12 26 26s-12 25-26 25c-64 0-111-34-140-65l-11 57 67 66c5 5 8 11 8 18v116c0 14-12 26-26 26s-26-12-26-26V380l-43-42-30 69c-4 10-14 15-24 15L74 409c-14-1-24-13-23-27 2-14 14-24 28-23l115 11 38-84 17-86-70 13v56c0 14-11 25-25 25s-26-11-26-25v-76c0-12 9-23 21-25l129-26c11-1 22 4 27 14 0 1 45 87 130 87z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
