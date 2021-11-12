sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "bar-chart";
	const pathData = "M330 219c22 0 37 15 37 37v219c0 22-15 37-37 37s-37-15-37-37V256c0-22 15-37 37-37zM476 0c22 0 37 15 37 36v439c0 22-15 37-37 37s-36-15-36-37V36c0-21 14-36 36-36zM184 110c22 0 36 14 36 36v329c0 22-14 37-36 37s-37-15-37-37V146c0-22 15-36 37-36zM37 329c22 0 37 15 37 37v109c0 22-15 37-37 37S1 497 1 475V366c0-22 14-37 36-37z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
