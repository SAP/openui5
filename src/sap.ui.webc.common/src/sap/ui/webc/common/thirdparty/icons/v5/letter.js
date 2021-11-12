sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "letter";
	const pathData = "M460.5 64c28 0 51 23 51 51v256c0 28-23 51-51 51h-408c-29 0-52-23-52-51V115c0-28 23-51 52-51h408zm0 307V115h-408v256h408zm-332-128c-15 0-25-10-25-26 0-15 10-25 25-25h128c15 0 26 10 26 25 0 16-11 26-26 26h-128zm256-26c-16 0-26-10-26-25v-26c0-15 10-25 26-25h25c16 0 26 10 26 25v26c0 15-10 25-26 25h-25zm-256 103c-15 0-25-11-25-26s10-25 25-25h77c15 0 25 10 25 25s-10 26-25 26h-77z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
