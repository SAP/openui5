sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "picture";
	const pathData = "M157 114c-24 0-43 19-43 43s19 43 43 43 43-19 43-43-19-43-43-43zM427 1c48 0 85 37 85 85v341c0 48-37 85-85 85H86c-48 0-85-37-85-85V86C1 38 38 1 86 1h341zM86 58c-17 0-28 11-31 28v329l122-122c11-8 23-11 34-5l37 19 99-99c12-8 23-11 34-6l74 37V86c0-17-11-28-28-28H86zm341 397c17 0 28-11 25-25V305l-79-40-71 71 22 11c12 6 18 23 12 37s-23 17-37 11l-54-28-40-20L97 455h330z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
