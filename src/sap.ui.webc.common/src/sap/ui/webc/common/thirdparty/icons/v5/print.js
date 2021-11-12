sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "print";
	const pathData = "M511.5 205v128c0 43-33 77-76 77h-26v76c0 16-10 26-25 26h-256c-15 0-25-10-25-26v-76h-26c-43 0-77-34-77-77V205c0-43 34-76 77-76h26V26c0-15 10-25 25-25h256c15 0 25 10 25 25v103h26c43 0 76 33 76 76zm-51 128V205c0-15-10-25-25-25h-358c-15 0-25 10-25 25v128c0 15 10 25 25 25h26v-51c0-15 10-25 25-25h256c15 0 25 10 25 25v51h26c15 0 25-10 25-25zm-306 128h204V333h-204v128zm204-409h-204v77h204V52zm26 179c0-16 10-26 25-26 16 0 26 10 26 26 0 15-10 25-26 25-15 0-25-10-25-25z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
