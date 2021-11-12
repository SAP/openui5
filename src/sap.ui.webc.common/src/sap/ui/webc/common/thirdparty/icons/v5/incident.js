sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "incident";
	const pathData = "M257 0c141 0 256 114 256 256 0 141-115 256-256 256C115 512 1 397 1 256 1 114 115 0 257 0zm40 279c24-13 69-36 69-95 0-53-49-96-109-96s-109 43-109 96c0 18 14 32 32 32s32-14 32-32c0-17 21-32 45-32s45 15 45 32c0 18-10 25-35 38-18 10-42 23-42 52 0 17 14 32 32 32 14 0 26-9 30-22 3-1 7-3 10-5zm-40 130c21 0 38-17 38-38s-17-38-38-38-39 17-39 38 18 38 39 38z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
