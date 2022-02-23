sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "bar-chart";
	const pathData = "M330 219q17 0 27 10t10 27v219q0 17-10 27t-27 10-27-10-10-27V256q0-17 10-27t27-10zM476 0q17 0 27 10t10 26v439q0 17-10 27t-27 10-26.5-10-9.5-27V36q0-16 9.5-26T476 0zM184 110q17 0 26.5 9.5T220 146v329q0 17-9.5 27T184 512t-27-10-10-27V146q0-17 10-26.5t27-9.5zM37 329q17 0 27 10t10 27v109q0 17-10 27t-27 10-26.5-10T1 475V366q0-17 9.5-27T37 329z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
