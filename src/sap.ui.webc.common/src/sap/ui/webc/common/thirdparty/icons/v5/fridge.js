sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "fridge";
	const pathData = "M384.5 1c43 0 76 33 76 76v358c0 43-33 77-76 77h-256c-43 0-77-34-77-77V77c0-43 34-76 77-76h256zm-256 51c-15 0-25 10-25 25v102h306V77c0-15-10-25-25-25h-256zm256 409c15 0 25-11 25-26V231h-306v204c0 15 10 26 25 26h256zm-205-307c-15 0-25-10-25-26v-25c0-16 10-26 25-26 16 0 26 10 26 26v25c0 16-10 26-26 26zm0 102c16 0 26 10 26 26v76c0 16-10 26-26 26-15 0-25-10-25-26v-76c0-16 10-26 25-26z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
