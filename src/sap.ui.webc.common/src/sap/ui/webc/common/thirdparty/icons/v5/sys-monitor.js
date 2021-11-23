sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sys-monitor";
	const pathData = "M435.5 1c43 0 76 33 76 77v255c0 43-33 77-76 77h-103v51h51c16 0 26 10 26 25 0 16-10 26-26 26h-255c-15 0-26-10-26-26 0-15 11-25 26-25h51v-51h-102c-44 0-77-34-77-77V78c0-44 33-77 77-77h358zm-154 460v-51h-51v51h51zm179-128V78c0-16-10-26-25-26h-358c-15 0-26 10-26 26v255c0 15 11 26 26 26h358c15 0 25-11 25-26z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
