sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "cancel";
	const pathData = "M256 0c141 0 256 115 256 256 0 140-115 255-256 255C116 511 1 396 1 256 1 115 116 0 256 0zM52 256c0 112 92 204 204 204 46 0 90-15 126-43L96 130c-29 36-44 80-44 126zm365 125c29-36 44-79 44-125 0-113-92-205-205-205-46 0-89 15-125 44z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
