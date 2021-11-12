sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "duplicate";
	const pathData = "M409.5 102c44 0 77 34 77 77v256c0 44-33 77-77 77h-204c-44 0-77-33-77-77V179c0-43 33-77 77-77h204zm26 333V179c0-15-10-25-26-25h-204c-16 0-26 10-26 25v256c0 16 10 26 26 26h204c16 0 26-10 26-26zm-51-409c0 15-11 25-26 25h-256c-15 0-25 10-25 26v307c0 15-11 26-26 26s-26-11-26-26V77c0-44 34-77 77-77h256c15 0 26 10 26 26z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
