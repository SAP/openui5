sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "calendar";
	const pathData = "M410.5 51c43 0 76 33 76 77v307c0 43-33 77-76 77h-308c-43 0-76-34-76-77V128c0-44 33-77 76-77h52V25c0-15 10-25 25-25 16 0 26 10 26 25v26h102V25c0-15 10-25 26-25 15 0 25 10 25 25v26h52zm-308 51c-15 0-25 10-25 26v76h358v-76c0-16-10-26-25-26h-52v26c0 15-10 25-25 25-16 0-26-10-26-25v-26h-102v26c0 15-10 25-26 25-15 0-25-10-25-25v-26h-52zm308 358c15 0 25-10 25-25V256h-358v179c0 15 10 25 25 25h308z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
