sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "system-exit";
	const pathData = "M256 1c141 0 256 115 256 256 0 140-115 255-256 255C116 512 1 397 1 257 1 116 116 1 256 1zm0 460c113 0 205-92 205-204 0-113-92-205-205-205-112 0-204 92-204 205 0 112 92 204 204 204zm18-324l77 76c10 11 10 26 0 36s-26 10-36 0l-59-59-58 59c-11 10-26 10-36 0s-10-25 0-36l76-76c11-11 26-11 36 0zm0 102l77 77c10 10 10 25 0 35-10 11-26 11-36 0l-59-58-58 58c-11 11-26 11-36 0-10-10-10-25 0-35l76-77c11-10 26-10 36 0z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
