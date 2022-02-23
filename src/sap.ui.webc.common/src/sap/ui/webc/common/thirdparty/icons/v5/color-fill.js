sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "color-fill";
	const pathData = "M416 0q35 0 57.5 23T496 80v320q0 34-22.5 57T416 480H96q-34 0-57-23t-23-57V80q0-34 23-57T96 0h320z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
