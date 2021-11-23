sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "building";
	const pathData = "M451 269c15 0 24 10 24 24v195c0 15-9 24-24 24H62c-15 0-25-9-25-24V196c0-14 10-24 25-24h95v-49c0-7 4-14 9-19l66-42V26c0-15 10-25 24-25 15 0 25 10 25 25v36l60 42c8 5 10 12 10 19v146h100zm-24 49h-76v48h76v-48zm-124 48v-48h-98v48h98zm-98-97h98v-49h-98v49zm0-134v37h98v-37l-49-31zM86 220v49h71v-49H86zm71 98H86v48h71v-48zM86 464h71v-49H86v49zm119 0h98v-49h-98v49zm146 0h76v-49h-76v49z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
