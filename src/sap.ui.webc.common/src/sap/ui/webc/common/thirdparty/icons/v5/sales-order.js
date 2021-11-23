sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sales-order";
	const pathData = "M419 46c14 0 23 9 23 23v116c0 14-9 24-23 24s-23-10-23-24V93h-46v23c0 14-10 23-24 23H187c-14 0-23-9-23-23V93h-47v325h116c14 0 24 9 24 23s-10 23-24 23H94c-14 0-23-9-23-23V69c0-14 9-23 23-23h70V23c0-14 9-23 23-23h139c14 0 24 9 24 23v23h69zM303 93V46h-93v47h93zm58 232c-7 0-11 4-11 11s4 12 11 12h23c33 0 58 26 58 58 0 30-18 54-46 58v23c0 14-9 24-23 24s-23-10-23-24v-23h-24c-14 0-23-9-23-23s9-23 23-23h58c7 0 12-5 12-12s-5-11-12-11h-23c-32 0-58-26-58-59 0-30 19-53 47-58v-23c0-14 9-23 23-23s23 9 23 23v23h23c14 0 23 10 23 24s-9 23-23 23h-58z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
