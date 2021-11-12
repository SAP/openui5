sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "person-placeholder";
	const pathData = "M358 242c74 28 125 99 125 184v57c0 17-11 29-28 29H57c-17 0-28-12-28-29v-57c0-85 51-156 125-184-26-26-40-60-40-99C114 63 177 1 256 1c80 0 142 62 142 142 0 39-14 73-40 99zM256 57c-48 0-85 37-85 86 0 48 37 85 85 85s85-37 85-85c0-49-37-86-85-86zm170 398v-29c0-79-62-142-141-142h-57c-80 0-142 63-142 142v29h340z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
