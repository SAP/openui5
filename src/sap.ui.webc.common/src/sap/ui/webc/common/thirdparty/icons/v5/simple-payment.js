sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "simple-payment";
	const pathData = "M243 205c-7 0-13 5-13 13s6 13 13 13h26c36 0 64 28 64 64 0 33-21 58-51 63v26c0 15-11 26-26 26s-26-11-26-26v-26h-25c-15 0-26-10-26-25s11-26 26-26h64c7 0 13-5 13-12 0-8-6-13-13-13h-26c-36 0-64-28-64-64 0-33 21-59 51-64v-26c0-15 11-25 26-25s26 10 26 25v26h25c15 0 26 10 26 26 0 15-11 25-26 25h-64zM358 1c44 0 77 33 77 76v358c0 44-33 77-77 77H154c-44 0-77-33-77-77V77c0-43 33-76 77-76h204zm26 434V77c0-15-10-25-26-25H154c-15 0-26 10-26 25v358c0 15 11 26 26 26h204c16 0 26-11 26-26z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
