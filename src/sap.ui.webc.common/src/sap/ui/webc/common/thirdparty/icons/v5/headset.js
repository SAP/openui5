sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "headset";
	const pathData = "M256.5 1c128 0 230 102 230 230v128c0 84-69 153-154 153h-76c-16 0-26-10-26-26v-25c0-16 10-26 26-26 15 0 25 10 25 26h51c26 0 49-11 67-26h-41c-15 0-26-10-26-25V256c0-15 11-25 26-25h77c0-100-80-179-179-179-100 0-179 79-179 179h77c15 0 25 10 25 25v154c0 15-10 25-25 25h-52c-43 0-76-33-76-76V231c0-128 102-230 230-230zm-128 281h-51v77c0 15 10 25 25 25h26V282zm256 0v102h25c15 0 26-10 26-25v-77h-51z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
